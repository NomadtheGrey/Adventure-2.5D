import * as THREE from 'three';
import { World, WorldObject } from './World';
import { Audio } from './AudioSystem';

export class CloudBat {
    public mesh: THREE.Group;
    public id: string = `bat_${Math.random().toString(36).substr(2, 9)}`;
    private targetPos: THREE.Vector3 = new THREE.Vector3();
    private velocity: THREE.Vector3 = new THREE.Vector3();
    private carriedItem: WorldObject | null = null;
    private worldRect: number;
    private nextActionTime: number = 0;
    private phase: number = 0;
    private lastItemPickupTime: number = 0;
    private isMagnetized: boolean = false;

    constructor(scene: THREE.Object3D, worldLimit: number) {
        this.worldRect = worldLimit;
        this.mesh = new THREE.Group();
        
        // Reclamation Drone Core (D20 / Icosahedron)
        const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.7, 0),
            new THREE.MeshPhongMaterial({ 
                color: 0x4B0082, 
                emissive: 0x9333ea, 
                emissiveIntensity: 2,
                flatShading: true
            })
        );
        
        // Energy Field (Wireframe Cage)
        const cage = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.2, 1),
            new THREE.MeshBasicMaterial({ 
                color: 0x9333ea, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.4 
            })
        );
        this.mesh.add(core, cage);

        const light = new THREE.PointLight(0x9333ea, 5, 12);
        this.mesh.add(light);
        
        this.mesh.position.set(
            (Math.random() - 0.5) * worldLimit,
            15,
            (Math.random() - 0.5) * worldLimit
        );
        this.pickNewTarget();
        scene.add(this.mesh);
    }

    public update(dt: number, world: World, currentTime: number) {
        this.phase += dt * 5;
        
        // Spin the energy field
        this.mesh.children[1].rotation.y += dt;
        this.mesh.children[1].rotation.z += dt * 0.5;

        this.mesh.position.y = 12 + Math.sin(this.phase * 0.5) * 2;
        this.mesh.rotation.y += dt * 0.5;

        // Movement
        if (!this.isMagnetized) {
            const toTarget = this.targetPos.clone().sub(this.mesh.position);
            if (toTarget.length() < 5) {
                this.pickNewTarget(world);
            } else {
                this.velocity.add(toTarget.normalize().multiplyScalar(dt * 40));
                this.velocity.clampLength(0, 45); // Quicker
                this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
            }
        } else {
            // Drag towards player slightly? Or just stay still.
            this.velocity.multiplyScalar(0.9);
            this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
        }

        // Action Logic (Pick or Swap)
        if (currentTime > this.nextActionTime && !this.isMagnetized) {
            this.performAction(world);
            // Action every 3-7 seconds
            this.nextActionTime = currentTime + 3000 + Math.random() * 4000;
        }

        // Update carried item position if any
        if (this.carriedItem) {
            this.carriedItem.mesh.position.copy(this.mesh.position);
            this.carriedItem.mesh.position.y -= 2.5;

            // Forced drop if carried for too long (e.g. 15 seconds)
            if (currentTime - this.lastItemPickupTime > 15000) {
                this.dropItem();
            }
        }
    }

    public setMagnetized(active: boolean) {
        this.isMagnetized = active;
    }

    public hit() {
        if (this.carriedItem) {
            this.dropItem();
            Audio.playSlay();
            // Fly away!
            this.targetPos.set(Math.random() * 1000 - 500, 20, Math.random() * 1000 - 500);
        }
    }

    public getCarriedItem(): WorldObject | null {
        return this.carriedItem;
    }

    private pickNewTarget(world?: World) {
        // High priority: find items to steal
        if (world && !this.carriedItem && Math.random() < 0.7) {
            const items = world.objects.filter(o => o.type === 'item');
            if (items.length > 0) {
                const targetItem = items[Math.floor(Math.random() * items.length)];
                this.targetPos.copy(targetItem.mesh.position);
                this.targetPos.y = 12;
                return;
            }
        }

        this.targetPos.set(
            (Math.random() - 0.5) * this.worldRect * 1.8,
            12,
            (Math.random() - 0.5) * this.worldRect * 1.8
        );
    }

    private performAction(world: World) {
        if (this.isMagnetized) return;

        // Find nearest item
        const nearby = world.getNearby(this.mesh.position, 20);
        const item = nearby.find(o => o.type === 'item');

        if (item) {
            const dist = item.mesh.position.distanceTo(this.mesh.position);
            if (dist < 15) {
                this.swapItem(item);
            }
        } else if (this.carriedItem) {
            // Drop item promptly (into another room area)
            this.dropItem();
        }
    }

    private swapItem(newItem: WorldObject) {
        const oldItem = this.carriedItem;
        this.carriedItem = newItem;
        this.carriedItem.mesh.scale.set(0.6, 0.6, 0.6);
        this.lastItemPickupTime = performance.now();
        
        if (oldItem) {
            oldItem.mesh.position.copy(this.mesh.position);
            oldItem.mesh.position.y = 1;
            oldItem.mesh.scale.set(1, 1, 1);
        }
        Audio.playPhase();
    }

    public dropItem() {
        if (!this.carriedItem) return;
        this.carriedItem.mesh.position.copy(this.mesh.position);
        this.carriedItem.mesh.position.y = 1;
        this.carriedItem.mesh.scale.set(1, 1, 1);
        this.carriedItem = null;
    }
}
