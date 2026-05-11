import * as THREE from 'three';
import { WorldObject } from '../World';
import { GameState, ItemType } from '../GameState';
import { ItemAssets } from './ItemAssets';

export class CastleAssets {
    constructor(
        private scene: THREE.Object3D,
        private objects: WorldObject[],
        private addToGrid: (obj: WorldObject) => void
    ) {}

    public createCastle(x: number, z: number, color: number, orientation: 'N' | 'S' | 'E' | 'W', keyType: ItemType) {
        const wallMat = new THREE.MeshPhongMaterial({ 
            color: 0x111111,
            emissive: color,
            emissiveIntensity: 0.15
        });

        const floorMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });

        const fGeo = new THREE.BoxGeometry(40, 1, 40);
        const floor = new THREE.Mesh(fGeo, floorMat);
        floor.position.set(x, -0.5, z);
        this.scene.add(floor);

        const walls = [
            { ox: 0, oz: -20, w: 40, h: 25, d: 2 },
            { ox: 0, oz: 20, w: 40, h: 25, d: 2 },
            { ox: -20, oz: 0, w: 2, h: 25, d: 40 },
            { ox: 20, oz: 0, w: 2, h: 25, d: 40 }
        ];

        walls.forEach((w, i) => {
            const isEntrance = (orientation === 'N' && i === 1) || 
                               (orientation === 'S' && i === 0) || 
                               (orientation === 'E' && i === 2) || 
                               (orientation === 'W' && i === 3);

            if (isEntrance) {
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

        const towerMat = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: color, emissiveIntensity: 0.3 });
        [[-20, -20], [20, -20], [-20, 20], [20, 20]].forEach(p => {
            const t = new THREE.Mesh(new THREE.BoxGeometry(6, 40, 6), towerMat);
            t.position.set(x + p[0], 20, z + p[1]);
            this.registerStatic(t);
        });

        const roadMat = new THREE.MeshPhongMaterial({ 
            color, transparent: true, opacity: 0.6, emissive: color, emissiveIntensity: 0.2
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

        const trigger = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ visible: false }));
        trigger.position.set(x, 5, z);
        trigger.userData = { castleType: orientation, isInteriorTrigger: true, keyType };
        
        const obj: WorldObject = { 
            id: `trigger-${orientation}-${Math.random()}`, 
            mesh: trigger, isStatic: true, type: 'gate' 
        };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    private castleGroups: Record<string, THREE.Group> = {};

    public createCastleInterior(x: number, z: number, color: number, name: string) {
        // Create a dedicated group for this interior map to isolate rendering
        const interiorGroup = new THREE.Group();
        interiorGroup.visible = false;
        this.castleGroups[name] = interiorGroup;
        this.scene.add(interiorGroup);

        // Castle-specific color themes for variety - Darker bases for better item contrast
        let wallBaseColor = 0x222222, floorBaseColor = 0x111111, emissiveInt = 0.2;
        if (name === 'EAST_CASTLE') { wallBaseColor = 0x332222; }
        else if (name === 'NORTH_CASTLE') { wallBaseColor = 0x223322; }
        else if (name === 'WEST_CASTLE') { wallBaseColor = 0x222233; }

        const floorMat = new THREE.MeshLambertMaterial({ color: floorBaseColor });
        const wallMat = new THREE.MeshLambertMaterial({ 
            color: wallBaseColor, 
            emissive: color, 
            emissiveIntensity: emissiveInt 
        });

        // Floor creation
        const fGeo = new THREE.BoxGeometry(80, 1, 120);
        const floor = new THREE.Mesh(fGeo, floorMat);
        floor.position.set(x, -0.5, z);
        interiorGroup.add(floor);

        // Outer walls of the interior room - MUCH SHORTER (8 units) to avoid obscuring orthographic view
        const wallHeight = 8;
        const walls = [
            { ox: 0, oz: -60, w: 80, d: 4 }, { ox: 0, oz: 60, w: 80, d: 4 },
            { ox: -40, oz: 0, w: 4, d: 120 }, { ox: 40, oz: 0, w: 4, d: 120 }
        ];

        walls.forEach((w, i) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, wallHeight, w.d), wallMat);
            mesh.position.set(x + w.ox, wallHeight / 2, z + w.oz);
            interiorGroup.add(mesh);
            this.registerStaticWithGroup(mesh, interiorGroup);

            // Determine if this wall should have the exit gate
            let isExitWall = false;
            if (name === 'NORTH_CASTLE' && i === 1) isExitWall = true; // South wall
            if (name === 'SOUTH_CASTLE' && i === 0) isExitWall = true; // North wall
            if (name === 'EAST_CASTLE' && i === 2) isExitWall = true;  // West wall
            if (name === 'WEST_CASTLE' && i === 3) isExitWall = true;  // East wall

            if (isExitWall) {
                const exitGroup = new THREE.Group();
                
                // Position and rotate exit group based on wall
                if (i === 0 || i === 1) { // North or South walls (horizontal)
                    exitGroup.position.set(x, 0, z + w.oz + (i === 0 ? 2 : -2));
                } else { // West or East walls (vertical)
                    exitGroup.position.set(x + w.ox + (i === 2 ? 2 : -4), 0, z);
                    exitGroup.rotation.y = Math.PI / 2;
                }
                
                // Double Doors Look
                const doorMat = new THREE.MeshPhongMaterial({ color: 0x442211, emissive: 0x221100, emissiveIntensity: 0.5 });
                const doorLeft = new THREE.Mesh(new THREE.BoxGeometry(7.5, 12, 1), doorMat);
                doorLeft.position.set(-4, 6, 0);
                const doorRight = new THREE.Mesh(new THREE.BoxGeometry(7.5, 12, 1), doorMat);
                doorRight.position.set(4, 6, 0);
                
                // Glowing trim to signal interaction
                const trimMat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 2.0 });
                const trim = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 1.2), trimMat);
                trim.position.set(0, 12, 0);
                
                exitGroup.add(doorLeft, doorRight, trim);
                exitGroup.userData = { isExit: true, fromCastle: name };
                
                const exitLight = new THREE.PointLight(color, 5, 20);
                exitLight.position.set(0, 6, (i === 0 ? 5 : -5));
                exitGroup.add(exitLight);
                
                interiorGroup.add(exitGroup);
                const obj: WorldObject = { id: `exit-${name}-${Math.random()}`, mesh: exitGroup, isStatic: true, type: 'gate' };
                this.objects.push(obj);
                this.addToGrid(obj);
            }
        });

        // Determine main item for this castle
        let itemType = ItemType.KEY_BLACK;
        let itemColor = 0x111111;
        
        if (name === 'WEST_CASTLE') { itemType = ItemType.CHALICE; itemColor = 0xffd700; }
        else if (name === 'NORTH_CASTLE') { itemType = ItemType.KEY_GOLD; itemColor = 0xffd700; }

        // Start over with empty rooms - just the items and essentials
        const itemPos = new THREE.Vector3(x, 1.5, z - 45);
        let itemMesh: THREE.Group | THREE.Mesh;
        if (itemType === ItemType.CHALICE) {
            itemMesh = ItemAssets.createChaliceGeometry();
        } else {
            itemMesh = ItemAssets.createKeyGeometry(itemColor);
        }
        
        itemMesh.position.copy(itemPos);
        itemMesh.userData = { itemType };
        itemMesh.onBeforeRender = () => {
            itemMesh.position.y = 1.5 + Math.sin(performance.now() * 0.005) * 0.2;
            itemMesh.rotation.y += 0.02;
        };
        interiorGroup.add(itemMesh);

        const obj: WorldObject = { id: `prog-${itemType}-${Math.random()}`, mesh: itemMesh, isStatic: false, type: 'item' };
        this.objects.push(obj);
        this.addToGrid(obj);

        const itemLight = new THREE.PointLight(itemColor === 0x111111 ? 0xffffff : itemColor, 5, 50);
        itemLight.position.copy(itemPos);
        itemLight.position.y += 5;
        interiorGroup.add(itemLight);

        // Softer global interior light for visibility without being harsh
        const ambientLight = new THREE.PointLight(0xffffff, 0.4, 400);
        ambientLight.position.set(x, 100, z);
        interiorGroup.add(ambientLight);
    }

    private createThroneRoom(cx: number, cz: number, mat: THREE.Material, group: THREE.Group) {
        // Obsolete - removed for simplification as requested
    }

    private createInteriorMaze(cx: number, cz: number, mat: THREE.Material, items: { type: ItemType, color: number }[], group: THREE.Group) {
        // Obsolete - removed for simplification as requested
    }

    public updateZones() {
        Object.entries(this.castleGroups).forEach(([name, group]) => {
            group.visible = !GameState.isOutdoor && GameState.currentZone === name;
        });
    }

    private registerStaticWithGroup(mesh: THREE.Mesh | THREE.Group, group: THREE.Group) {
        group.add(mesh);
        const obj: WorldObject = { id: `st-${Math.random()}`, mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    private registerStatic(mesh: THREE.Mesh | THREE.Group) {
        this.scene.add(mesh);
        const obj: WorldObject = { id: `st-${Math.random()}`, mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }
}
