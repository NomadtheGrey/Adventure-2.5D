import * as THREE from 'three';
import { WorldObject } from '../World';
import { ItemType } from '../GameState';
import { ItemAssets } from './ItemAssets';

export class CastleAssets {
    constructor(
        private scene: THREE.Scene,
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

    public createCastleInterior(x: number, z: number, color: number, name: string) {
        let wallBaseColor = 0x000000, floorBaseColor = 0x111111, emissiveInt = 0.2;
        if (name === 'EAST_CASTLE') { wallBaseColor = 0x222222; floorBaseColor = 0x333333; emissiveInt = 0.4; }
        else if (name === 'NORTH_CASTLE') { wallBaseColor = 0x332200; floorBaseColor = 0x332200; emissiveInt = 0.5; }

        const floorMat = new THREE.MeshPhongMaterial({ color: floorBaseColor });
        const wallMat = new THREE.MeshPhongMaterial({ color: wallBaseColor, emissive: color, emissiveIntensity: emissiveInt });

        const fGeo = new THREE.BoxGeometry(80, 1, 120);
        const floor = new THREE.Mesh(fGeo, floorMat);
        floor.position.set(x, -0.5, z);
        this.scene.add(floor);

        const cMesh = new THREE.Mesh(fGeo, floorMat);
        cMesh.position.set(x, 20, z);
        this.scene.add(cMesh);

        const walls = [
            { ox: 0, oz: -60, w: 80, d: 4 }, { ox: 0, oz: 60, w: 80, d: 4 },
            { ox: -40, oz: 0, w: 4, d: 120 }, { ox: 40, oz: 0, w: 4, d: 120 }
        ];

        walls.forEach((w, i) => {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.w, 30, w.d), wallMat);
            mesh.position.set(x + w.ox, 15, z + w.oz);
            this.registerStatic(mesh);
            if (i === 1) {
                const exitGate = new THREE.Mesh(new THREE.BoxGeometry(12, 12, 2), new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 2.0 }));
                exitGate.position.set(x, 6, z + w.oz - 2);
                exitGate.userData = { isExit: true, targetName: name };
                
                const exitLight = new THREE.PointLight(color, 20, 30);
                exitLight.position.set(0, 0, -2);
                exitGate.add(exitLight);
                
                const obj: WorldObject = { id: `exit-${name}-${Math.random()}`, mesh: exitGate, isStatic: true, type: 'gate' };
                this.objects.push(obj);
                this.addToGrid(obj);
            }
        });

        if (name === 'EAST_CASTLE') this.createInteriorMaze(x, z, wallMat, [{ type: ItemType.KEY_BLACK, color: 0x111111 }]);
        else if (name === 'WEST_CASTLE') this.createInteriorMaze(x, z, wallMat, [{ type: ItemType.CHALICE, color: 0xffd700 }, { type: ItemType.KEY_GOLD, color: 0xffd700 }]);
        else if (name === 'NORTH_CASTLE') this.createThroneRoom(x, z, wallMat);

        const light = new THREE.PointLight(color, 20, 150);
        light.position.set(x, 10, z);
        this.scene.add(light);
    }

    private createThroneRoom(cx: number, cz: number, mat: THREE.Material) {
        const pillarGeo = new THREE.CylinderGeometry(2, 2, 30, 8);
        [[-20, -20], [20, -20], [-20, 20], [20, 20], [-20, 50], [20, 50]].forEach(p => {
            const pillar = new THREE.Mesh(pillarGeo, mat);
            pillar.position.set(cx + p[0], 15, cz + p[1]);
            this.registerStatic(pillar);
        });

        const throneGroup = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 10), mat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(10, 15, 2), mat);
        back.position.set(0, 7.5, -4);
        throneGroup.add(base, back);

        const crown = new THREE.Mesh(new THREE.TorusGeometry(3, 0.5, 8, 16), new THREE.MeshPhongMaterial({ color: 0xffd700 }));
        crown.position.set(0, 15, -4);
        throneGroup.add(crown);

        throneGroup.position.set(cx, 1, cz - 50);
        this.scene.add(throneGroup);
        const obj: WorldObject = { id: `throne-${Math.random()}`, mesh: throneGroup, isStatic: true, type: 'throne' };
        obj.mesh.userData.isThrone = true;
        this.objects.push(obj);
        this.addToGrid(obj);

        const throneLight = new THREE.PointLight(0xffd700, 20, 50);
        throneLight.position.set(cx, 10, cz - 45);
        this.scene.add(throneLight);
    }

    private createInteriorMaze(cx: number, cz: number, mat: THREE.Material, items: { type: ItemType, color: number }[]) {
        const dividers = [{ w: 50, d: 2, x: -15, z: -20 }, { w: 50, d: 2, x: 15, z: 20 }, { w: 2, d: 60, x: 0, z: 0 }, { w: 30, d: 2, x: 0, z: -40 }];
        dividers.forEach(d => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(d.w, 15, d.d), mat);
            wall.position.set(cx + d.x, 7.5, cz + d.z);
            this.registerStatic(wall);
        });

        items.forEach((item, idx) => {
            const offsetX = (items.length > 1) ? (idx - (items.length - 1) / 2) * 10 : 0;
            const itemPos = new THREE.Vector3(cx + offsetX, 1.5, cz - 50);
            const itemMesh = item.type === ItemType.CHALICE ? ItemAssets.createChaliceGeometry() : ItemAssets.createKeyGeometry(item.color);
            itemMesh.position.copy(itemPos);
            itemMesh.userData = { itemType: item.type };
            itemMesh.onBeforeRender = () => {
                itemMesh.position.y = 1.5 + Math.sin(performance.now() * 0.005) * 0.2;
                itemMesh.rotation.y += 0.02;
            };
            this.scene.add(itemMesh);
            const obj: WorldObject = { id: `prog-${item.type}-${Math.random()}`, mesh: itemMesh, isStatic: false, type: 'item' };
            this.objects.push(obj);
            this.addToGrid(obj);
            const itemLight = new THREE.PointLight(item.color, 10, 20);
            itemLight.position.copy(itemPos);
            this.scene.add(itemLight);
        });
    }

    private registerStatic(mesh: THREE.Mesh | THREE.Group) {
        this.scene.add(mesh);
        const obj: WorldObject = { id: `st-${Math.random()}`, mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }
}
