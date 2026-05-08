import * as THREE from 'three';
import { GameState } from './GameState';

export enum DragonType {
  YVITHRAX = 'YVITHRAX', // Yellow, steals
  GORGARYS = 'GORGARYS', // Green, guards key
  RHYNODON = 'RHYNODON', // Red, stalks
}

class DragonSegment {
    mesh: THREE.Mesh;
    constructor(scene: THREE.Scene, color: number) {
        const geo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const mat = new THREE.MeshLambertMaterial({ color });
        this.mesh = new THREE.Mesh(geo, mat);
        scene.add(this.mesh);
    }
}

export class Dragon {
  type: DragonType;
  scene: THREE.Scene;
  segments: DragonSegment[] = [];
  segmentHistory: THREE.Vector3[] = [];
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  speed = 0.12;
  isDead = false;
  guardTarget?: THREE.Vector3;

  constructor(scene: THREE.Scene, type: DragonType, color: number, startPos: THREE.Vector3) {
    this.scene = scene;
    this.type = type;
    this.position.copy(startPos);

    for (let i = 0; i < 6; i++) {
        this.segments.push(new DragonSegment(scene, color));
        this.segmentHistory.push(new THREE.Vector3().copy(startPos));
    }
  }

  update() {
    if (this.isDead) return;

    const playerPos = GameState.playerPos;
    const dist = this.position.distanceTo(playerPos);
    const targetDir = new THREE.Vector3();

    switch (this.type) {
        case DragonType.RHYNODON:
            // Stalker: Always pursues player
            targetDir.subVectors(playerPos, this.position).normalize();
            break;
        case DragonType.GORGARYS:
            // Guard: Stays near home unless player is very close
            if (dist < 30) {
                targetDir.subVectors(playerPos, this.position).normalize();
            } else if (this.guardTarget) {
                targetDir.subVectors(this.guardTarget, this.position).normalize();
            }
            break;
        case DragonType.YVITHRAX:
            // Thief: Skittish, stays at a distance
            if (dist < 15) {
                targetDir.subVectors(this.position, playerPos).normalize();
            } else if (dist > 40) {
                targetDir.subVectors(playerPos, this.position).normalize();
            } else {
                // Circling or wandering
                targetDir.set(Math.sin(Date.now() * 0.001), 0, Math.cos(Date.now() * 0.001)).normalize();
            }
            break;
    }

    this.position.add(targetDir.multiplyScalar(this.speed));
    this.position.y = 1;

    // Segment Following Logic
    this.segmentHistory.unshift(this.position.clone());
    if (this.segmentHistory.length > 100) this.segmentHistory.pop();

    this.segments.forEach((seg, i) => {
        const historyIndex = i * 6;
        const pos = this.segmentHistory[historyIndex] || this.position;
        seg.mesh.position.lerp(pos, 0.3);
    });
  }
}

export class DragonSystem {
    dragons: Dragon[] = [];
    constructor(scene: THREE.Scene) {
        this.dragons.push(new Dragon(scene, DragonType.RHYNODON, 0xff0000, new THREE.Vector3(50, 1, 50)));
        
        const green = new Dragon(scene, DragonType.GORGARYS, 0x00ff00, new THREE.Vector3(-50, 1, -50));
        green.guardTarget = new THREE.Vector3(-50, 1, -50);
        this.dragons.push(green);

        this.dragons.push(new Dragon(scene, DragonType.YVITHRAX, 0xffff00, new THREE.Vector3(50, 1, -50)));
    }

    update() {
        this.dragons.forEach(d => d.update());
    }
}
