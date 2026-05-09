import * as THREE from 'three';

export class StructureAssets {
    public static createCradle(scene: THREE.Scene, x: number, z: number) {
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
        cradle.position.set(x, 0.05, z);
        scene.add(cradle);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const tx = x + Math.cos(angle) * 11;
            const tz = z + Math.sin(angle) * 11;
            
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
            
            scene.add(pillar, flare, pulse);
        }

        const beaconGeo = new THREE.CylinderGeometry(0.1, 0.1, 100, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.1 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(x, 50, z);
        scene.add(beacon);
    }
}
