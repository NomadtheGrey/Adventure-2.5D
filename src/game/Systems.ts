import * as THREE from 'three';
import { Player } from './Player';
import { World } from './World';
import { DragonSystem } from './Dragons';
import { GameStateData, ItemType, GameState } from './GameState';
import { InventorySystem } from './InventorySystem';
import { Audio } from './AudioSystem';
import { CloudBat } from './CloudBat';

import { BoundarySystem } from './systems/BoundarySystem';
import { CollisionSystem } from './systems/CollisionSystem';
import { ItemEffectSystem } from './systems/ItemEffectSystem';
import { ReactionSystem } from './systems/ReactionSystem';
import { TelemetrySystem } from './systems/TelemetrySystem';

// Rule 14: Debug visuals
let _debugGroup: THREE.Group | null = null;
const _boxHelper = new THREE.Box3Helper(new THREE.Box3(), 0xffff00);

export class Systems {
    static checkCollisions(player: Player, world: World, dragonSys: DragonSystem, bat: CloudBat, state: GameStateData) {
        if (state.debug.showPhysics) this.updateDebugVisuals(world.scene, CollisionSystem.getPlayerBox());

        // Update telemetry
        TelemetrySystem.update();

        // Update adaptive audio
        Audio.update(state);

        // Update zone & context
        const distFromCenter = state.playerPos.length();
        state.currentZone = distFromCenter < 35 ? 'LANDING' : 'SECTOR';

        if (state.messageTimer > 0) {
            state.messageTimer -= 0.016;
            if (state.messageTimer <= 0) state.message = '';
        }

        ItemEffectSystem.update(player, world, bat, state);
        
        if (state.intentToDrop) {
            this.handleDrop(player, world, state);
            state.intentToDrop = false;
        }

        BoundarySystem.update(player, state);

        // Core Pipeline: Detect -> React
        const events = [
            ...CollisionSystem.getEvents(player, world, dragonSys, bat),
        ];

        events.forEach(e => ReactionSystem.handle(e, world, player, state));
    }

    private static handleDrop(player: Player, world: World, state: GameStateData) {
        if (state.inventory.length === 0) return;
        const item = state.inventory[state.activeIndex];
        if (item.type === ItemType.SPEAR) return;
        
        const dropOffset = new THREE.Vector3(0, 0, 8).applyQuaternion(player.mesh.quaternion);
        const dropPos = player.mesh.position.clone().add(dropOffset);
        dropPos.y = 1;

        world.spawnItemAt(item.type, dropPos);
        InventorySystem.removeItem(item.type);
        state.lastDropTime = performance.now();
        Audio.playCollect(); 
    }

    private static updateDebugVisuals(scene: THREE.Scene, box: THREE.Box3) {
        if (!_debugGroup) {
            _debugGroup = new THREE.Group();
            scene.add(_debugGroup);
            _debugGroup.add(_boxHelper);
        }
        _boxHelper.box.copy(box);
    }
}
