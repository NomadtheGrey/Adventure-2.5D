import * as THREE from 'three';
import { Player } from '../Player';
import { World, WorldObject } from '../World';
import { DragonSystem, Dragon } from '../Dragons';
import { CloudBat } from '../CloudBat';
import { GameState, ItemType } from '../GameState';

const _playerBox = new THREE.Box3();
const _objBox = new THREE.Box3();
const _spearBox = new THREE.Box3();
const _headBox = new THREE.Box3();

export type CollisionEvent = 
    | { type: 'COLLECT'; target: WorldObject }
    | { type: 'UNLOCK'; target: WorldObject }
    | { type: 'PHASE'; target: WorldObject }
    | { type: 'SOLID'; target: WorldObject }
    | { type: 'SLAY'; dragon?: Dragon; bat?: CloudBat }
    | { type: 'DIE' };

export class CollisionSystem {
    public static getEvents(player: Player, world: World, dragonSys: DragonSystem, bat: CloudBat): CollisionEvent[] {
        _playerBox.setFromObject(player.mesh);
        const events: CollisionEvent[] = [];

        // World Objects
        const nearby = world.getNearby(player.mesh.position, 20);
        const activeItem = GameState.inventory[GameState.activeIndex];
        const canPhase = activeItem?.type === ItemType.BRIDGE;

        nearby.forEach(obj => {
            _objBox.setFromObject(obj.mesh);
            if (!_playerBox.intersectsBox(_objBox)) return;

            if (canPhase && (obj.type === 'tree' || obj.type === 'bush' || obj.type === 'water')) {
                events.push({ type: 'PHASE', target: obj });
                return;
            }

            if (obj.type === 'item') {
                events.push({ type: 'COLLECT', target: obj });
            } else if (obj.type === 'gate' || obj.type === 'throne') {
                events.push({ type: 'UNLOCK', target: obj });
                events.push({ type: 'SOLID', target: obj });
            } else if (obj.isStatic) {
                events.push({ type: 'SOLID', target: obj });
            }
        });

        // Entities
        _spearBox.setFromObject(player.spear);
        
        // Bat
        _headBox.setFromObject(bat.mesh);
        if (player.isThrusting && _spearBox.intersectsBox(_headBox)) {
            events.push({ type: 'SLAY', bat });
        }

        // Dragons
        dragonSys.dragons.forEach(dragon => {
            if (dragon.isDead) return;
            _headBox.setFromObject(dragon.segments[0].mesh);
            if (player.isThrusting && _spearBox.intersectsBox(_headBox)) {
                events.push({ type: 'SLAY', dragon });
                return;
            }

            const playerPos = player.mesh.position;
            const playerCoreBox = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(playerPos.x, playerPos.y + 1, playerPos.z),
                new THREE.Vector3(1.2, 2, 1.2)
            );

            if (dragon.segments.some(seg => {
                _objBox.setFromObject(seg.mesh);
                return playerCoreBox.intersectsBox(_objBox);
            })) {
                events.push({ type: 'DIE' });
            }
        });

        return events;
    }

    public static getPlayerBox() { return _playerBox; }
}
