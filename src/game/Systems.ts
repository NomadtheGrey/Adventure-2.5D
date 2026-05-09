import * as THREE from 'three';
import { Player } from './Player';
import { World, WorldObject } from './World';
import { DragonSystem, Dragon } from './Dragons';
import { GameStateData, ItemType, GameState, ITEMS } from './GameState';
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

import { CloudBat } from './CloudBat';

export type CollisionEvent = 
    | { type: 'COLLECT'; target: WorldObject }
    | { type: 'UNLOCK'; target: WorldObject }
    | { type: 'PHASE'; target: WorldObject }
    | { type: 'SOLID'; target: WorldObject }
    | { type: 'SLAY'; dragon?: Dragon; bat?: CloudBat }
    | { type: 'DIE' };

export class Systems {
    static checkCollisions(player: Player, world: World, dragonSys: DragonSystem, bat: CloudBat, state: GameStateData) {
        _playerBox.setFromObject(player.mesh);
        
        if (state.debug.showPhysics) this.updateDebugVisuals(world.scene, _playerBox);

        // Update zone
        const distFromCenter = state.playerPos.length();
        state.currentZone = distFromCenter < 35 ? 'LANDING' : 'SECTOR';

        // Update messaging
        if (state.messageTimer > 0) {
            state.messageTimer -= 0.016; // Approx tick delta
            if (state.messageTimer <= 0) state.message = '';
        }

        // Update adaptive audio
        Audio.update(state);

        // Handle Item Effects (Magnet)
        this.applyItemEffects(player, world, bat, state);

        // Handle Drop Intent
        if (state.intentToDrop) {
            this.handleDrop(player, world, state);
            state.intentToDrop = false;
        }

        // Handle Map Boundaries
        this.checkBoundaries(player, state);

        // Detect and pipe reactions
        this.detectWorldCollisions(player, world)
            .forEach(event => this.handleReaction(event, world, player, state));

        this.detectEntityCollisions(player, dragonSys, bat)
            .forEach(event => this.handleReaction(event, world, player, state));
    }

    private static handleDrop(player: Player, world: World, state: GameStateData) {
        if (state.inventory.length === 0) return;
        const item = state.inventory[state.activeIndex];
        if (item.type === ItemType.SPEAR) return; // Cannot drop spear
        
        // Spawn item behind player to avoid immediate pickup
        const dropOffset = new THREE.Vector3(0, 0, 8).applyQuaternion(player.mesh.quaternion);
        const dropPos = player.mesh.position.clone().add(dropOffset);
        dropPos.y = 1;

        world.spawnItemAt(item.type, dropPos);
        InventorySystem.removeItem(item.type);
        state.lastDropTime = performance.now();
        Audio.playCollect(); 
    }

    private static checkBoundaries(player: Player, state: GameStateData) {
        const worldLimit = 270; 
        const outerLimit = 330; 
        const pos = player.mesh.position;

        // If in an interior hall, the boundaries are different
        if (Math.abs(pos.x) > 1000) {
            // Interior halls are at 5000, 8000 etc.
            const center = new THREE.Vector3(Math.round(pos.x / 1000) * 1000, 0, Math.round(pos.z / 1000) * 1000);
            _diff.subVectors(pos, center);
            // Main hall is 80x120
            if (Math.abs(_diff.x) > 35) pos.x = center.x + Math.sign(_diff.x) * 35;
            if (Math.abs(_diff.z) > 55) pos.z = center.z + Math.sign(_diff.z) * 55;
            return;
        }

        // Allowed "corridors" at cardinal points for castle access
        const isNearExit = (Math.abs(pos.x) < 35 && Math.abs(pos.z) > worldLimit - 25) || 
                          (Math.abs(pos.z) < 35 && Math.abs(pos.x) > worldLimit - 25);

        if (isNearExit) {
            // ENFORCE ROAD WALKING (only if we have crossed the main world limit)
            if (Math.abs(pos.z) > worldLimit) { // North or South corridors
                if (Math.abs(pos.x) > 8) pos.x = Math.sign(pos.x) * 8;
            }
            if (Math.abs(pos.x) > worldLimit) { // East or West corridors
                if (Math.abs(pos.z) > 8) pos.z = Math.sign(pos.z) * 8;
            }

            // Outer hard limit (edge of castle sector)
            if (Math.abs(pos.x) > outerLimit || Math.abs(pos.z) > outerLimit) {
                _diff.set(0, 0, 0);
                if (pos.x > outerLimit) _diff.x = -1;
                if (pos.x < -outerLimit) _diff.x = 1;
                if (pos.z > outerLimit) _diff.z = -1;
                if (pos.z < -outerLimit) _diff.z = 1;
                player.mesh.position.add(_diff.multiplyScalar(5));
            }
            return;
        }

        // Boundaries are strictly impassable.
        if (Math.abs(pos.x) > worldLimit || Math.abs(pos.z) > worldLimit) {
            _diff.set(0, 0, 0);
            if (pos.x > worldLimit) _diff.x = -1;
            if (pos.x < -worldLimit) _diff.x = 1;
            if (pos.z > worldLimit) _diff.z = -1;
            if (pos.z < -worldLimit) _diff.z = 1;
            
            Audio.playBoundary();
            player.mesh.position.add(_diff.multiplyScalar(3));
        }
    }

