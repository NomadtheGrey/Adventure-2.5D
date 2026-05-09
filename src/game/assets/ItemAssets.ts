import * as THREE from 'three';
import { ItemType } from '../GameState';

export class ItemAssets {
    public static createKeyGeometry(color: number): THREE.Group {
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

    public static createMagnetGeometry(): THREE.Group {
        const group = new THREE.Group();
        const coreMat = new THREE.MeshPhongMaterial({ color: 0x3333ff, emissive: 0x0000ff, emissiveIntensity: 0.5 });
        const silverMat = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), coreMat);
        group.add(core);
        
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 8, 24), silverMat);
        group.add(ring1);
        
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 24), silverMat);
        ring2.rotation.x = Math.PI / 2;
        group.add(ring2);
        
        const emitterPos = [[0, 1.2, 0], [0, -1.2, 0], [1.2, 0, 0], [-1.2, 0, 0]];
        emitterPos.forEach(p => {
            const emit = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), silverMat);
            emit.position.set(p[0], p[1], p[2]);
            group.add(emit);
        });

        return group;
    }

    public static createSpearGeometry(): THREE.Group {
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

    public static createBridgeGeometry(): THREE.Group {
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

    public static createChaliceGeometry(): THREE.Group {
        const group = new THREE.Group();
        const mat = new THREE.MeshPhongMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3 });
        
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
}
