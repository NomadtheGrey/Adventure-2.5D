import * as THREE from 'three';
import { Player } from '../Player';
import { World } from '../World';
import { CloudBat } from '../CloudBat';
import { GameStateData, ItemType } from '../GameState';

const _diff = new THREE.Vector3();

export class ItemEffectSystem {
    public static update(player: Player, world: World, bat: CloudBat, state: GameStateData) {
        const activeItem = state.inventory[state.activeIndex];
        const hasMagnet = state.inventory.some(i => i.type === ItemType.MAGNET);
        const isMagnetActive = activeItem?.type === ItemType.MAGNET;
        
        // Bat Magnetization
        if (hasMagnet && isMagnetActive && bat.getCarriedItem()) {
            const dist = bat.mesh.position.distanceTo(player.mesh.position);
            bat.setMagnetized(dist < 40);
        } else {
            bat.setMagnetized(false);
        }

        if (!hasMagnet) return;

        // Item Attraction
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
}
