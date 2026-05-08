import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { DragonSystem } from './Dragons';
import { Systems } from './Systems';
import { InventorySystem } from './InventorySystem';
import { GameState } from './GameState';

export class Game {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  world: World;
  player: Player;
  dragons: DragonSystem;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background

    // Isometric Orthographic Camera
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    this.camera.position.set(20, 20, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = false;
    container.appendChild(this.renderer.domElement);

    // Identify GPU
    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuName = "Standard WebGL";
    if (debugInfo) {
      gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    // "Basic Render Driver" is a Windows software fallback
    const isSoftware = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(gpuName);
    GameState.debug.gpu = `${isSoftware ? '[CPU Rendering] ' : '[GPU Accelerated] '} ${gpuName}`;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = false;
    this.scene.add(dirLight);

    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.dragons = new DragonSystem(this.scene);

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('wheel', (e) => {
        InventorySystem.scroll(e.deltaY);
    });

    this.animate();
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  lastTime = performance.now();
  frames = 0;
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const now = performance.now();
    this.frames++;
    if (now > this.lastTime + 1000) {
        GameState.debug.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        GameState.debug.drawCalls = this.renderer.info.render.calls;
        GameState.debug.triangles = this.renderer.info.render.triangles;
        GameState.debug.objectCount = this.world.objects.length;
        this.lastTime = now;
        this.frames = 0;
    }

    this.player.update();
    this.dragons.update();
    Systems.checkCollisions(this.player, this.world, this.dragons);

    // Update POIs for Minimap - Only update every 5th frame
    if (this.frames % 5 === 0) {
        GameState.pois = [];
        const playerPos = this.player.mesh.position;
        
        // Dragons
        this.dragons.dragons.forEach((d, i) => {
            if (d.isDead) return;
            GameState.pois.push({
                id: `dragon-${i}`, type: 'dragon', pos: d.position.clone(),
                color: d.type === 'RHYNODON' ? 0xff0000 : (d.type === 'GORGARYS' ? 0x00ff00 : 0xffff00)
            });
        });

        // Use spatial grid to only add nearby elements to minimap
        // This is MUCH faster than iterating over all world objects
        const nearby = this.world.getNearby(playerPos, 80);
        nearby.forEach((obj, i) => {
            if (obj.type === 'item') {
               GameState.pois.push({ id: `item-${i}`, type: 'item', pos: obj.mesh.position.clone(), color: 0xff00ff });
            } else if (obj.type === 'gate') {
               GameState.pois.push({ id: `gate-${i}`, type: 'gate', pos: obj.mesh.position.clone(), color: 0xffffff });
            }
        });
    }

    // Follow camera
    this.camera.position.x = this.player.mesh.position.x + 20;
    this.camera.position.z = this.player.mesh.position.z + 20;
    this.camera.lookAt(this.player.mesh.position);
    
    this.renderer.render(this.scene, this.camera);
  }
}
