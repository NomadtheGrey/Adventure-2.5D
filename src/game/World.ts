import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import { WorldAssembler } from './WorldAssembler';
import itemsConfig from './config/items.json';

export interface WorldObject {
  id: string;
  mesh: THREE.Object3D;
  isStatic: boolean;
  type: 'wall' | 'tree' | 'item' | 'gate';
}

export class World {
  scene: THREE.Scene;
  objects: WorldObject[] = [];
  spatialGrid: Map<string, WorldObject[]> = new Map();
  cellSize = 20;
  roomSize = 60;
  gridSize = 8;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    this.createFloor();
    
    const assetManager = new WorldAssetManager(this.scene, this.objects, (obj) => this.addToGrid(obj));
    const assembler = new WorldAssembler(this.scene, assetManager, this.gridSize, this.roomSize);
    
    assembler.generate();
    this.spawnItems();
    this.spawnDummyItems();
  }

  private spawnDummyItems() {
    const dummyItems = [
        { type: 'KEY_GOLD', pos: { x: 10, y: 1, z: 10 }, color: 0xffd700 },
        { type: 'KEY_SILVER', pos: { x: -20, y: 1, z: 5 }, color: 0xc0c0c0 },
        { type: 'MAGNET', pos: { x: 5, y: 1, z: -15 }, color: 0x0000ff }
    ];

    dummyItems.forEach(item => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshLambertMaterial({ color: item.color, emissive: item.color, emissiveIntensity: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(item.pos.x, item.pos.y, item.pos.z);
        mesh.userData = { itemType: item.type };
        this.scene.add(mesh);
        const obj: WorldObject = { id: `dummy-${item.type}-${Math.random()}`, mesh, isStatic: false, type: 'item' };
        this.objects.push(obj);
        this.addToGrid(obj);
    });
  }

  public addToGrid(obj: WorldObject) {
    const x = Math.floor(obj.mesh.position.x / this.cellSize);
    const z = Math.floor(obj.mesh.position.z / this.cellSize);
    const key = `${x},${z}`;
    
    const cell = this.spatialGrid.get(key) || [];
    if (!this.spatialGrid.has(key)) this.spatialGrid.set(key, cell);
    cell.push(obj);
  }

  public getNearby(pos: THREE.Vector3, radius: number): WorldObject[] {
    const cx = Math.floor(pos.x / this.cellSize);
    const cz = Math.floor(pos.z / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);

    const keys = Array.from({ length: 2 * range + 1 }, (_, i) => cx - range + i)
      .flatMap(x => Array.from({ length: 2 * range + 1 }, (_, j) => `${x},${cz - range + j}`));

    return keys.flatMap(key => this.spatialGrid.get(key) || []);
  }

  public removeFromGrid(obj: WorldObject) {
    const x = Math.floor(obj.mesh.position.x / this.cellSize);
    const z = Math.floor(obj.mesh.position.z / this.cellSize);
    const key = `${x},${z}`;
    const cell = this.spatialGrid.get(key);
    if (!cell) return;
    
    const idx = cell.indexOf(obj);
    if (idx !== -1) cell.splice(idx, 1);
  }

  private createFloor() {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const material = new THREE.MeshLambertMaterial({ color: 0x1a4d1a });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  private spawnItems() {
    const { spawns, visuals } = itemsConfig;

    spawns.forEach(item => {
      const geo = new THREE.BoxGeometry(visuals.size, visuals.size, visuals.size);
      const mat = new THREE.MeshLambertMaterial({ color: item.color, emissive: item.color, emissiveIntensity: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(item.pos.x, item.pos.y, item.pos.z);
      mesh.userData = { itemType: item.type };
      
      mesh.onBeforeRender = () => {
          mesh.position.y = item.pos.y + Math.sin(performance.now() * visuals.floatFrequency) * visuals.floatAmplitude;
          mesh.rotation.y += visuals.rotationSpeed;
      };

      this.scene.add(mesh);
      const obj: WorldObject = { id: `item-${item.type}-${Math.random()}`, mesh, isStatic: false, type: 'item' };
      this.objects.push(obj);
      this.addToGrid(obj);
    });
  }
}
