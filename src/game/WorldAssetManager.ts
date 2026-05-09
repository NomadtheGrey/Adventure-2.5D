import * as THREE from 'three';
import { WorldObject } from './World';
import natureConfig from './config/nature.json';

// Rule 9: Asset Pooling
const _tempMatrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

export class WorldAssetManager {
    private scene: THREE.Scene;
    private objects: WorldObject[];
    private addToGrid: (obj: WorldObject) => void;
    
    private instancedQueues: Record<string, THREE.Vector3[]> = {
        tree: [],
        bush: [],
        grass: []
    };

    private textures: Record<string, THREE.Texture> = {};

    constructor(scene: THREE.Scene, objects: WorldObject[], addToGrid: (obj: WorldObject) => void) {
        this.scene = scene;
        this.objects = objects;
        this.addToGrid = addToGrid;
        this.initTextures();
    }

    private initTextures() {
        this.textures.tree = this.generateProceduralTexture('#2d5a27', '#1a3317', 'circuit');
        this.textures.bush = this.generateProceduralTexture('#1a4d1a', '#0d260d', 'organic');
        this.textures.grass = this.generateProceduralTexture('#404040', '#202020', 'noise');
        this.textures.water = this.generateProceduralTexture('#1e40af', '#1e3a8a', 'waves');
    }

    private generateProceduralTexture(baseColor: string, accentColor: string, pattern: 'circuit' | 'organic' | 'noise' | 'waves'): THREE.Texture {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Texture();

        // Base
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, size, size);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;

