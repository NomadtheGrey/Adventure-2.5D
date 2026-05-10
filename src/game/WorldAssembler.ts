import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import { GameState, ItemType } from './GameState';
import natureConfig from './config/nature.json';
import { StructureAssets } from './assets/StructureAssets';

export class WorldAssembler {
    private scene: THREE.Scene;
    private assetManager: WorldAssetManager;
    private gridSize: number;
    private roomSize: number;
    private world: any; 

    constructor(scene: THREE.Scene, assetManager: WorldAssetManager, gridSize: number, roomSize: number, world: any) {
        this.scene = scene;
        this.assetManager = assetManager;
        this.gridSize = gridSize;
        this.roomSize = roomSize;
        this.world = world;
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
        const x = (rx - (this.gridSize - 1) / 2) * this.roomSize;
        const z = (rz - (this.gridSize - 1) / 2) * this.roomSize;
        const mid = Math.floor(this.gridSize / 2);
        const isOuter = rx === 0 || rx === this.gridSize - 1 || rz === 0 || rz === this.gridSize - 1;

        if (isOuter) {
            const gateDist = 20; 
            if (rz === 0 && rx === mid) {
                this.assetManager.createCastle(x, z, 0xffd700, 'N', ItemType.KEY_GOLD);
                this.world.spawnGateAt(ItemType.KEY_GOLD, new THREE.Vector3(x, 2, z + gateDist)); 
                return;
            }
            if (rx === 0 && rz === mid) {
                this.assetManager.createCastle(x, z, 0x111111, 'W', ItemType.KEY_BLACK);
                this.world.spawnGateAt(ItemType.KEY_BLACK, new THREE.Vector3(x + gateDist, 2, z)); 
                return;
            }
            if (rx === this.gridSize - 1 && rz === mid) {
                this.assetManager.createCastle(x, z, 0xc0c0c0, 'E', ItemType.KEY_SILVER);
                this.world.spawnGateAt(ItemType.KEY_SILVER, new THREE.Vector3(x - gateDist, 2, z)); 
                return;
            }
            if (rz === this.gridSize - 1 && rx === mid) {
                this.assetManager.createCastle(x, z, 0xff00ff, 'S', ItemType.KEY_GOLD);
                this.world.spawnGateAt(ItemType.KEY_GOLD, new THREE.Vector3(x, 2, z - gateDist)); 
                return;
            }
            return;
        }

        if (rx === mid && rz === mid) return this.spawnStartingCircle(x, z);

        this.createHedgerow(x, z);
        this.applyRandomTemplate(x, z);
    }

    private spawnStartingCircle(lx: number, lz: number) {
        StructureAssets.createCradle(this.scene, lx, lz);
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.assetManager.processNature(lx + Math.cos(angle) * 22, lz + Math.sin(angle) * 22, 'tree');
            this.assetManager.processNature(lx + Math.cos(angle) * 14, lz + Math.sin(angle) * 14, 'bush');
            const gAngle = angle + (Math.random() - 0.5) * 0.2;
            this.assetManager.processNature(lx + Math.cos(gAngle) * 8, lz + Math.sin(gAngle) * 8, 'grass');
        }
    }

    private createHedgerow(lx: number, lz: number) {
        const h = this.roomSize / 2;
        const step = 3;
        const mazeSeed = Math.abs((lx * 0.12) + (lz * 0.34) + GameState.worldSeed);
        const rand = (s: number) => (Math.sin(s * 1000) + 1) / 2;

        for (let i = 0; i <= Math.floor((2 * h) / step); i++) {
            const val = -h + i * step;
            if (Math.abs(val) < 15) {
                if (!(lx === 0 && lz === 0)) {
                    ['top', 'bottom', 'left', 'right'].forEach(side => {
                        if (rand(mazeSeed + i + side.length) > 0.75) {
                            const px = side === 'left' ? lx - h : (side === 'right' ? lx + h : lx + val);
                            const pz = side === 'top' ? lz - h : (side === 'bottom' ? lz + h : lz + val);
                            this.assetManager.processNature(px, pz, 'bush');
                        }
                    });
                }
                continue;
            }
            ['top', 'bottom', 'left', 'right'].forEach(side => {
                const px = side === 'left' ? lx - h : (side === 'right' ? lx + h : lx + val);
                const pz = side === 'top' ? lz - h : (side === 'bottom' ? lz + h : lz + val);
                this.assetManager.processNature(px, pz, 'bush');
            });
        }
    }

    private applyRandomTemplate(lx: number, lz: number) {
        const template = natureConfig.roomTemplates[Math.floor(Math.random() * natureConfig.roomTemplates.length)];
        template.elements.forEach((el: any) => {
            this.assetManager.processNature(lx + el.x, lz + el.z, el.type, el.w, el.d);
        });
        const grassCount = 5 + Math.floor(Math.random() * 10);
        for (let i = 0; i < grassCount; i++) {
            this.assetManager.processNature(lx + (Math.random()-0.5)*(this.roomSize-10), lz + (Math.random()-0.5)*(this.roomSize-10), 'grass');
        }
    }

    private createWorldBoundaries() {
        const worldLimit = (this.gridSize * this.roomSize) / 2;
        const boundaryStep = 10;
        for (let i = 0; i <= Math.floor((2 * worldLimit) / boundaryStep); i++) {
            const val = -worldLimit + i * boundaryStep;
            if (Math.abs(val) >= 20) {
                this.assetManager.processNature(-worldLimit, val, 'tree');
                this.assetManager.processNature(worldLimit, val, 'tree');
                this.assetManager.processNature(val, -worldLimit, 'tree');
                this.assetManager.processNature(val, worldLimit, 'tree');
            }
        }
        this.assetManager.createCastleInterior(5000, -5000, 0xffd700, 'NORTH_CASTLE');
        this.assetManager.createCastleInterior(5000, 5000, 0xff00ff, 'SOUTH_CASTLE');
        this.assetManager.createCastleInterior(8000, 0, 0xc0c0c0, 'EAST_CASTLE');
        this.assetManager.createCastleInterior(-8000, 0, 0x111111, 'WEST_CASTLE');
    }
}
