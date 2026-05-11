import * as THREE from 'three';
import { Player } from '../Player';
import { GameStateData } from '../GameState';
import { Audio } from '../AudioSystem';

const _diff = new THREE.Vector3();

export class BoundarySystem {
    public static update(player: Player, state: GameStateData) {
        const worldLimit = 270; 
        const outerLimit = 330; 
        const pos = player.mesh.position;

        // Interior Halls - Clamp movement to room dimensions
        if (Math.abs(pos.x) > 1000) {
            const center = new THREE.Vector3(Math.round(pos.x / 1000) * 1000, 0, Math.round(pos.z / 1000) * 1000);
            _diff.subVectors(pos, center);
            if (Math.abs(_diff.x) > 39) pos.x = center.x + Math.sign(_diff.x) * 39;
            if (Math.abs(_diff.z) > 59) pos.z = center.z + Math.sign(_diff.z) * 59;
            return;
        }

        const isNearExit = (Math.abs(pos.x) < 35 && Math.abs(pos.z) > worldLimit - 25) || 
                          (Math.abs(pos.z) < 35 && Math.abs(pos.x) > worldLimit - 25);

        if (isNearExit) {
            if (Math.abs(pos.z) > worldLimit) {
                if (Math.abs(pos.x) > 8) pos.x = Math.sign(pos.x) * 8;
            }
            if (Math.abs(pos.x) > worldLimit) {
                if (Math.abs(pos.z) > 8) pos.z = Math.sign(pos.z) * 8;
            }
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
}
