import * as THREE from 'three';
import { GameState } from './GameState';

export class Player {
  mesh: THREE.Group;
  spear: THREE.Mesh;
  scene: THREE.Scene;
  speed = 0.45; // Increased speed
  input = { forward: false, backward: false, left: false, right: false };
  isThrusting = false;
  thrustTimer = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    
    // Simple low-poly player (Square/Diamond shape)
    const bodyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.75;
    this.mesh.add(body);

    const eyeGeo = new THREE.BoxGeometry(0.8, 0.3, 0.3);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 1.2, 0.6); // Eyes at local +Z (Forward)
    this.mesh.add(eye);

    // Spear
    const spearGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const spearMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    this.spear = new THREE.Mesh(spearGeo, spearMat);
    this.spear.rotation.x = Math.PI / 2;
    this.spear.position.set(0.6, 1, 0.4); // Offset to right and front (+Z)
    this.mesh.add(this.spear);

    this.scene.add(this.mesh);
    this.setupInput();
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.handleKey(e.code, true);
    });
    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });
    window.addEventListener('mousedown', () => {
        this.thrust();
    });
  }

  private handleKey(code: string, pressed: boolean) {
    switch (code) {
      case 'KeyW': this.input.forward = pressed; break;
      case 'KeyS': this.input.backward = pressed; break;
      case 'KeyA': this.input.left = pressed; break;
      case 'KeyD': this.input.right = pressed; break;
    }
  }

  thrust() {
    if (this.isThrusting) return;
    this.isThrusting = true;
    this.thrustTimer = 12; // Snappier thrust
  }

  update() {
    const move = new THREE.Vector3();
    if (this.input.forward) move.z -= 1;
    if (this.input.backward) move.z += 1;
    if (this.input.left) move.x -= 1;
    if (this.input.right) move.x += 1;

    if (move.length() > 0) {
      move.normalize().multiplyScalar(this.speed);
      const targetRotation = Math.atan2(move.x, move.z);
      
      let diff = targetRotation - this.mesh.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.mesh.rotation.y += diff * 0.2;
      
      this.mesh.position.add(move);
    }

    // Spear animation
    if (this.isThrusting) {
        this.thrustTimer--;
        // Animation curve: t goes 0 -> 1 -> 0
        const progress = 1 - (this.thrustTimer / 15);
        const t = Math.sin(progress * Math.PI);
        this.spear.position.z = 0.4 + t * 2.5; // Forward thrust along +Z
        
        if (this.thrustTimer <= 0) {
            this.isThrusting = false;
            this.spear.position.set(0.6, 1, 0.4);
        }
    }

    GameState.playerPos.copy(this.mesh.position);
    GameState.playerRotation = this.mesh.rotation.y;
  }
}