        if (pattern === 'circuit') {
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * size, Math.random() * size);
                const dir = Math.random() > 0.5;
                ctx.lineTo(dir ? Math.random() * size : ctx.canvas.width, dir ? ctx.canvas.height : Math.random() * size);
                ctx.stroke();
            }
        } else if (pattern === 'organic') {
            for (let i = 0; i < 100; i++) {
                ctx.fillStyle = accentColor + '33';
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 20, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (pattern === 'waves') {
            ctx.lineWidth = 4;
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                const y = (i / 10) * size;
                ctx.moveTo(0, y);
                for (let x = 0; x < size; x += 10) {
                    ctx.lineTo(x, y + Math.sin(x * 0.1 + i) * 10);
                }
                ctx.stroke();
            }
        } else {
            for (let i = 0; i < 1000; i++) {
                ctx.fillStyle = accentColor + '11';
                ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    public processNature(x: number, z: number, type: string, w = 4, d = 4) {
        if (Math.abs(x) < 8 && Math.abs(z) < 8) return; 
        
        const config = (natureConfig.natureTypes as any)[type];
        if (!config) return;

        if (config.strategy === 'instanced') {
            const queue = this.instancedQueues[type];
            if (queue) queue.push(new THREE.Vector3(x, 0, z));
            return;
        }

        this.createStaticNature(x, z, config, w, d);
    }

    private createStaticNature(x: number, z: number, config: any, w: number, d: number) {
        const geo = new THREE.BoxGeometry(w || 4, config.geometry.height || 0.5, d || 4);
        const mat = new THREE.MeshPhongMaterial({
            ...config.material,
            map: this.textures.water
        });
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set(x, (config.geometry.height || 0.5) / 2, z);
        this.scene.add(mesh);
        
        const obj: WorldObject = { id: `wall-${x}-${z}-${Math.random()}`, mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    public createCastle(x: number, z: number, color: number, orientation: 'N' | 'S' | 'E' | 'W') {
        const wallMat = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            emissive: color,
            emissiveIntensity: 0.15
        });

        const floorMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });

        // Floor
        const fGeo = new THREE.BoxGeometry(40, 1, 40);
        const floor = new THREE.Mesh(fGeo, floorMat);
        floor.position.set(x, -0.5, z);
        this.scene.add(floor);

        // Walls around the castle perimeter
        const walls = [
            { ox: 0, oz: -20, w: 40, h: 25, d: 2 }, // Top
            { ox: 0, oz: 20, w: 40, h: 25, d: 2 },  // Bottom
            { ox: -20, oz: 0, w: 2, h: 25, d: 40 }, // Left
            { ox: 20, oz: 0, w: 2, h: 25, d: 40 }   // Right
        ];

        // Gates are at (0, 0) relative to castle center for simplicity in rotation
        walls.forEach((w, i) => {
            // Gap for the entrance based on orientation
            const isEntrance = (orientation === 'N' && i === 1) || // North castle, entrance is south wall
                               (orientation === 'S' && i === 0) || // South castle, entrance is north wall
                               (orientation === 'E' && i === 2) || // East castle, entrance is west wall
                               (orientation === 'W' && i === 3);   // West castle, entrance is east wall

            if (isEntrance) {
                // Split wall into two with a gap for the Gate (8 units wide)
                const gapSize = 8;
                const hw = w.w > w.d ? (w.w - gapSize) / 2 : w.w;
                const hd = w.d > w.w ? (w.d - gapSize) / 2 : w.d;
                
                const offs = [[-(hw + gapSize/2), 0], [(hw + gapSize/2), 0]];
                if (w.d > w.w) { offs[0] = [0, -(hd + gapSize/2)]; offs[1] = [0, (hd + gapSize/2)]; }

                offs.forEach(o => {
                    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w > w.d ? hw : w.w, w.h, w.d > w.w ? hd : w.d), wallMat);
                    mesh.position.set(x + w.ox + o[0], w.h/2, z + w.oz + o[1]);
                    this.registerStatic(mesh);
                });
            } else {
                const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
                mesh.position.set(x + w.ox, w.h/2, z + w.oz);
                this.registerStatic(mesh);
            }
        });

        // Towers
        const towerMat = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 0.3 });
        [[-20, -20], [20, -20], [-20, 20], [20, 20]].forEach(p => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(6, 40, 6), towerMat);
            t.position.set(x + p[0], 20, z + p[1]);
            this.registerStatic(t);
        });

        // Road/Carpet leading back to the map (100 units to reach boundary)
        const roadMat = new THREE.MeshPhongMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.6,
            emissive: color,
            emissiveIntensity: 0.2
        });
        
        let roadW = 10, roadD = 100;
        let rx = x, rz = z;
        
        if (orientation === 'N') { rz += 50; roadW = 10; roadD = 60; }
        else if (orientation === 'S') { rz -= 50; roadW = 10; roadD = 60; }
        else if (orientation === 'E') { rx -= 50; roadW = 60; roadD = 10; }
        else if (orientation === 'W') { rx += 50; roadW = 60; roadD = 10; }

        const road = new THREE.Mesh(new THREE.BoxGeometry(roadW, 0.2, roadD), roadMat);
        road.position.set(rx, 0.1, rz);
        this.scene.add(road);

        // Add an invisible "Enter Interior" trigger deep inside the castle
        const triggerGeo = new THREE.BoxGeometry(10, 10, 10);
        const triggerMat = new THREE.MeshBasicMaterial({ visible: false });
        const trigger = new THREE.Mesh(triggerGeo, triggerMat);
        trigger.position.set(x, 5, z);
        trigger.userData.castleType = orientation;
        trigger.userData.isInteriorTrigger = true;
        
        const obj: WorldObject = { 
            id: `trigger-${orientation}-${Math.random()}`, 
            mesh: trigger, 
            isStatic: true, 
            type: 'gate' // 'gate' type triggers UNLOCK check, but we'll use it for teleport
        };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    public createCastleInterior(x: number, z: number, color: number, name: string) {
        // A larger, more complex interior geomorph
        const floorMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const wallMat = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 0.2 });

        // Floor (Main Hall)
        const fGeo = new THREE.BoxGeometry(80, 1, 120);
        const floor = new THREE.Mesh(fGeo, floorMat);
        floor.position.set(x, -0.5, z);
        this.scene.add(floor);

        // Exterior Walls
        const walls = [
            { ox: 0, oz: -60, w: 80, d: 4 },  // Back
            { ox: 0, oz: 60, w: 80, d: 4 },   // Front (Entrance)
            { ox: -40, oz: 0, w: 4, d: 120 }, // Left
            { ox: 40, oz: 0, w: 4, d: 120 }   // Right
        ];

        walls.forEach((w, i) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, 40, w.d), wallMat);
            mesh.position.set(x + w.ox, 20, z + w.oz);
            this.registerStatic(mesh);
            
            // Add exit gate at the entrance wall
            if (i === 1) {
                // Exit point
                const exitGate = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 2), new THREE.MeshPhongMaterial({ color, emissive: color }));
                exitGate.position.set(x, 5, z + w.oz - 2);
                exitGate.userData.isExit = true;
                exitGate.userData.targetName = name; // e.g. "NORTH_CASTLE"
                const obj: WorldObject = { 
                    id: `exit-${name}-${Math.random()}`, 
                    mesh: exitGate, 
                    isStatic: true, 
                    type: 'gate' 
                };
                this.objects.push(obj);
                this.addToGrid(obj);
            }
        });

        // Pillars
        const pillarGeo = new THREE.CylinderGeometry(2, 2, 40, 8);
        const pillarMat = new THREE.MeshPhongMaterial({ color: 0x222222, emissive: color, emissiveIntensity: 0.1 });
        [[-20, -40], [20, -40], [-20, 0], [20, 0], [-20, 40], [20, 40]].forEach(p => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(x + p[0], 20, z + p[1]);
            this.registerStatic(pillar);
        });

        // The "Prize" or interesting feature at the back
        const throne = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 10), pillarMat);
        throne.position.set(x, 7.5, z - 50);
        this.registerStatic(throne);
    }

    public createKeyGeometry(color: number): THREE.Group {
        const group = new THREE.Group();
        const emissiveColor = color === 0x111111 ? 0x222222 : color;
        const mat = new THREE.MeshPhongMaterial({ color, emissive: emissiveColor, emissiveIntensity: 0.8 });
        
        // Key head (Ring)
        const head = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.2, 8, 16), mat);
        head.position.y = 1.2;
        group.add(head);
        
        // Key shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.8, 8), mat);
        shaft.position.y = 0.2;
        group.add(shaft);
        
        // Key teeth
        const tooth1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.2), mat);
        tooth1.position.set(0.3, -0.4, 0);
        group.add(tooth1);
        
        const tooth2 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.2), mat);
        tooth2.position.set(0.25, -0.7, 0);
        group.add(tooth2);

        return group;
    }

    public createMagnetGeometry(): THREE.Group {
        const group = new THREE.Group();
        const coreMat = new THREE.MeshPhongMaterial({ color: 0x3333ff, emissive: 0x0000ff, emissiveIntensity: 0.5 });
        const silverMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        // Central power core
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), coreMat);
        group.add(core);
        
        // Stabilizing rings
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 24), silverMat);
        group.add(ring1);
        
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 24), silverMat);
        ring2.rotation.x = Math.PI / 2;
        group.add(ring2);
        
        // Emitters
        const emitterPos = [
            [0, 1.2, 0], [0, -1.2, 0], [1.2, 0, 0], [-1.2, 0, 0]
        ];
        
        emitterPos.forEach(p => {
            const emit = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), silverMat);
            emit.position.set(p[0], p[1], p[2]);
            group.add(emit);
        });

        return group;
    }

    public createSpearGeometry(): THREE.Group {
        const group = new THREE.Group();
        const woodMat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const ironMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
        
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4, 8), woodMat);
        group.add(shaft);
        
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 8), ironMat);
        tip.position.y = 2.5;
        group.add(tip);
        
        return group;
    }

    public createBridgeGeometry(): THREE.Group {
        const group = new THREE.Group();
        const mat = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const floor = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 5), mat);
        group.add(floor);
        
        const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 5), mat);
        rail1.position.set(1.4, 0.5, 0);
        group.add(rail1);
        
        const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 5), mat);
        rail2.position.set(-1.4, 0.5, 0);
        group.add(rail2);
        
        return group;
    }

    public createChaliceGeometry(): THREE.Group {
        const group = new THREE.Group();
        const mat = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 0.3 });
        
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 0.3, 16), mat);
        group.add(base);
        
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8), mat);
        stem.position.y = 0.9;
        group.add(stem);
        
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.4, 1.8, 16), mat);
        bowl.position.y = 2.4;
        group.add(bowl);
        
        return group;
    }

    private registerStatic(mesh: THREE.Mesh | THREE.Group) {
        this.scene.add(mesh);
        const obj: WorldObject = { 
            id: `castle-part-${Math.random()}`, 
            mesh, 
            isStatic: true, 
            type: 'wall' 
        };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    public finalizeInstances() {
        Object.entries(this.instancedQueues).forEach(([type, positions]) => {
            if (positions.length === 0) return;
            
            const config = (natureConfig.natureTypes as any)[type];
            const geo = this.getGeometry(config.geometry);
            const mat = new THREE.MeshLambertMaterial({
                ...config.material,
                map: this.textures[type] || null
            });
            const instance = new THREE.InstancedMesh(geo, mat, positions.length);
            
            instance.castShadow = false;
            instance.receiveShadow = false;

            positions.forEach((pos, i) => {
                let yOffset = 0;
                if (type === 'tree') yOffset = 4;
                else if (type === 'bush') yOffset = 1;
                else if (type === 'grass') yOffset = 1;

                _position.set(pos.x, yOffset, pos.z);
                
                if (type === 'bush') {
                    _quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
                    const s = 0.8 + Math.random() * 0.4;
                    _scale.set(s * 1.2, s * 0.7, s * 1.2);
                } else if (type === 'grass') {
                    _quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
                    const s = 0.5 + Math.random() * 0.5;
                    _scale.set(s, s, s);
                } else {
                    _quaternion.set(0, 0, 0, 1);
                    _scale.set(1, 1, 1);
                }

                _tempMatrix.compose(_position, _quaternion, _scale);
                instance.setMatrixAt(i, _tempMatrix);
                
                this.addInstanceCollision(pos, config.collision, yOffset, type);
            });

            this.scene.add(instance);
        });
    }

    private getGeometry(geoConfig: any): THREE.BufferGeometry {
        if (geoConfig.type === 'cone') return new THREE.ConeGeometry(geoConfig.radius, geoConfig.height, geoConfig.radialSegments);
        if (geoConfig.type === 'icosahedron') return new THREE.IcosahedronGeometry(geoConfig.radius, geoConfig.detail);
        if (geoConfig.type === 'box') return new THREE.BoxGeometry(geoConfig.width || 1, geoConfig.height || 1, geoConfig.depth || 1);
        return new THREE.BoxGeometry(1, 1, 1);
    }

    private addInstanceCollision(pos: THREE.Vector3, col: any, y: number, type: string) {
        if (!col) return;
        const colMesh = new THREE.Mesh(new THREE.BoxGeometry(col.width, col.height, col.depth));
        colMesh.position.set(pos.x, y, pos.z);
        
        const obj: WorldObject = { id: `inst-col-${pos.x}-${pos.z}-${Math.random()}`, mesh: colMesh, isStatic: true, type: type as any };
        this.objects.push(obj);
        this.addToGrid(obj);
    }
}
