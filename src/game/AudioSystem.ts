import { GameState, GameStateData } from './GameState';
import { DroneSynthesizer } from './audio/DroneSynthesizer';
import { EffectSynthesizer } from './audio/EffectSynthesizer';

/**
 * Procedural Audio System (Rule 5: Separate Doing from Thinking)
 * Orchestrates synthesizers for techno-simulation sounds.
 */
export class AudioManager {
    public ctx: AudioContext | null = null;
    public masterBus: GainNode | null = null;
    public droneSynth: DroneSynthesizer | null = null;
    public effectSynth: EffectSynthesizer | null = null;

    constructor() {
        // Singleton guard via global window object
        if ((window as any)._AudioSystemInstance) {
            return (window as any)._AudioSystemInstance;
        }
        (window as any)._AudioSystemInstance = this;
        (window as any)._AudioSystem = this; // Helpful shortcut
    }

    public init() {
        // If already fully initialized, don't repeat
        if (this.ctx && this.effectSynth && this.droneSynth) return;

        try {
            console.log("AudioSystem: Initializing...");
            
            // Clean up old context if half-baked
            if (this.ctx) {
                try { this.ctx.close(); } catch(e) {}
                this.ctx = null;
            }

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                console.error("AudioSystem: No AudioContext support found.");
                return;
            }

            this.ctx = new AudioContextClass();
            if (!this.ctx) {
                console.error("AudioSystem: Failed to create AudioContext");
                return;
            }

            this.masterBus = this.ctx.createGain();
            this.masterBus.gain.value = 1.0; 
            this.masterBus.connect(this.ctx.destination);

            this.droneSynth = new DroneSynthesizer(this.ctx, this.masterBus);
            this.effectSynth = new EffectSynthesizer(this.ctx, this.masterBus);

            // Trigger start on drone
            this.droneSynth.start();
            
            console.log("AudioSystem: Successfully Initialized. State:", this.ctx.state);
        } catch (e) {
            console.error("AudioSystem: Initialization failed critically:", e);
            this.ctx = null;
            this.effectSynth = null;
            this.droneSynth = null;
        }
    }

    public resume() {
        if (this.ctx && (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted')) {
            console.log("AudioSystem: Resuming context from state:", this.ctx.state);
            this.ctx.resume().then(() => {
                console.log("AudioSystem: Resumed. State:", this.ctx?.state);
            }).catch(err => {
                console.error("AudioSystem: Resume error:", err);
            });
        }
    }

    public playRadarPulse() {
        if (!this.effectSynth || GameState.audio.isRadarMuted) return;
        console.log("AudioSystem: playing radar pulse");
        this.effectSynth.beep(440, 0.05, 'sine', 0);
        this.effectSynth.beep(880, 0.02, 'sine', 0.05);
    }

    public playUIClick() {
        if (!this.effectSynth) {
            console.warn("AudioSystem: playUIClick called but effectSynth is null");
            return;
        }
        console.log("AudioSystem: playing click");
        this.effectSynth.beep(2000, 0.01, 'sine', 0);
    }

    public playCollect() {
        if (!this.effectSynth) return;
        this.effectSynth.beep(880, 0.1, 'square');
        this.effectSynth.beep(1320, 0.1, 'square', 0.05);
    }

    public playSlay() {
        if (!this.effectSynth) return;
        this.effectSynth.noise(0.3, 0.5);
        this.effectSynth.beep(220, 0.3, 'sawtooth');
    }

    public playDie() {
        if (!this.effectSynth) return;
        this.effectSynth.beep(110, 0.5, 'square');
        this.effectSynth.noise(0.8, 1.0);
    }

    public playPhase() {
        if (!this.effectSynth) return;
        this.effectSynth.beep(200, 0.1, 'sine', 0);
        this.effectSynth.beep(800, 0.1, 'sawtooth', 0.05);
        this.effectSynth.noise(0.05, 0.2);
    }

    public playBoundary() {
        if (!this.effectSynth) return;
        this.effectSynth.noise(0.3, 0.5);
    }

    public update(state: GameStateData) {
        if (!this.ctx || !this.masterBus || !this.droneSynth) return;

        // Efficient resume check
        if (this.ctx.state === 'suspended' && state.isInitialized) {
            this.resume();
            return; // Wait for resume before continuing
        }

        if (this.ctx.state !== 'running') return;

        if (state.audio.isMuted || state.isPaused) {
            this.masterBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2); 
            return;
        }

        if (state.isDead) {
            this.masterBus.gain.setTargetAtTime(0, this.ctx.currentTime, 3.0);
            return;
        }

        // Threat Detection
        const hostiles = state.pois.filter(p => p.type === 'dragon');
        let maxThreat = 0;
        hostiles.forEach(d => {
            const dist = state.playerPos.distanceTo(d.pos);
            const intensity = Math.max(0, 1 - (dist / 50)); 
            if (intensity > maxThreat) maxThreat = intensity;
        });

        this.masterBus.gain.setTargetAtTime(0.3 + (maxThreat * 0.2), this.ctx.currentTime, 0.5);
        this.droneSynth.update(state, maxThreat);

        if (maxThreat > 0.8 && Math.random() > 0.98 && this.effectSynth) {
            this.effectSynth.noise(0.05, 0.2 * maxThreat);
        }
    }
}

export const Audio = (window as any)._AudioSystemInstance || new AudioManager();
(window as any)._AudioSystemInstance = Audio;