    private static applyItemEffects(player: Player, world: World, bat: CloudBat, state: GameStateData) {
        const activeItem = state.inventory[state.activeIndex];
        const hasMagnet = state.inventory.some(i => i.type === ItemType.MAGNET);
        
        const isMagnetActive = activeItem?.type === ItemType.MAGNET;
        
        // Magnet on Bat: if it holds an item, hero can hold it in place
        if (hasMagnet && isMagnetActive && bat.getCarriedItem()) {
            const dist = bat.mesh.position.distanceTo(player.mesh.position);
            if (dist < 40) {
                bat.setMagnetized(true);
            } else {
                bat.setMagnetized(false);
            }
        } else {
            bat.setMagnetized(false);
        }

        if (!hasMagnet) return;

        const attractiveForce = isMagnetActive ? 25 : 5; 
        const speed = isMagnetActive ? 15 : 3;

        const nearbyItems = world.getNearby(player.mesh.position, attractiveForce + 10);
        nearbyItems.forEach(obj => {
            if (obj.type !== 'item') return;

            const dist = obj.mesh.position.distanceTo(player.mesh.position);
            if (dist < attractiveForce) {
                _diff.subVectors(player.mesh.position, obj.mesh.position).normalize();
                obj.mesh.position.add(_diff.multiplyScalar(speed * 0.016)); 
            }
        });
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
        const activeItem = GameState.inventory[GameState.activeIndex];
        const canPhase = activeItem?.type === ItemType.BRIDGE;
        
        nearby.forEach(obj => {
            _objBox.setFromObject(obj.mesh);
            if (!_playerBox.intersectsBox(_objBox)) return;

            // Phase Bridge bypass logic - Only if BRIDGE is in inventory
            if (canPhase && (obj.type === 'tree' || obj.type === 'bush' || obj.type === 'water')) {
                events.push({ type: 'PHASE', target: obj });
                return;
            }

            if (obj.type === 'item') {
                events.push({ type: 'COLLECT', target: obj });
            } else if (obj.type === 'gate') {
                events.push({ type: 'UNLOCK', target: obj });
                events.push({ type: 'SOLID', target: obj });
            } else if (obj.isStatic) {
                events.push({ type: 'SOLID', target: obj });
            }
        });
        
        return events;
    }

    private static detectEntityCollisions(player: Player, dragonSys: DragonSystem, bat: CloudBat): CollisionEvent[] {
        _spearBox.setFromObject(player.spear);
        const events: CollisionEvent[] = [];

        // Bat collision
        _headBox.setFromObject(bat.mesh);
        if (player.isThrusting && _spearBox.intersectsBox(_headBox)) {
            events.push({ type: 'SLAY', bat });
        }

        dragonSys.dragons.forEach(dragon => {
            if (dragon.isDead) return;

            let slainThisFrame = false;

            // Check Slay (Spear vs Head)
            _headBox.setFromObject(dragon.segments[0].mesh);
            if (player.isThrusting && _spearBox.intersectsBox(_headBox)) {
                events.push({ type: 'SLAY', dragon });
                slainThisFrame = true;
            }

            // Only check for death if we didn't just slay it
            if (!slainThisFrame) {
                const isEaten = dragon.segments.some(seg => {
                    _objBox.setFromObject(seg.mesh);
                    return _playerBox.intersectsBox(_objBox);
                });

                if (isEaten) events.push({ type: 'DIE' });
            }
        });

        return events;
    }

