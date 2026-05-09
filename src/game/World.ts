import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import { WorldAssembler } from './WorldAssembler';
import { ItemType, ITEMS } from './GameState';
import itemsConfig from './config/items.json';

export interface WorldObject {
  id: string;
  mesh: THREE.Object3D;
  isStatic: boolean;
  type: 'wall' | 'tree' | 'item' | 'gate' | 'bush' | 'water';
}

export class World {
  scene: THREE.Scene;
  objects: WorldObject[] = [];
  spatialGrid: Map<string, WorldObject[]> = new Map();
  cellSize = 20;
  roomSize = 60;
  gridSize = 11;

  private assetManager!: WorldAssetManager;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    this.createFloor();
    
    this.assetManager = new WorldAssetManager(this.scene, this.objects, (obj) => this.addToGrid(obj));
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
        const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
        mesh = new THREE.Mesh(geo, mat);
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

    this.scene.add(mesh);
    const obj: WorldObject = { 
        id: `dropped-${type}-${Math.random()}`, 
        mesh, 
        isStatic: false, 
        type: 'item' 
    };
    this.objects.push(obj);
    this.addToGrid(obj);
  }

  public spawnGateAt(keyType: ItemType, pos: THREE.Vector3) {
    const color = ITEMS[keyType]?.color || 0xffffff;
    const gateGroup = new THREE.Group();
    gateGroup.position.copy(pos);
    
    // The "Frame"
    const frameGeo = new THREE.BoxGeometry(8, 6, 2);
    const frameMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    gateGroup.add(frame);

    // The "Energy Barrier" (Sector Barrier)
    const barrierGeo = new THREE.PlaneGeometry(7.5, 5.5);
    const barrierMat = new THREE.MeshPhongMaterial({ 
        color, 
        emissive: color, 
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.position.z = 0.1;
    gateGroup.add(barrier);
    
    // Add glowing bars
    for (let i = -1; i <= 1; i++) {
        const barGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8);
        const barMat = new THREE.MeshBasicMaterial({ color });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(i * 2, 0, 0.2);
        gateGroup.add(bar);
    }

    // Floating data particles near gate
    for (let i = 0; i < 10; i++) {
        const pGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const pMat = new THREE.MeshBasicMaterial({ color });
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*6, (Math.random()-0.5)*2);
        gateGroup.add(p);
        p.onBeforeRender = () => {
            p.position.y += 0.01;
            if (p.position.y > 3) p.position.y = -3;
        };
    }

    this.scene.add(gateGroup);
    gateGroup.userData = { keyType };

    const obj: WorldObject = { 
        id: `gate-${keyType}-${Math.random()}`, 
        mesh: gateGroup, 
        isStatic: true, 
        type: 'gate' 
    };
    this.objects.push(obj);
    this.addToGrid(obj);
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
    
    // Generate a procedural grass/organic texture
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Base dark green
        ctx.fillStyle = '#022c22';
        ctx.fillRect(0, 0, size, size);
        
        // Random organic noise/grass patches
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const length = 4 + Math.random() * 8; // Longer wisps
            const angle = Math.random() * Math.PI;
            
            // Varied greens for depth
            const greens = ['#065f46', '#14532d', '#166534', '#064e3b'];
            ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + Math.cos(angle) * (length/2) + (Math.random()-0.5)*5,
                y + Math.sin(angle) * (length/2) + (Math.random()-0.5)*5,
                x + Math.cos(angle) * length,
                y + Math.sin(angle) * length
            );
            ctx.stroke();
        }

        // Add some small "clover" blobs
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = '#05966922';
            ctx.beginPath();
            ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add some "dithering" noise
        for (let i = 0; i < 10000; i++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.15})`;
            ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(120, 120); // More dense for realism

    const material = new THREE.MeshLambertMaterial({ color: 0xffffff, map: texture });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  private spawnItems() {
    const { spawns } = itemsConfig;
    const worldLimit = (this.gridSize * this.roomSize) / 2 - 20;

    spawns.forEach(item => {
      const type = item.type as ItemType;
      
      let finalPos = new THREE.Vector3(item.pos.x, item.pos.y, item.pos.z);
      if (type === ItemType.BRIDGE) {
        finalPos.set(5, 1, 5); // Starting room
      } else {
        // Find a safe spot
        let safe = false;
        let attempts = 0;
        while (!safe && attempts < 20) {
            finalPos.x = (Math.random() - 0.5) * worldLimit * 2;
            finalPos.z = (Math.random() - 0.5) * worldLimit * 2;
            
            // Avoid center landing zone spawn if it's not the bridge
            if (finalPos.length() < 30) {
                attempts++;
                continue;
            }

            const nearby = this.getNearby(finalPos, 10);
            safe = !nearby.some(o => o.isStatic);
            attempts++;
        }
      }

      this.spawnItemAt(type, finalPos);
    });
  }
}
