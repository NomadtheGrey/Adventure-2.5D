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
                    const target = userData.targetName;
                    if (target === 'NORTH_CASTLE') player.mesh.position.set(0, 2, -285);
                    else if (target === 'SOUTH_CASTLE') player.mesh.position.set(0, 2, 285);
                    else if (target === 'EAST_CASTLE') player.mesh.position.set(285, 2, 0);
                    else if (target === 'WEST_CASTLE') player.mesh.position.set(-285, 2, 0);
                    Audio.playPhase();
                } else if (userData.isInteriorTrigger) {
                    state.message = "ENTERED HALL";
                    state.messageTimer = 1.5;
                    const type = userData.castleType;
                    if (type === 'N') player.mesh.position.set(5000, 2, -4950);
                    else if (type === 'W') player.mesh.position.set(-8000, 2, 50);
                    else if (type === 'E') player.mesh.position.set(8000, 2, 50);
                    Audio.playPhase();
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
                state.isDead = true;
                break;
        }
    }

    private static removeFromWorld(obj: WorldObject, world: World) {
        world.scene.remove(obj.mesh);
        world.removeFromGrid(obj);
        const idx = world.objects.indexOf(obj);
        if (idx !== -1) world.objects.splice(idx, 1);
    }
}