    private static handleReaction(event: CollisionEvent, world: World, player: Player, state: GameStateData) {
        switch (event.type) {
            case 'COLLECT': {
                if (performance.now() - state.lastDropTime < 1000) break;
                
                const itemType = event.target.mesh.userData.itemType as ItemType;
                const itemDef = ITEMS[itemType];
                state.message = `PICKED UP: ${itemDef ? itemDef.name.toUpperCase() : itemType}`;
                state.messageTimer = 1.5;
                
                Audio.playCollect();
                InventorySystem.addItem(itemType);
                this.removeFromWorld(event.target, world);
                if (itemType === 'CHALICE') state.hasWon = true;
                break;
            }
            case 'UNLOCK': {
                const userData = event.target.mesh.userData;
                
                // Handle EXIT from interior
                if (userData.isExit) {
                    const target = userData.targetName;
                    state.message = "EXITING CASTLE";
                    state.messageTimer = 1.5;
                    
                    // Teleport back to just outside the gate in main world
                    if (target === 'NORTH_CASTLE') player.mesh.position.set(0, 2, -285);
                    else if (target === 'SOUTH_CASTLE') player.mesh.position.set(0, 2, 285);
                    else if (target === 'EAST_CASTLE') player.mesh.position.set(285, 2, 0);
                    else if (target === 'WEST_CASTLE') player.mesh.position.set(-285, 2, 0);
                    
                    Audio.playPhase();
                    break;
                }

                // Handle Interior Entrance Trigger
                if (userData.isInteriorTrigger) {
                    const type = userData.castleType;
                    state.message = "ENTERED HALL";
                    state.messageTimer = 1.5;
                    if (type === 'N') player.mesh.position.set(5000, 2, -4950);
                    else if (type === 'S') player.mesh.position.set(5000, 2, 5050);
                    else if (type === 'E') player.mesh.position.set(8000, 2, 50);
                    else if (type === 'W') player.mesh.position.set(-8000, 2, 50);
                    Audio.playPhase();
                    break;
                }

                const requiredKey = userData.keyType as ItemType;
                const hasKey = state.inventory.some(k => k.type === requiredKey);

                if (hasKey) {
                    state.message = "GATE OPENED";
                    state.messageTimer = 1.5;
                    this.removeFromWorld(event.target, world);
                    Audio.playCollect();
                } else {
                    state.message = `YOU NEED THE ${requiredKey.replace('KEY_', '')} KEY`;
                    state.messageTimer = 3; 
                }
                break;
            }
            case 'PHASE': {
                if (state.isPhasing) break; // Debounce
                Audio.playPhase();
                state.isPhasing = true;
                
                // Teleport player through the object
                // Use player's forward vector to determine teleport direction
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.mesh.quaternion);
                player.mesh.position.add(forward.multiplyScalar(15)); // Warp 15 units forward (past the object)
                
                setTimeout(() => {
                    state.isPhasing = false;
                }, 250);
                break;
            }
            case 'SOLID': {
                _diff.subVectors(player.mesh.position, event.target!.mesh.position);
                _diff.y = 0;
                if (_diff.lengthSq() < 0.0001) {
                    _diff.set(Math.random() - 0.5, 0, Math.random() - 0.5);
                }
                player.mesh.position.add(_diff.normalize().multiplyScalar(1.2)); // Stronger push-back to prevent overlap sticking
                break;
            }
            case 'SLAY': {
                if (event.dragon) {
                    Audio.playSlay();
                    event.dragon.isDead = true;
                    event.dragon.segments.forEach(s => s.mesh.visible = false);
                }
                if (event.bat) {
                    event.bat.hit();
                }
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
