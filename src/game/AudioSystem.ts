import { GameState, GameStateData } from './GameState';
import { DroneSynthesizer } from './audio/DroneSynthesizer';
import { EffectSynthesizer } from './audio/EffectSynthesizer';

/**
 * Procedural Audio System (Rule 5: Separate Doing from Thinking)
 * Orchestrates synthesizers for techno-simulation sounds.
 */
export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterBus: GainNode | null = null;
    private droneSynth: DroneSynthesizer | null = null;
    private effectSynth: EffectSynthesizer | null = null;

    public init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterBus = this.ctx.createGain();
        this.masterBus.gain.value = 0.15;
        this.masterBus.connect(this.ctx.destination);

        this.droneSynth = new DroneSynthesizer(this.ctx, this.masterBus);
        this.effectSynth = new EffectSynthesizer(this.ctx, this.masterBus);

        this.droneSynth.start();
    }

    public playRadarPulse() {
        if (!this.effectSynth || GameState.audio.isRadarMuted) return;
        this.effectSynth.beep(440, 0.05, 'sine', 0);
        this.effectSynth.beep(880, 0.02, 'sine', 0.05);
    }

    public playUIClick() {
        if (!this.effectSynth) return;
        this.effectSynth.beep(2000, 0.01, 'sine', 0);
        this.effectSynth.beep(4000, 0.01, 'sine', 0.01);
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
        if (!this.ctx || this.ctx.state !== 'running' || !this.masterBus || !this.droneSynth) return;

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

        this.masterBus.gain.setTargetAtTime(0.15 + (maxThreat * 0.1), this.ctx.currentTime, 0.5);
        this.droneSynth.update(state, maxThreat);

        if (maxThreat > 0.8 && Math.random() > 0.98 && this.effectSynth) {
            this.effectSynth.noise(0.05, 0.05 * maxThreat);
        }
    }
}

export const Audio = new AudioManager();
