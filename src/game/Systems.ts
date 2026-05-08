import * as THREE from 'three';
import { Player } from './Player';
import { World, WorldObject } from './World';
import { DragonSystem, Dragon } from './Dragons';
import { GameStateData, ItemType } from './GameState';
import { InventorySystem } from './InventorySystem';
import { Audio } from './AudioSystem';

// Rule 9: Asset Pooling - Keep scratch objects outside the tick
const _playerBox = new THREE.Box3();
const _objBox = new THREE.Box3();
const _spearBox = new THREE.Box3();
const _headBox = new THREE.Box3();
const _diff = new THREE.Vector3();

// Rule 14: Debug visuals
let _debugGroup: THREE.Group | null = null;
const _boxHelper = new THREE.Box3Helper(new THREE.Box3(), 0xffff00);

export type CollisionEvent = 
    | { type: 'COLLECT'; target: WorldObject }
    | { type: 'UNLOCK'; target: WorldObject }
    | { type: 'SOLID'; target: WorldObject }
    | { type: 'SLAY'; dragon: Dragon }
    | { type: 'DIE' };

export class Systems {
    static checkCollisions(player: Player, world: World, dragonSys: DragonSystem, state: GameStateData) {
        _playerBox.setFromObject(player.mesh);
        
        if (state.debug.showPhysics) this.updateDebugVisuals(world.scene, _playerBox);

        // Update zone
        const distFromCenter = state.playerPos.length();
        state.currentZone = distFromCenter < 35 ? 'LANDING' : 'SECTOR';

        // Update adaptive audio
        Audio.update(state);

        // Detect and pipe reactions
        this.detectWorldCollisions(player, world)
            .forEach(event => this.handleReaction(event, world, player, state));

        this.detectDragonCollisions(player, dragonSys)
            .forEach(event => this.handleReaction(event, world, player, state));
    }

    private static updateDebugVisuals(scene: THREE.Scene, box: THREE.Box3) {
        if (!_debugGroup) {
            _debugGroup = new THREE.Group();
            scene.add(_debugGroup);
            _debugGroup.add(_boxHelper);
        }
        _boxHelper.box.copy(box);
    }

    private static detectWorldCollisions(player: Player, world: World): CollisionEvent[] {
        const nearby = world.getNearby(player.mesh.position, 20);
        const events: CollisionEvent[] = [];
        
        nearby.forEach(obj => {
            _objBox.setFromObject(obj.mesh);
            if (!_playerBox.intersectsBox(_objBox)) return;

            if (obj.type === 'item') events.push({ type: 'COLLECT', target: obj });
            else if (obj.type === 'gate') events.push({ type: 'UNLOCK', target: obj });
            else if (obj.isStatic) events.push({ type: 'SOLID', target: obj });
        });
        
        return events;
    }

    private static detectDragonCollisions(player: Player, dragonSys: DragonSystem): CollisionEvent[] {
        _spearBox.setFromObject(player.spear);
        const events: CollisionEvent[] = [];

        dragonSys.dragons.forEach(dragon => {
            if (dragon.isDead) return;

            // Check Slay (Spear vs Head)
            _headBox.setFromObject(dragon.segments[0].mesh);
            if (player.isThrusting && _spearBox.intersectsBox(_headBox)) {
                events.push({ type: 'SLAY', dragon });
            }

            // Check Death (Player vs Any Segment)
            const isEaten = dragon.segments.some(seg => {
                _objBox.setFromObject(seg.mesh);
                return _playerBox.intersectsBox(_objBox);
            });

            if (isEaten) events.push({ type: 'DIE' });
        });

        return events;
    }

    private static handleReaction(event: CollisionEvent, world: World, player: Player, state: GameStateData) {
        switch (event.type) {
            case 'COLLECT': {
                Audio.playCollect();
                const itemType = event.target.mesh.userData.itemType as ItemType;
                InventorySystem.addItem(itemType);
                this.removeFromWorld(event.target, world);
                if (itemType === 'CHALICE') state.hasWon = true;
                break;
            }
            case 'UNLOCK': {
                const requiredKey = event.target.mesh.userData.keyType as ItemType;
                if (state.inventory.some(k => k.type === requiredKey)) {
                    this.removeFromWorld(event.target, world);
                }
                break;
            }
            case 'SOLID': {
                _diff.subVectors(player.mesh.position, event.target.mesh.position);
                _diff.y = 0;
                player.mesh.position.add(_diff.normalize().multiplyScalar(0.4));
                break;
            }
            case 'SLAY': {
                Audio.playSlay();
                event.dragon.isDead = true;
                event.dragon.segments.forEach(s => s.mesh.visible = false);
                break;
            }
            case 'DIE': {
                Audio.playDie();
                state.isDead = true;
                break;
            }
        }
    }


    private static removeFromWorld(obj: WorldObject, world: World) {
        world.scene.remove(obj.mesh);
        world.removeFromGrid(obj);
        const idx = world.objects.indexOf(obj);
        if (idx !== -1) world.objects.splice(idx, 1);
    }
}
