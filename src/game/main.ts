import * as THREE from 'three';
import { World } from './World';
import { Player } from './Player';
import { DragonSystem } from './Dragons';
import { Systems } from './Systems';
import { InventorySystem } from './InventorySystem';
import { GameState } from './GameState';
import { Audio } from './AudioSystem';
import { CloudBat } from './CloudBat';
import dragonConfig from './config/dragons.json';

// Rule 9: Scratch object for camera follow
const _camOffset = new THREE.Vector3(0, 30, 30);

export class Game {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  world: World;
  player: Player;
  dragons: DragonSystem;
  cloudBat: CloudBat;
  ambient: THREE.AmbientLight;
  dirLight: THREE.DirectionalLight;
  lastTime: number = performance.now();
  fpsLastTime: number = performance.now();
  frames: number = 0;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
    this.camera.position.copy(_camOffset);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: false,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.initHardwareInfo();
    this.initLights();

    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.dragons = new DragonSystem(this.scene);
    this.cloudBat = new CloudBat(this.scene, 400);

    this.setupEvents();
    this.animate();
  }

  private initHardwareInfo() {
    const gl = this.renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let gpuName = "Standard WebGL";
    if (debugInfo) {
      gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    const isSoftware = /SwiftShader|llvmpipe|Software|Basic Render Driver/i.test(gpuName);
    GameState.debug.gpu = `${isSoftware ? '[CPU] ' : '[GPU] '} ${gpuName}`;
  }

  private initLights() {
    this.ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.dirLight.position.set(50, 100, 50);
    this.scene.add(this.ambient, this.dirLight);
  }

  private setupEvents() {
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('wheel', (e) => InventorySystem.scroll(e.deltaY));
  }

  private onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 20;
    this.camera.left = -d * aspect;
    this.camera.right = d * aspect;
    this.camera.top = d;
    this.camera.bottom = -d;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.updateLogic(dt, now);
    this.render();
  }

  private updateLogic(dt: number, now: number) {
    this.frames++;
    this.updateDebugStats(now);

    if (!GameState.isInitialized || GameState.isPaused) return;

    this.player.update(dt);
    this.dragons.update(dt);
    this.cloudBat.update(dt, this.world, now);
    Systems.checkCollisions(this.player, this.world, this.dragons, this.cloudBat, GameState);
    Audio.update(GameState);

    if (this.frames % 5 === 0) {
        this.updateMinimap();
    }
  }

  private updateDebugStats(now: number) {
    if (now < this.fpsLastTime + 1000) return;
    
    GameState.debug.fps = Math.round((this.frames * 1000) / (now - this.fpsLastTime));
    GameState.debug.drawCalls = this.renderer.info.render.calls;
    GameState.debug.triangles = this.renderer.info.render.triangles;
    GameState.debug.objectCount = this.world.objects.length;
    
    this.fpsLastTime = now;
    this.frames = 0;
  }

  private updateMinimap() {
    const dragonPois = this.dragons.dragons
        .filter(d => !d.isDead)
        .map((d) => ({
            id: d.id, 
            type: 'dragon' as const, 
            pos: d.position.clone(),
            color: (dragonConfig.dragonTypes as any)[d.type]?.color || 0xffffff
        }));

    const nearby = this.world.getNearby(this.player.mesh.position, 80);
    const objectPois = nearby
        .map((obj) => {
            let color = 0xffffff;
            if (obj.type === 'item') color = 0xff00ff;
            else if (obj.type === 'tree') color = 0x10b981;
            else if (obj.type === 'bush') color = 0x34d399;
            else if (obj.type === 'water') color = 0x60a5fa;
            else if (obj.type === 'gate') color = 0xfacc15;

            return {
                id: obj.id,
                type: (obj.type as any),
                pos: obj.mesh.position.clone(),
                color
            };
        });

    const batPoi = {
        id: this.cloudBat.id,
        type: 'bat' as const,
        pos: this.cloudBat.mesh.position.clone(),
        color: 0x9333ea as any
    };

    GameState.pois = [...dragonPois, ...objectPois, batPoi];
  }

  private render() {
    // Dynamic Lighting based on zone
    const isOutdoor = GameState.isOutdoor;
    this.ambient.intensity = THREE.MathUtils.lerp(this.ambient.intensity, isOutdoor ? 0.6 : 0.05, 0.1);
    this.dirLight.intensity = THREE.MathUtils.lerp(this.dirLight.intensity, isOutdoor ? 0.8 : 0.05, 0.1);
    this.scene.background = new THREE.Color(isOutdoor ? 0x87ceeb : 0x000000);

    this.camera.position.x = this.player.mesh.position.x + _camOffset.x;
    this.camera.position.y = this.player.mesh.position.y + _camOffset.y;
    this.camera.position.z = this.player.mesh.position.z + _camOffset.z;
    this.camera.lookAt(this.player.mesh.position);
    
    this.renderer.render(this.scene, this.camera);
  }
}
