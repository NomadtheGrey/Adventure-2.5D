import * as THREE from 'three';
import { GameState } from './GameState';
import { Seconds, Meters } from '../types';
import playerConfig from './config/player.json';

// Rule 9: Scratch objects to avoid GC pressure in the loop
const _moveVector = new THREE.Vector3();

export class Player {
  mesh: THREE.Group;
  spear: THREE.Mesh;
  scene: THREE.Scene;
  speed: Meters;
  input = { forward: false, backward: false, left: false, right: false };
  isThrusting = false;
  thrustTimer: Seconds = 0;
  thrustDuration: Seconds;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.speed = playerConfig.moveSpeed;
    this.thrustDuration = playerConfig.thrust.duration;
    
    this.mesh = new THREE.Group();
    this.initVisuals();
    this.scene.add(this.mesh);
    this.setupInput();
  }

  private initVisuals() {
    const { thrust: thrustConf } = playerConfig;
    const coreColor = 0x34d399; // emerald-400
    
    // The Core: Faceted geometric heart
    const coreGeo = new THREE.IcosahedronGeometry(0.8, 0);
    const coreMat = new THREE.MeshPhongMaterial({ 
        color: coreColor, 
        emissive: coreColor, 
        emissiveIntensity: 0.5,
        flatShading: true 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 1;
    this.mesh.add(core);
    
    // The Ring: Orbiting data/energy track
    const ringGeo = new THREE.TorusGeometry(1.2, 0.03, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 1;
    this.mesh.add(ring);

    // Spear setup
    const spearGeo = new THREE.BoxGeometry(0.1, 0.1, 3);
    const spearMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
    this.spear = new THREE.Mesh(spearGeo, spearMat);
    this.spear.position.set(0, 1, -0.4);
    this.mesh.add(this.spear);

    // Dynamic animation handle
    this.mesh.onBeforeRender = () => {
        core.rotation.y += 0.02;
        core.rotation.x += 0.01;
        ring.rotation.z -= 0.01;
        // Hovering effect
        const hover = Math.sin(performance.now() * 0.003) * 0.1;
        core.position.y = 1 + hover;
        ring.position.y = 1 + hover;
        this.spear.position.y = 1 + hover;
    };
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => this.handleKey(e.code, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.code, false));
    window.addEventListener('mousedown', () => this.thrust());
    window.addEventListener('touchstart', () => this.thrust());
  }

  private handleKey(code: string, pressed: boolean) {
    const keyMap: Record<string, keyof typeof this.input> = {
        'KeyW': 'forward',
        'KeyS': 'backward',
        'KeyA': 'left',
        'KeyD': 'right'
    };
    
    if (keyMap[code]) {
        this.input[keyMap[code]] = pressed;
    }
  }

  thrust() {
    if (this.isThrusting) return;
    this.isThrusting = true;
    this.thrustTimer = this.thrustDuration;
  }

  update(dt: number) {
    this.handleMovement(dt);
    this.handleAnimation(dt);
    this.syncState();
  }

  private handleMovement(dt: number) {
    _moveVector.set(0, 0, 0);
    if (this.input.forward) _moveVector.z -= 1;
    if (this.input.backward) _moveVector.z += 1;
    if (this.input.left) _moveVector.x -= 1;
    if (this.input.right) _moveVector.x += 1;

    if (_moveVector.lengthSq() > 0) {
      _moveVector.normalize().multiplyScalar(this.speed * dt);
      
      const targetRotation = Math.atan2(-_moveVector.x, -_moveVector.z);
      const diff = this.normalizeAngle(targetRotation - this.mesh.rotation.y);
      
      this.mesh.rotation.y += diff * Math.min(10 * dt, 1);
      this.mesh.position.add(_moveVector);
    }
  }

  private handleAnimation(dt: number) {
    if (!this.isThrusting) return;

    this.thrustTimer -= dt;
    const progress = 1 - (this.thrustTimer / this.thrustDuration);
    const t = Math.sin(progress * Math.PI);
    
    this.spear.position.z = -0.4 - t * playerConfig.thrust.distance; 
    
    if (this.thrustTimer <= 0) {
        this.isThrusting = false;
        this.spear.position.z = -0.4;
    }
  }

  private syncState() {
    GameState.playerPos.copy(this.mesh.position);
    GameState.playerRotation = this.mesh.rotation.y;
  }

  private normalizeAngle(angle: number): number {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
  }
}
