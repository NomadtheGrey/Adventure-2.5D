import * as THREE from 'three';
import { World, WorldObject } from '../World';
import { Player } from '../Player';
import { GameStateData, ItemType, ITEMS } from '../GameState';
import { InventorySystem } from '../InventorySystem';
import { Audio } from '../AudioSystem';
import { CollisionEvent } from './CollisionSystem';

const _diff = new THREE.Vector3();

export class ReactionSystem {
    public static handle(event: CollisionEvent, world: World, player: Player, state: GameStateData) {
        switch (event.type) {
            case 'COLLECT':
                if (performance.now() - state.lastDropTime < 1000) break;
                if (event.target.isCollected) break;
                
                event.target.isCollected = true;
                const itemType = event.target.mesh.userData.itemType as ItemType;
                const itemDef = ITEMS[itemType];
                state.message = `PICKED UP: ${itemDef ? itemDef.name.toUpperCase() : itemType}`;
                state.messageTimer = 1.5;
                Audio.playCollect();
                InventorySystem.addItem(itemType);
                this.removeFromWorld(event.target, world);
                break;

            case 'UNLOCK':
                const userData = event.target.mesh.userData;
                if (userData.isExit) {
                    state.message = "EXITING CASTLE";
                    state.messageTimer = 1.5;
                    state.isOutdoor = true;
                    state.activeInterior = null;
                    state.currentZone = 'SECTOR';
                    
                    const from = userData.fromCastle;
                    // Return player to the entrance of the castle they just left in the main world
                    if (from === 'NORTH_CASTLE') player.mesh.position.set(0, 1.5, -280);
                    else if (from === 'SOUTH_CASTLE') player.mesh.position.set(0, 1.5, 280);
                    else if (from === 'EAST_CASTLE') player.mesh.position.set(280, 1.5, 0);
                    else if (from === 'WEST_CASTLE') player.mesh.position.set(-280, 1.5, 0);
                    else player.mesh.position.set(0, 1.5, 0); // Fallback
                    
                    Audio.playPhase();
                } else if (userData.isInteriorTrigger) {
                    const reqKey = userData.keyType as ItemType;
                    const hasKey = state.inventory.some(k => k.type === reqKey);
                    
                    if (hasKey) {
                        state.message = "ENTERED HALL";
                        state.messageTimer = 1.5;
                        state.isOutdoor = false;
                        const type = userData.castleType;
                        
                        // Map internal type names to Zone names
                        if (type === 'N') state.currentZone = 'NORTH_CASTLE';
                        else if (type === 'S') state.currentZone = 'SOUTH_CASTLE';
                        else if (type === 'W') state.currentZone = 'WEST_CASTLE';
                        else if (type === 'E') state.currentZone = 'EAST_CASTLE';
                        
                        state.activeInterior = state.currentZone;

                        // Teleport player to the interior map location
                        if (type === 'N') player.mesh.position.set(5000, 2, -4950);
                        else if (type === 'S') player.mesh.position.set(5000, 2, 5050);
                        else if (type === 'W') player.mesh.position.set(-8000 + 10, 2, 50 + 10);
                        else if (type === 'E') player.mesh.position.set(8000 + 10, 2, 50 + 10);
                        Audio.playPhase();
                    } else {
                        state.message = `YOU NEED THE ${reqKey.replace('KEY_', '')} KEY`;
                        state.messageTimer = 2;
                    }
                } else if (userData.isThrone) {
                    if (state.inventory.some(i => i.type === ItemType.CHALICE)) {
                        state.message = "CHALICE RETURNED! YOU WIN!";
                        state.hasWon = true;
                        Audio.playCollect();
                    } else {
                        state.message = "THE THRONE AWAITS THE PURPLE CHALICE";
                        state.messageTimer = 3;
                    }
                } else {
                    const req = userData.keyType as ItemType;
                    if (state.inventory.some(k => k.type === req)) {
                        state.message = "GATE OPENED";
                        state.messageTimer = 1.5;
                        this.removeFromWorld(event.target, world);
                        Audio.playCollect();
                    } else {
                        state.message = `YOU NEED THE ${req.replace('KEY_', '')} KEY`;
                        state.messageTimer = 3; 
                    }
                }
                break;

            case 'PHASE':
                if (state.isPhasing) break;
                Audio.playPhase();
                state.isPhasing = true;
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.mesh.quaternion);
                player.mesh.position.add(forward.multiplyScalar(15));
                setTimeout(() => state.isPhasing = false, 250);
                break;

            case 'SOLID':
                _diff.subVectors(player.mesh.position, event.target!.mesh.position);
                _diff.y = 0;
                if (_diff.lengthSq() < 0.0001) _diff.set(Math.random()-0.5, 0, Math.random()-0.5);
                player.mesh.position.add(_diff.normalize().multiplyScalar(1.2));
                break;

            case 'SLAY':
                if (event.dragon) {
                    Audio.playSlay();
                    event.dragon.isDead = true;
                    event.dragon.segments.forEach(s => s.mesh.visible = false);
                    import('./TelemetrySystem').then(m => m.TelemetrySystem.log('ENTITY DELETED: CRYSTAL SNAKE'));
                }
                if (event.bat) event.bat.hit();
                break;

            case 'DIE':
                Audio.playDie();
                state.signalIntegrity = 0;
                state.isDead = true;
                break;
        }
    }

    private static removeFromWorld(obj: WorldObject, world: World) {
        if (obj.mesh.parent) {
            obj.mesh.parent.remove(obj.mesh);
        } else {
            world.scene.remove(obj.mesh);
        }
        world.removeFromGrid(obj);
        const idx = world.objects.indexOf(obj);
        if (idx !== -1) world.objects.splice(idx, 1);
    }
}
