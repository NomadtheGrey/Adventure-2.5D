import * as THREE from 'three';
import { ItemType, ITEMS } from '../GameState';

export class GateAssets {
    public static createGate(keyType: ItemType): THREE.Group {
        const color = ITEMS[keyType]?.color || 0xffffff;
        const gateGroup = new THREE.Group();
        
        const frameGeo = new THREE.BoxGeometry(8, 6, 2);
        const frameMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        gateGroup.add(frame);

        const barrierGeo = new THREE.PlaneGeometry(7.5, 5.5);
        const barrierMat = new THREE.MeshPhongMaterial({ 
            color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.4, side: THREE.DoubleSide
        });
        const barrier = new THREE.Mesh(barrierGeo, barrierMat);
        barrier.position.z = 0.1;
        gateGroup.add(barrier);
        
        for (let i = -1; i <= 1; i++) {
            const barGeo = new THREE.CylinderGeometry(0.15, 0.15, 5.5, 8);
            const barMat = new THREE.MeshBasicMaterial({ color });
            const bar = new THREE.Mesh(barGeo, barMat);
            bar.position.set(i * 2, 0, 0.2);
            gateGroup.add(bar);
        }

        for (let i = 0; i < 10; i++) {
            const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color }));
            p.position.set((Math.random()-0.5)*8, (Math.random()-0.5)*6, (Math.random()-0.5)*2);
            gateGroup.add(p);
            p.onBeforeRender = () => {
                p.position.y += 0.01;
                if (p.position.y > 3) p.position.y = -3;
            };
        }

        return gateGroup;
    }
}
