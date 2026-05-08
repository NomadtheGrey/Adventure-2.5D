import * as THREE from 'three';
import { GameState } from './GameState';

export interface WorldObject {
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

  // Instanced Meshes
  treeInstance?: THREE.InstancedMesh;
  bushInstance?: THREE.InstancedMesh;
  waterMeshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createFloor();
    this.generateGeomorphicWorld();
    this.spawnItems();
  }

  private addToGrid(obj: WorldObject) {
    const x = Math.floor(obj.mesh.position.x / this.cellSize);
    const z = Math.floor(obj.mesh.position.z / this.cellSize);
    const key = `${x},${z}`;
    if (!this.spatialGrid.has(key)) this.spatialGrid.set(key, []);
    this.spatialGrid.get(key)!.push(obj);
  }

  public getNearby(pos: THREE.Vector3, radius: number): WorldObject[] {
    const cx = Math.floor(pos.x / this.cellSize);
    const cz = Math.floor(pos.z / this.cellSize);
    const range = Math.ceil(radius / this.cellSize);
    const results: WorldObject[] = [];

    for (let x = cx - range; x <= cx + range; x++) {
        for (let z = cz - range; z <= cz + range; z++) {
            const cell = this.spatialGrid.get(`${x},${z}`);
            if (cell) results.push(...cell);
        }
    }
    return results;
  }

  public removeFromGrid(obj: WorldObject) {
    const x = Math.floor(obj.mesh.position.x / this.cellSize);
    const z = Math.floor(obj.mesh.position.z / this.cellSize);
    const key = `${x},${z}`;
    const cell = this.spatialGrid.get(key);
    if (cell) {
        const idx = cell.indexOf(obj);
        if (idx !== -1) cell.splice(idx, 1);
    }
  }

  private createFloor() {
    const geometry = new THREE.PlaneGeometry(2000, 2000);
    const material = new THREE.MeshLambertMaterial({ color: 0x1a4d1a });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = false;
    this.scene.add(floor);
  }

  private generateGeomorphicWorld() {
    const tempMatrix = new THREE.Matrix4();
    const treePositions: THREE.Vector3[] = [];
    const bushPositions: THREE.Vector3[] = [];

    // Nature factory helpers to collect positions first
    const collectNature = (x: number, z: number, type: 'tree' | 'bush' | 'water', w = 4, d = 4) => {
        if (Math.abs(x) < 8 && Math.abs(z) < 8) return; 
        if (type === 'tree') treePositions.push(new THREE.Vector3(x, 0, z));
        else if (type === 'bush') bushPositions.push(new THREE.Vector3(x, 0, z));
        else {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, d), new THREE.MeshPhongMaterial({ color: 0x1e88e5, transparent: true, opacity: 0.6 }));
            mesh.position.set(x, 0.25, z);
            this.scene.add(mesh);
            const obj: WorldObject = { mesh, isStatic: true, type: 'wall' };
            this.objects.push(obj);
            this.addToGrid(obj);
        }
    };

    // Use current logic to collect all nature positions
    for (let rz = 0; rz < this.gridSize; rz++) {
      for (let rx = 0; rx < this.gridSize; rx++) {
        const x = (rx - this.gridSize / 2) * this.roomSize;
        const z = (rz - this.gridSize / 2) * this.roomSize;

        if (rx === Math.floor(this.gridSize / 2) && rz === Math.floor(this.gridSize / 2)) {
            // Spawn area
            for(let i=0; i<4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                collectNature(x + Math.cos(angle) * 20, z + Math.sin(angle) * 20, 'tree');
            }
            continue;
        }

        // Room boundaries
        const h = this.roomSize / 2;
        const hole = 12;
        // If CPU rendering is detected, use a wider step to reduce object count
        const isCPU = GameState.debug.gpu.includes('CPU');
        const step = isCPU ? 12 : 4; 
        
        for (let i = -h; i <= h; i += step) {
            if (Math.abs(i) < hole/2) continue;
            collectNature(x + i, z - h, 'bush');
            collectNature(x + i, z + h, 'bush');
            collectNature(x - h, z + i, 'bush');
            collectNature(x + h, z + i, 'bush');
        }

        const templateId = Math.floor(Math.random() * 12);
        switch (templateId) {
          case 0: // Lake
            collectNature(x, z, 'water', 25, 25);
            break;
          case 1: // Dense Grove
            for(let i=0; i<5; i++) collectNature(x + (i-2)*8, z + (i-2)*8, 'tree');
            break;
          case 2: // Bushy Labyrinth
            for(let i=0; i<3; i++) collectNature(x + (i-1)*15, z, 'bush', 20, 4);
            break;
          case 3: // River
            collectNature(x, z, 'water', this.roomSize - 10, 10);
            break;
          case 4: // Open Meadow
            collectNature(x+10, z+10, 'bush');
            collectNature(x-10, z-10, 'bush');
            break;
          case 5: // Swamp
            collectNature(x-12, z-12, 'water', 15, 15);
            collectNature(x+12, z+12, 'water', 15, 15);
            collectNature(x, z, 'bush');
            break;
          case 6: // Orchard
            for(let i=-1; i<=1; i++) for(let j=-1; j<=1; j++) collectNature(x+i*12, z+j*12, 'tree');
            break;
          case 7: // Island
            collectNature(x, z, 'water', 40, 40);
            collectNature(x, z, 'tree');
            break;
          case 8: // Narrow Gorge
            for(let i=-20; i<=20; i+=10) {
                collectNature(x-15, z+i, 'tree');
                collectNature(x+15, z+i, 'tree');
            }
            break;
          case 9: // Crossways
            collectNature(x-15, z-15, 'bush', 8, 8);
            collectNature(x+15, z-15, 'bush', 8, 8);
            collectNature(x-15, z+15, 'bush', 8, 8);
            collectNature(x+15, z+15, 'bush', 8, 8);
            break;
          case 10: // Twin Peaks
            collectNature(x-6, z, 'tree');
            collectNature(x+6, z, 'tree');
            break;
          case 11: // Thorny Pass
            for(let i=-20; i<=20; i+=8) {
                collectNature(x+i, z-8, 'bush');
                collectNature(x+i, z+8, 'bush');
            }
            break;
        }
      }
    }

    // World Boundary
    const worldLimit = (this.gridSize * this.roomSize) / 2;
    for (let i = -worldLimit; i <= worldLimit; i += 8) {
        collectNature(-worldLimit, i, 'tree');
        collectNature(worldLimit, i, 'tree');
        collectNature(i, -worldLimit, 'tree');
        collectNature(i, worldLimit, 'tree');
    }

    // Create Instanced Meshes for Tree and Bush
    // Optimizing to Lambert materials and disabling shadows for massive FPS boost
    const treeMat = new THREE.MeshLambertMaterial({ color: 0x2e5a27 }); 
    const bushMat = new THREE.MeshLambertMaterial({ color: 0x1a4d3a }); 

    // Low-poly Tree (Simple Pointy Cone)
    const treeGeo = new THREE.ConeGeometry(3, 8, 4);
    this.treeInstance = new THREE.InstancedMesh(treeGeo, treeMat, treePositions.length);
    this.treeInstance.castShadow = false;
    this.treeInstance.receiveShadow = false;

    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    treePositions.forEach((pos, i) => {
        position.set(pos.x, 4, pos.z);
        scale.set(1, 1, 1);
        tempMatrix.compose(position, quaternion, scale);
        this.treeInstance!.setMatrixAt(i, tempMatrix);
        
        // Add math-only collision object (using BoxGeometry for correct Box3 detection)
        const colMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 8, 4));
        colMesh.position.set(pos.x, 4, pos.z);
        const obj: WorldObject = { mesh: colMesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    });
    this.scene.add(this.treeInstance);

    // BUSH (Low-poly dodecahedron-ish)
    const bushGeo = new THREE.IcosahedronGeometry(2.5, 0); 
    this.bushInstance = new THREE.InstancedMesh(bushGeo, bushMat, bushPositions.length);
    this.bushInstance.castShadow = false;
    this.bushInstance.receiveShadow = false;

    bushPositions.forEach((pos, i) => {
        position.set(pos.x, 1, pos.z);
        quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
        const s = 0.8 + Math.random() * 0.4;
        scale.set(s * 1.2, s * 0.7, s * 1.2);
        tempMatrix.compose(position, quaternion, scale);
        this.bushInstance!.setMatrixAt(i, tempMatrix);

        const colMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4));
        colMesh.position.set(pos.x, 1, pos.z);
        const obj: WorldObject = { mesh: colMesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    });
    this.scene.add(this.bushInstance);
  }

  private addNatureElement(x: number, z: number, type: 'tree' | 'bush' | 'water', w = 4, d = 4) {
      // Stubbed - logic moved to collectNature for instancing
  }

  private createStartingArea(x: number, z: number) {}
  private createLakeRoom(x: number, z: number) {}
  private createDenseGrove(x: number, z: number) {}
  private createBushyLabyrinth(x: number, z: number) {}
  private createRiverRoom(x: number, z: number) {}
  private createOpenField(x: number, z: number) {}
  private createSwampRoom(x: number, z: number) {}
  private createFlowerGarden(x: number, z: number) {}
  private createIslandRoom(x: number, z: number) {}
  private createNarrowPass(x: number, z: number) {}
  private createCrossRoads(x: number, z: number) {}
  private createTwinOaks(x: number, z: number) {}
  private createThornyCorridor(x: number, z: number) {}
  private createNaturalBoundary(x: number, z: number) {}
  private createWorldBoundaries() {}


  private spawnItems() {
    const items = [
      { type: 'KEY_GOLD', color: 0xffd700, pos: new THREE.Vector3(100, 1, 100) },
      { type: 'KEY_SILVER', color: 0xc0c0c0, pos: new THREE.Vector3(-100, 1, -100) },
      { type: 'CHALICE', color: 0xff00ff, pos: new THREE.Vector3(0, 1, 200) },
    ];

    items.forEach(item => {
      const geo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const mat = new THREE.MeshLambertMaterial({ color: item.color, emissive: item.color, emissiveIntensity: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(item.pos);
      mesh.userData = { itemType: item.type };
      
      // Floating animation
      mesh.onBeforeRender = () => {
          mesh.position.y = 1 + Math.sin(Date.now() * 0.005) * 0.2;
          mesh.rotation.y += 0.02;
      };

      this.scene.add(mesh);
      const obj: WorldObject = { mesh, isStatic: false, type: 'item' };
      this.objects.push(obj);
      this.addToGrid(obj);
    });
  }
}
