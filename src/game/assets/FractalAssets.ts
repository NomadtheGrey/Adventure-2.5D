import * as THREE from 'three';

export class FractalAssets {
    public static createFractalTree(): THREE.Group {
        const group = new THREE.Group();
        const baseColor = 0x065f46;
        const leafColor = 0x10b981;

        // Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 6, 6);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 3;
        group.add(trunk);

        // Fractal Nodes
        this.addNodes(group, new THREE.Vector3(0, 6, 0), 3.5, leafColor, 0);

        return group;
    }

    private static addNodes(parent: THREE.Group, pos: THREE.Vector3, size: number, color: number, depth: number) {
        if (depth > 2) return;

        const nodeGeo = new THREE.OctahedronGeometry(size, 0);
        const nodeMat = new THREE.MeshPhongMaterial({ 
            color, 
            transparent: true, 
            opacity: 0.7,
            flatShading: true
        });
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.copy(pos);
        parent.add(node);

        const count = 3;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = size * 0.8;
            const nextPos = new THREE.Vector3(
                pos.x + Math.cos(angle) * dist,
                pos.y + size * 0.6,
                pos.z + Math.sin(angle) * dist
            );
            this.addNodes(parent, nextPos, size * 0.6, color, depth + 1);
        }
    }
}
