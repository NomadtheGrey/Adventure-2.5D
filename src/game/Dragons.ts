import * as THREE from 'three';
import { GameState } from './GameState';
import dragonConfig from './config/dragons.json';

export enum DragonType {
  YVITHRAX = 'YVITHRAX',
  GORGARYS = 'GORGARYS',
  RHYNODON = 'RHYNODON',
}

interface BehaviorContext {
    dragon: Dragon;
    dist: number;
    playerPos: THREE.Vector3;
    config: any;
}

// Rule 9: Re-usable scratch vectors for math
const _strategyVec = new THREE.Vector3();
const _tempDir = new THREE.Vector3();

const behaviorStrategies: Record<string, (ctx: BehaviorContext) => THREE.Vector3> = {
    stalker: ({ playerPos, dragon }) => 
        _strategyVec.subVectors(playerPos, dragon.position).normalize(),
    
    guard: ({ dist, playerPos, dragon, config }) => {
        if (dist < (config.guardRange || 30)) return _strategyVec.subVectors(playerPos, dragon.position).normalize();
        if (dragon.guardTarget) return _strategyVec.subVectors(dragon.guardTarget, dragon.position).normalize();
        return _strategyVec.set(0, 0, 0);
    },
    
    thief: ({ dist, playerPos, dragon, config }) => {
        if (dist < (config.skittishRange || 15)) return _strategyVec.subVectors(dragon.position, playerPos).normalize();
        if (dist > (config.fleeRange || 40)) return _strategyVec.subVectors(playerPos, dragon.position).normalize();
        return _strategyVec.set(Math.sin(performance.now() * 0.001), 0, Math.cos(performance.now() * 0.001)).normalize();
    }
};

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
  id: string;
  type: DragonType;
  scene: THREE.Scene;
  segments: DragonSegment[] = [];
  segmentHistory: THREE.Vector3[] = [];
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  speed: number;
  isDead = false;
  guardTarget?: THREE.Vector3;
  private readonly historyLimit = 100;

  constructor(scene: THREE.Scene, type: DragonType, startPos: THREE.Vector3) {
    this.id = `dragon-${type}-${Math.random()}`;
    this.scene = scene;
    this.type = type;
    this.position.copy(startPos);

    const config = (dragonConfig.dragonTypes as any)[type];
    this.speed = config.speed || 8;
    const color = config.color || 0xffffff;

    this.segments = Array.from({ length: 6 }, () => new DragonSegment(scene, color));
    
    // Rule 9: Pre-allocate history pool to avoid garbage collection
    this.segmentHistory = Array.from({ length: this.historyLimit }, () => new THREE.Vector3().copy(startPos));
  }

  update(dt: number) {
    if (this.isDead) return;

    const playerPos = GameState.playerPos;
    const dist = this.position.distanceTo(playerPos);
    const config = (dragonConfig.dragonTypes as any)[this.type];
    
    const strategy = behaviorStrategies[config.behavior];
    const targetDir = strategy ? strategy({ dragon: this, dist, playerPos, config }) : _tempDir.set(0,0,0);

    // SAFE ZONE REPULSION: Stay out of the Landing Cradle (40 units radius)
    const distFromCenter = this.position.length();
    if (distFromCenter < 42) {
        _tempDir.copy(this.position).normalize(); // Vector pointing away from center
        const blend = Math.max(0, (42 - distFromCenter) / 10); // Strength of repulsion
        targetDir.lerp(_tempDir, blend).normalize();
    }

    this.position.add(_tempDir.copy(targetDir).multiplyScalar(this.speed * dt));
    this.position.y = 1;

    this.updateSegments(dt);
  }

  private updateSegments(dt: number) {
    // Rule 9: Cycle history without allocating new objects
    const last = this.segmentHistory.pop()!;
    last.copy(this.position);
    this.segmentHistory.unshift(last);

    this.segments.forEach((seg, i) => {
        const historyIndex = Math.min(i * 3, this.segmentHistory.length - 1);
        const targetPos = this.segmentHistory[historyIndex];
        seg.mesh.position.lerp(targetPos, Math.min(10 * dt, 1));
    });
  }
}

export class DragonSystem {
    dragons: Dragon[] = [];
    constructor(scene: THREE.Scene) {
        this.dragons.push(new Dragon(scene, DragonType.RHYNODON, new THREE.Vector3(120, 1, 120)));
        
        const green = new Dragon(scene, DragonType.GORGARYS, new THREE.Vector3(-120, 1, -120));
        green.guardTarget = new THREE.Vector3(-120, 1, -120);
        this.dragons.push(green);

        this.dragons.push(new Dragon(scene, DragonType.YVITHRAX, new THREE.Vector3(120, 1, -120)));
    }

    update(dt: number) {
        this.dragons.forEach(d => d.update(dt));
    }
}

