import * as THREE from 'three';
import { WorldAssetManager } from './WorldAssetManager';
import { GameState, ItemType } from './GameState';
import natureConfig from './config/nature.json';

export class WorldAssembler {
    private scene: THREE.Scene;
    private assetManager: WorldAssetManager;
    private gridSize: number;
    private roomSize: number;
    private world: any; // Type avoided to prevent circular deps

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

        this.createWorldBoundaries(); // Just decoration now
        this.assetManager.finalizeInstances();
    }

    private generateRoomAt(rx: number, rz: number) {
        const x = (rx - (this.gridSize - 1) / 2) * this.roomSize;
        const z = (rz - (this.gridSize - 1) / 2) * this.roomSize;
        
        const mid = Math.floor(this.gridSize / 2);
        const isOuter = rx === 0 || rx === this.gridSize - 1 || rz === 0 || rz === this.gridSize - 1;

        if (isOuter) {
            // Castle Placements
            const gateDist = 20; // units from center of geomorph to gate
            if (rz === 0 && rx === mid) {
                this.assetManager.createCastle(x, z, 0xc0c0c0, 'N');
                this.world.spawnGateAt(ItemType.KEY_SILVER, new THREE.Vector3(x, 2, z + gateDist)); 
                return;
            }
            if (rz === this.gridSize - 1 && rx === mid) {
                this.assetManager.createCastle(x, z, 0xffd700, 'S');
                this.world.spawnGateAt(ItemType.KEY_GOLD, new THREE.Vector3(x, 2, z - gateDist));   
                return;
            }
            if (rx === 0 && rz === mid) {
                this.assetManager.createCastle(x, z, 0x111111, 'W');
                this.world.spawnGateAt(ItemType.KEY_BLACK, new THREE.Vector3(x + gateDist, 2, z)); 
                return;
            }
            if (rx === this.gridSize - 1 && rz === mid) {
                this.assetManager.createCastle(x, z, 0x111111, 'E');
                this.world.spawnGateAt(ItemType.KEY_BLACK, new THREE.Vector3(x - gateDist, 2, z)); 
                return;
            }
            return;
        }

        // Inner Map
        const isSpawn = rx === mid && rz === mid;
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

        // Torch Ring (Pillars of Light)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tx = lx + Math.cos(angle) * 11;
            const tz = lz + Math.sin(angle) * 11;
            
            const pillar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.4, 2, 6),
                new THREE.MeshPhongMaterial({ color: 0x333333 })
            );
            pillar.position.set(tx, 1, tz);
            
            const flare = new THREE.Mesh(
                new THREE.SphereGeometry(0.4, 8, 8),
                new THREE.MeshBasicMaterial({ color: 0x34d399 })
            );
            flare.position.set(tx, 2.2, tz);
            
            const pulse = new THREE.PointLight(0x34d399, 5, 10);
            pulse.position.set(tx, 2.2, tz);
            
            this.scene.add(pillar, flare, pulse);
        }

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
            // add some grass
            const gAngle = angle + (Math.random() - 0.5) * 0.2;
            this.assetManager.processNature(lx + Math.cos(gAngle) * 8, lz + Math.sin(gAngle) * 8, 'grass');
        }
    }

    private createHedgerow(lx: number, lz: number) {
        const h = this.roomSize / 2;
        const step = 3;
        const count = Math.floor((2 * h) / step);
        
        // Maze Seed
        const mazeSeed = Math.abs((lx * 0.12) + (lz * 0.34) + GameState.worldSeed);
        const rand = (s: number) => (Math.sin(s * 1000) + 1) / 2;

        Array.from({ length: count + 1 }).forEach((_, i) => {
            const val = -h + i * step;
            
            // Check if this is a potential gate/gap
            if (Math.abs(val) < 15) {
                // Occasional blocking for maze effect (randomly block some exits)
                const isCradle = lx === 0 && lz === 0;
                if (!isCradle) {
                    ['top', 'bottom', 'left', 'right'].forEach(side => {
                        const blockProb = rand(mazeSeed + i + side.length);
                        if (blockProb > 0.75) { // 25% chance to block an exit (lower chance for better navigation)
                            const px = side === 'left' ? lx - h : (side === 'right' ? lx + h : lx + val);
                            const pz = side === 'top' ? lz - h : (side === 'bottom' ? lz + h : lz + val);
                            this.assetManager.processNature(px, pz, 'bush');
                        }
                    });
                }
                return;
            }
            
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

        // Scatter some grass randomly in each room
        const grassCount = 5 + Math.floor(Math.random() * 10);
        for (let i = 0; i < grassCount; i++) {
            const gx = (Math.random() - 0.5) * (this.roomSize - 10);
            const gz = (Math.random() - 0.5) * (this.roomSize - 10);
            this.assetManager.processNature(lx + gx, lz + gz, 'grass');
        }
    }

    private createWorldBoundaries() {
        const worldLimit = (this.gridSize * this.roomSize) / 2;
        const boundaryStep = 10;
        const boundaryCount = Math.floor((2 * worldLimit) / boundaryStep);
        
        Array.from({ length: boundaryCount + 1 }).forEach((_, i) => {
            const val = -worldLimit + i * boundaryStep;
            
            // Skip corridors for Castles (at mid points)
            const isCorridor = Math.abs(val) < 20;
            
            if (!isCorridor) {
                // Outer wall
                this.assetManager.processNature(-worldLimit, val, 'tree');
                this.assetManager.processNature(worldLimit, val, 'tree');
                this.assetManager.processNature(val, -worldLimit, 'tree');
                this.assetManager.processNature(val, worldLimit, 'tree');
            }
        });

        // Generate Castle Interiors (At very remote locations)
        this.assetManager.createCastleInterior(5000, -5000, 0xc0c0c0, 'NORTH_CASTLE');
        this.assetManager.createCastleInterior(5000, 5000, 0xffd700, 'SOUTH_CASTLE');
        this.assetManager.createCastleInterior(8000, 0, 0x333333, 'EAST_CASTLE');
        this.assetManager.createCastleInterior(-8000, 0, 0x333333, 'WEST_CASTLE');
    }
}
