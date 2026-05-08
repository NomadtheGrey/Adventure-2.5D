import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { DragonSystem } from './Dragons';
import { GameState, ItemType } from './GameState';
import { InventorySystem } from './InventorySystem';

export class Systems {
    static collisionBoxes = new Map<THREE.Object3D, THREE.Box3>();

    static getBox(obj: THREE.Object3D) {
        if (!this.collisionBoxes.has(obj)) {
            this.collisionBoxes.set(obj, new THREE.Box3().setFromObject(obj));
        }
        return this.collisionBoxes.get(obj)!;
    }

    static checkCollisions(player: Player, world: World, dragonSys: DragonSystem) {
        const playerBox = new THREE.Box3().setFromObject(player.mesh);
        const playerPos = player.mesh.position;
        
        // Use spatial grid to only check nearby objects
        const nearbyObjects = world.getNearby(playerPos, 20);
        
        for (let i = nearbyObjects.length - 1; i >= 0; i--) {
            const obj = nearbyObjects[i];
            const objBox = this.getBox(obj.mesh);

            if (obj.type === 'item') {
                if (playerBox.intersectsBox(objBox)) {
                    console.log("Collected:", obj.mesh.userData.itemType);
                    InventorySystem.addItem(obj.mesh.userData.itemType as ItemType);
                    world.scene.remove(obj.mesh);
                    world.removeFromGrid(obj);
                    const worldIdx = world.objects.indexOf(obj);
                    if (worldIdx !== -1) world.objects.splice(worldIdx, 1);
                    this.collisionBoxes.delete(obj.mesh);
                    
                    if (obj.mesh.userData.itemType === 'CHALICE') {
                        GameState.hasWon = true;
                    }
                    continue;
                }
            }

            if (obj.type === 'gate') {
                if (playerBox.intersectsBox(objBox)) {
                    const requiredKey = obj.mesh.userData.keyType as ItemType;
                    const hasKey = GameState.inventory.some(item => item.type === requiredKey);
                    
                    if (hasKey) {
                        console.log("Unlocking gate!");
                        world.scene.remove(obj.mesh);
                        world.removeFromGrid(obj);
                        const worldIdx = world.objects.indexOf(obj);
                        if (worldIdx !== -1) world.objects.splice(worldIdx, 1);
                        this.collisionBoxes.delete(obj.mesh);
                        continue;
                    }
                }
            }

            if (obj.isStatic && playerBox.intersectsBox(objBox)) {
                const diff = new THREE.Vector3().subVectors(player.mesh.position, obj.mesh.position);
                diff.y = 0;
                player.mesh.position.add(diff.normalize().multiplyScalar(0.4));
            }
        }

        // Dragon/Sword collisions
        for (const dragon of dragonSys.dragons) {
            if (dragon.isDead) continue;
            
            const headBox = this.getBox(dragon.segments[0].mesh);
            const spearBox = new THREE.Box3().setFromObject(player.spear);

            if (player.isThrusting && spearBox.intersectsBox(headBox)) {
                console.log("Struck dragon!");
                dragon.isDead = true;
                dragon.segments.forEach(s => s.mesh.visible = false);
            }

            // Segmentation collision
            for (const seg of dragon.segments) {
                const segBox = this.getBox(seg.mesh);
                if (playerBox.intersectsBox(segBox)) {
                    GameState.isDead = true;
                    console.log("Player eaten!");
                }
            }
        }
    }
}
