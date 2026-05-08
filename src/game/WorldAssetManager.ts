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
        bush: []
    };

    constructor(scene: THREE.Scene, objects: WorldObject[], addToGrid: (obj: WorldObject) => void) {
        this.scene = scene;
        this.objects = objects;
        this.addToGrid = addToGrid;
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
        const mat = new THREE.MeshPhongMaterial(config.material);
        const mesh = new THREE.Mesh(geo, mat);
        
        mesh.position.set(x, (config.geometry.height || 0.5) / 2, z);
        this.scene.add(mesh);
        
        const obj: WorldObject = { mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    public finalizeInstances() {
        Object.entries(this.instancedQueues).forEach(([type, positions]) => {
            if (positions.length === 0) return;
            
            const config = (natureConfig.natureTypes as any)[type];
            const geo = this.getGeometry(config.geometry);
            const mat = new THREE.MeshLambertMaterial(config.material);
            const instance = new THREE.InstancedMesh(geo, mat, positions.length);
            
            instance.castShadow = false;
            instance.receiveShadow = false;

            positions.forEach((pos, i) => {
                const yOffset = type === 'tree' ? 4 : 1;
                _position.set(pos.x, yOffset, pos.z);
                
                if (type === 'bush') {
                    _quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
                    const s = 0.8 + Math.random() * 0.4;
                    _scale.set(s * 1.2, s * 0.7, s * 1.2);
                } else {
                    _quaternion.set(0, 0, 0, 1);
                    _scale.set(1, 1, 1);
                }

                _tempMatrix.compose(_position, _quaternion, _scale);
                instance.setMatrixAt(i, _tempMatrix);
                
                this.addInstanceCollision(pos, config.collision, yOffset);
            });

            this.scene.add(instance);
        });
    }

    private getGeometry(geoConfig: any): THREE.BufferGeometry {
        if (geoConfig.type === 'cone') return new THREE.ConeGeometry(geoConfig.radius, geoConfig.height, geoConfig.radialSegments);
        if (geoConfig.type === 'icosahedron') return new THREE.IcosahedronGeometry(geoConfig.radius, geoConfig.detail);
        return new THREE.BoxGeometry(1, 1, 1);
    }

    private addInstanceCollision(pos: THREE.Vector3, col: any, y: number) {
        if (!col) return;
        const colMesh = new THREE.Mesh(new THREE.BoxGeometry(col.width, col.height, col.depth));
        colMesh.position.set(pos.x, y, pos.z);
        
        const obj: WorldObject = { mesh: colMesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }
}
