import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import { WorldAssembler } from './WorldAssembler';
import { ItemType, ITEMS } from './GameState';
import itemsConfig from './config/items.json';
import { TextureAssets } from './assets/TextureAssets';
import { GateAssets } from './assets/GateAssets';

export interface WorldObject {
  id: string;
  mesh: THREE.Object3D;
  isStatic: boolean;
  isCollected?: boolean;
  type: 'wall' | 'tree' | 'item' | 'gate' | 'bush' | 'water' | 'throne';
}

export class World {
  scene: THREE.Scene;
  objects: WorldObject[] = [];
  spatialGrid: Map<string, WorldObject[]> = new Map();
  cellSize = 20;
  roomSize = 60;
  gridSize = 11;

  private assetManager!: WorldAssetManager;
  private worldGroup: THREE.Group;
  private interiorGroup: THREE.Group;

  constructor(scene: THREE.Scene, worldGroup: THREE.Group, interiorGroup: THREE.Group) {
    this.scene = scene;
    this.worldGroup = worldGroup;
    this.interiorGroup = interiorGroup;
    this.init();
  }

  private init() {
    this.createFloor();
    
    this.assetManager = new WorldAssetManager(this.scene, this.worldGroup, this.interiorGroup, this.objects, (obj) => this.addToGrid(obj));
    const assembler = new WorldAssembler(this.scene, this.assetManager, this.gridSize, this.roomSize, this);
    
    assembler.generate();
    this.spawnItems();
  }

  public spawnItemAt(type: ItemType, pos: THREE.Vector3) {
    const color = ITEMS[type]?.color || 0xffffff;
    
    let mesh: THREE.Group | THREE.Mesh;
    if (type === ItemType.MAGNET) mesh = this.assetManager.createMagnetGeometry();
    else if (type.startsWith('KEY_')) mesh = this.assetManager.createKeyGeometry(color);
    else if (type === ItemType.SPEAR) mesh = this.assetManager.createSpearGeometry();
    else if (type === ItemType.BRIDGE) mesh = this.assetManager.createBridgeGeometry();
    else if (type === ItemType.CHALICE) mesh = this.assetManager.createChaliceGeometry();
    else {
        mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 1.5, 1.5), 
            new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.8 })
        );
    }

    mesh.position.copy(pos);
    mesh.userData = { itemType: type };
    
    const light = new THREE.PointLight(color, 10, 5);
    light.position.set(0, 1, 0);
    mesh.add(light);

    mesh.onBeforeRender = () => {
        mesh.position.y = pos.y + Math.sin(performance.now() * 0.003) * 0.3;
        mesh.rotation.y += 0.04;
    };

    this.worldGroup.add(mesh);
    const obj: WorldObject = { id: `item-${type}-${Math.random()}`, mesh, isStatic: false, type: 'item' };
    this.objects.push(obj);
    this.addToGrid(obj);
  }

  public spawnGateAt(keyType: ItemType, pos: THREE.Vector3) {
    const gateGroup = GateAssets.createGate(keyType);
    gateGroup.position.copy(pos);
    gateGroup.userData = { keyType };

    this.worldGroup.add(gateGroup);
    const obj: WorldObject = { id: `gate-${keyType}-${Math.random()}`, mesh: gateGroup, isStatic: true, type: 'gate' };
    this.objects.push(obj);
    this.addToGrid(obj);
  }

  public updateZones() {
    this.assetManager.updateZones();
  }

  public addToGrid(obj: WorldObject) {
    const x = Math.floor(obj.mesh.position.x / this.cellSize);
    const z = Math.floor(obj.mesh.position.z / this.cellSize);
    const key = `${x},${z}`;
    
    const cell = this.spatialGrid.get(key) || [];
    if (!this.spatialGrid.has(key)) this.spatialGrid.set(key, cell);
    cell.push(obj);
  }

  /**
   * SPATIAL GRID SYSTEM
   * Efficiently retrieves objects near a position to avoid checking far-away entities.
   * Used for collisions and HUD markers.
   */
  public getNearby(pos: THREE.Vector3, radius: number): WorldObject[] {
    const cx = Math.floor(pos.x / this.cellSize);
    const cz = Math.floor(pos.z / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);

    const keys = [];
    for (let x = cx - range; x <= cx + range; x++) {
        for (let z = cz - range; z <= cz + range; z++) {
            keys.push(`${x},${z}`);
        }
    }

    return keys.flatMap(key => this.spatialGrid.get(key) || []);
  }

  public removeFromGrid(obj: WorldObject) {
    // Robust removal: check current position cell and surrounding cells just in case
    const cx = Math.floor(obj.mesh.position.x / this.cellSize);
    const cz = Math.floor(obj.mesh.position.z / this.cellSize);
    
    for (let x = cx - 1; x <= cx + 1; x++) {
        for (let z = cz - 1; z <= cz + 1; z++) {
            const key = `${x},${z}`;
            const cell = this.spatialGrid.get(key);
            if (cell) {
                const idx = cell.indexOf(obj);
                if (idx !== -1) {
                    cell.splice(idx, 1);
                    break;
                }
            }
        }
    }

    // Also prune from master objects list
    const mainIdx = this.objects.indexOf(obj);
    if (mainIdx !== -1) this.objects.splice(mainIdx, 1);
  }

  private createFloor() {
    const texture = TextureAssets.generateFloorTexture();
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000), 
        new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture })
    );
    floor.rotation.x = -Math.PI / 2;
    this.worldGroup.add(floor);
  }

  private spawnItems() {
    const { spawns } = itemsConfig;
    const worldLimit = (this.gridSize * this.roomSize) / 2 - 20;

    const mainWorldItems = [ItemType.KEY_SILVER, ItemType.MAGNET, ItemType.SPEAR, ItemType.BRIDGE];

    spawns.forEach(item => {
      const type = item.type as ItemType;
      if (!mainWorldItems.includes(type)) return;
      
      let finalPos = new THREE.Vector3(item.pos.x, item.pos.y, item.pos.z);
      if (type === ItemType.KEY_SILVER) {
        finalPos.set(-5, 1, -5); // Fixed location in landing sector
      } else if (type === ItemType.BRIDGE) {
        finalPos.set(5, 1, 5); 
      } else {
        let safe = false;
        let attempts = 0;
        while (!safe && attempts < 20) {
            finalPos.x = (Math.random() - 0.5) * worldLimit * 2;
            finalPos.z = (Math.random() - 0.5) * worldLimit * 2;
            if (finalPos.length() < 30) { attempts++; continue; }
            safe = !this.getNearby(finalPos, 10).some(o => o.isStatic);
            attempts++;
        }
      }
      this.spawnItemAt(type, finalPos);
    });
  }
}
