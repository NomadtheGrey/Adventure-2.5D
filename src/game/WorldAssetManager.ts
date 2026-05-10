import * as THREE from 'three';
import { WorldObject } from './World';
import { ItemType } from './GameState';
import natureConfig from './config/nature.json';
import { ItemAssets } from './assets/ItemAssets';
import { TextureAssets } from './assets/TextureAssets';
import { CastleAssets } from './assets/CastleAssets';
import { FractalAssets } from './assets/FractalAssets';

// Rule 9: Asset Pooling helpers
const _tempMatrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

/**
 * WORLD ASSET MANAGER
 * Centralized system for creating and managing all geometry in the game.
 * Uses instancing for nature assets (trees, bushes) to maintain performance.
 */
export class WorldAssetManager {
    private scene: THREE.Scene;
    private outdoorLayer: THREE.Group;
    private interiorLayer: THREE.Group;
    private objects: WorldObject[];
    private addToGrid: (obj: WorldObject) => void;
    private castleBuilder: CastleAssets;
    
    private instancedQueues: Record<string, THREE.Vector3[]> = {
        tree: [],
        bush: [],
        grass: [],
        water: []
    };

    private textures: Record<string, THREE.Texture> = {};

    constructor(scene: THREE.Scene, worldGroup: THREE.Group, interiorGroup: THREE.Group, objects: WorldObject[], addToGrid: (obj: WorldObject) => void) {
        this.scene = scene;
        this.outdoorLayer = worldGroup;
        this.interiorLayer = interiorGroup;
        this.objects = objects;
        this.addToGrid = addToGrid;
        this.initTextures();
        this.castleBuilder = new CastleAssets(interiorGroup, objects, addToGrid);
    }

    private initTextures() {
        this.textures.tree = TextureAssets.generateProceduralTexture('#2d5a27', '#1a3317', 'circuit');
        this.textures.bush = TextureAssets.generateProceduralTexture('#1a4d1a', '#0d260d', 'organic');
        this.textures.grass = TextureAssets.generateProceduralTexture('#404040', '#202020', 'noise');
        this.textures.water = TextureAssets.generateProceduralTexture('#1e40af', '#1e3a8a', 'waves');
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
        this.outdoorLayer.add(mesh);
        
        const obj: WorldObject = { id: `wall-${x}-${z}-${Math.random()}`, mesh, isStatic: true, type: 'wall' };
        this.objects.push(obj);
        this.addToGrid(obj);
    }

    public createCastle(x: number, z: number, color: number, orientation: 'N' | 'S' | 'E' | 'W', keyType: ItemType) {
        // The exterior of the castle stays in the outdoor layer
        const exteriorGroup = new THREE.Group();
        this.outdoorLayer.add(exteriorGroup);
        const builder = new CastleAssets(exteriorGroup, this.objects, this.addToGrid);
        builder.createCastle(x, z, color, orientation, keyType);
    }

    public createCastleInterior(x: number, z: number, color: number, name: string) {
        this.castleBuilder.createCastleInterior(x, z, color, name);
    }

    public updateZones() {
        this.castleBuilder.updateZones();
    }

    public createKeyGeometry(color: number): THREE.Group {
        return ItemAssets.createKeyGeometry(color);
    }

    public createMagnetGeometry(): THREE.Group {
        return ItemAssets.createMagnetGeometry();
    }

    public createSpearGeometry(): THREE.Group {
        return ItemAssets.createSpearGeometry();
    }

    public createBridgeGeometry(): THREE.Group {
        return ItemAssets.createBridgeGeometry();
    }

    public createChaliceGeometry(): THREE.Group {
        return ItemAssets.createChaliceGeometry();
    }

    public finalizeInstances() {
        Object.entries(this.instancedQueues).forEach(([type, positions]) => {
            if (positions.length === 0) return;
            
            const config = (natureConfig.natureTypes as any)[type];
            
            if (type === 'tree') {
                const { trunk, leaves } = FractalAssets.createFractalTreeGeometry();
                
                const trunkMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
                const trunkMesh = new THREE.InstancedMesh(trunk, trunkMat, positions.length);
                
                const leafMat = new THREE.MeshPhongMaterial({ 
                    color: 0x10b981, 
                    transparent: true, 
                    opacity: 0.8, 
                    flatShading: true,
                    map: this.textures.tree
                });
                const leafMesh = new THREE.InstancedMesh(leaves, leafMat, positions.length);

                positions.forEach((pos, i) => {
                    _position.set(pos.x, 0, pos.z);
                    _tempMatrix.identity().setPosition(_position);
                    trunkMesh.setMatrixAt(i, _tempMatrix);
                    leafMesh.setMatrixAt(i, _tempMatrix);

                    this.addInstanceCollision(pos, config.collision, 4, 'tree');
                });
                this.outdoorLayer.add(trunkMesh, leafMesh);
                return;
            }

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
                else if (type === 'bush' || type === 'grass') yOffset = 1;

                _position.set(pos.x, yOffset, pos.z);
                
                if (type === 'bush' || type === 'grass') {
                    _quaternion.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
                    const s = type === 'bush' 
                        ? 0.8 + Math.random() * 0.4
                        : 0.5 + Math.random() * 0.5;
                    
                    if (type === 'bush') _scale.set(s * 1.2, s * 0.7, s * 1.2);
                    else _scale.set(s, s, s);
                } else {
                    _quaternion.set(0, 0, 0, 1);
                    _scale.set(1, 1, 1);
                }

                _tempMatrix.compose(_position, _quaternion, _scale);
                instance.setMatrixAt(i, _tempMatrix);
                
                this.addInstanceCollision(pos, config.collision, yOffset, type);
            });

            this.outdoorLayer.add(instance);
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
