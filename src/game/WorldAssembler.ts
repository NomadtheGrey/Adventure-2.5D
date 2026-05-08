import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import natureConfig from './config/nature.json';

export class WorldAssembler {
    private scene: THREE.Scene;
    private assetManager: WorldAssetManager;
    private gridSize: number;
    private roomSize: number;

    constructor(scene: THREE.Scene, assetManager: WorldAssetManager, gridSize: number, roomSize: number) {
        this.scene = scene;
        this.assetManager = assetManager;
        this.gridSize = gridSize;
        this.roomSize = roomSize;
    }

    public generate() {
        const gridIndices = Array.from({ length: this.gridSize }, (_, i) => i);
        
        gridIndices.forEach(rz => {
            gridIndices.forEach(rx => {
                this.generateRoomAt(rx, rz);
            });
        });

        this.createWorldBoundaries();
        this.assetManager.finalizeInstances();
    }

    private generateRoomAt(rx: number, rz: number) {
        const x = (rx - this.gridSize / 2) * this.roomSize;
        const z = (rz - this.gridSize / 2) * this.roomSize;
        const isSpawn = rx === Math.floor(this.gridSize / 2) && rz === Math.floor(this.gridSize / 2);

        if (isSpawn) return this.spawnStartingCircle(x, z);

        this.createHedgerow(x, z);
        this.applyRandomTemplate(x, z);
    }

    private spawnStartingCircle(lx: number, lz: number) {
        // Geometric Landing "Cradle"
        const cradleGeo = new THREE.TorusGeometry(12, 0.2, 8, 32);
        cradleGeo.rotateX(Math.PI / 2);
        const cradleMat = new THREE.MeshLambertMaterial({ 
            color: 0x34d399, 
            emissive: 0x34d399, 
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.5
        });
        const cradle = new THREE.Mesh(cradleGeo, cradleMat);
        cradle.position.set(lx, 0.05, lz);
        this.scene.add(cradle);

        // Core Beacon
        const beaconGeo = new THREE.CylinderGeometry(0.1, 0.1, 100, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.1 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(lx, 50, lz);
        this.scene.add(beacon);
        
        // Ring of protective nature
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 22;
            this.assetManager.processNature(lx + Math.cos(angle) * dist, lz + Math.sin(angle) * dist, 'tree');
            // inner ring
            this.assetManager.processNature(lx + Math.cos(angle) * 14, lz + Math.sin(angle) * 14, 'bush');
        }
    }

    private createHedgerow(lx: number, lz: number) {
        const h = this.roomSize / 2;
        const step = 3;
        const count = Math.floor((2 * h) / step);
        
        Array.from({ length: count + 1 }).forEach((_, i) => {
            const val = -h + i * step;
            if (Math.abs(val) < 6) return;
            
            ['top', 'bottom', 'left', 'right'].forEach(side => {
                const px = side === 'left' ? lx - h : (side === 'right' ? lx + h : lx + val);
                const pz = side === 'top' ? lz - h : (side === 'bottom' ? lz + h : lz + val);
                this.assetManager.processNature(px, pz, 'bush');
            });
        });
    }

    private applyRandomTemplate(lx: number, lz: number) {
        const templateIdx = Math.floor(Math.random() * natureConfig.roomTemplates.length);
        const template = natureConfig.roomTemplates[templateIdx];
        
        template.elements.forEach((el: any) => {
            this.assetManager.processNature(lx + el.x, lz + el.z, el.type, el.w, el.d);
        });
    }

    private createWorldBoundaries() {
        const worldLimit = (this.gridSize * this.roomSize) / 2;
        const boundaryStep = 8;
        const boundaryCount = Math.floor((2 * worldLimit) / boundaryStep);
        
        Array.from({ length: boundaryCount + 1 }).forEach((_, i) => {
            const val = -worldLimit + i * boundaryStep;
            this.assetManager.processNature(-worldLimit, val, 'tree');
            this.assetManager.processNature(worldLimit, val, 'tree');
            this.assetManager.processNature(val, -worldLimit, 'tree');
            this.assetManager.processNature(val, worldLimit, 'tree');
        });
    }
}
