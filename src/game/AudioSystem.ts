import { GameState, GameStateData, ItemType } from './GameState';

/**
 * Procedural Audio System (Rule 5: Separate Doing from Thinking)
 * Generates techno-simulation sounds using Web Audio API.
 */
export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterBus: GainNode | null = null;
    private drones: Map<string, OscillatorNode> = new Map();

    private ambientDrones: { osc: OscillatorNode, gain: GainNode }[] = [];
    private ambientActive = false;

    public playRadarPulse() {
        if (!this.ctx || !this.masterBus || GameState.audio.isRadarMuted) return;
        this.beep(440, 0.05, 'sine', 0);
        this.beep(880, 0.02, 'sine', 0.05);
    }

    public playUIClick() {
        if (!this.ctx || !this.masterBus) return;
        this.beep(2000, 0.01, 'sine', 0);
        this.beep(4000, 0.01, 'sine', 0.01);
    }

    public init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterBus = this.ctx.createGain();
        this.masterBus.gain.value = 0.15;
        this.masterBus.connect(this.ctx.destination);
        this.startAmbient();
    }

    private startAmbient() {
        if (!this.ctx || !this.masterBus || this.ambientActive) return;
        this.ambientActive = true;

        // Deep "Abyssal" Drone
        this.createDrone(32.7, 0.12, 'sine'); // Low C
        this.createDrone(49.0, 0.04, 'sine'); // Low G
        
        // Unsettling "Simulation Resonance"
        const resonance = this.ctx.createOscillator();
        const resGain = this.ctx.createGain();
        resonance.type = 'sawtooth';
        resonance.frequency.value = 60;
        resGain.gain.value = 0.01;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        resonance.connect(filter);
        filter.connect(resGain);
        resGain.connect(this.masterBus);
        resonance.start();

        // Modulate resonance filter
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.05;
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        // Pulsar Drone (Genre specific: Techno-ambient pulse)
        this.startPulsar();

        // Wind/Noise layer
        this.startWind();
        this.startMoodSequence();
    }

    private startPulsar() {
        if (!this.ctx || !this.masterBus) return;
        const pulsar = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        pulsar.type = 'triangle';
        pulsar.frequency.value = 110; 
        pGain.gain.value = 0;

        const pFilter = this.ctx.createBiquadFilter();
        pFilter.type = 'bandpass';
        pFilter.frequency.value = 440;
        pFilter.Q.value = 5;

        pulsar.connect(pFilter);
        pFilter.connect(pGain);
        pGain.connect(this.masterBus);
        pulsar.start();

        // Pulse LFO
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.5; // slow pulse
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(pGain.gain);
        lfo.start();

        // Sweep LFO
        const sweep = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();
        sweep.frequency.value = 0.1;
        sweepGain.gain.value = 200;
        sweep.connect(sweepGain);
        sweepGain.connect(pFilter.frequency);
        sweep.start();
    }

    private createDrone(freq: number, vol: number, type: OscillatorType) {
        if (!this.ctx || !this.masterBus) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        this.ambientDrones.push({ osc, gain });
    }

    private startWind() {
        if (!this.ctx || !this.masterBus) return;
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 10;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.02;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterBus);
        source.start();

        // Modulate wind frequency
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
    }

    private startMoodSequence() {
        if (!this.ctx) return;
        const playBlip = () => {
            const notes = [220, 247.5, 275, 330]; // Geometric intervals
            const note = notes[Math.floor(Math.random() * notes.length)];
            this.beep(note, 2.0, 'sine', 0);
            
            // Re-schedule
            setTimeout(playBlip, 4000 + Math.random() * 4000);
        };
        playBlip();
    }

    public playCollect() {
        this.beep(880, 0.1, 'square');
        this.beep(1320, 0.1, 'square', 0.05);
    }

    public playSlay() {
        this.noise(0.3, 0.5);
        this.beep(220, 0.3, 'sawtooth');
    }

    public playDie() {
        this.beep(110, 0.5, 'square');
        this.noise(0.8, 1.0);
    }

    private beep(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0) {
        if (!this.ctx || !this.masterBus || GameState.audio.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + delay + duration);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.masterBus);
        
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + duration);
    }

    private noise(duration: number, volume: number) {
        if (!this.ctx || !this.masterBus || GameState.audio.isMuted) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
        
        source.connect(gain);
        gain.connect(this.masterBus);
        source.start();
    }

    public update(state: GameStateData) {
        if (!this.ctx || this.ctx.state !== 'running' || !this.masterBus) return;

        // Global Mute or Pause handling
        if (state.audio.isMuted || state.isPaused) {
            this.masterBus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
            return;
        }

        // Death Handling: Fade out after 3 seconds
        if (state.isDead) {
            this.masterBus.gain.setTargetAtTime(0, this.ctx.currentTime, 3.0);
            return;
        }

        // Zone-based base intensity
        const zoneIntensity = state.currentZone === 'LANDING' ? 0 : 0.5;

        // Proximity to dragons (intensifies drone)
        const activeDaemons = state.pois.filter(p => p.type === 'dragon');
        let minDragDist = 1000;
        activeDaemons.forEach(d => {
            const dist = state.playerPos.distanceTo(d.pos);
            if (dist < minDragDist) minDragDist = dist;
        });

        const proximityIntensity = Math.max(0, 1 - minDragDist / 40); 
        const totalIntensity = Math.min(1, zoneIntensity + proximityIntensity);
        
        // Modulate master volume slightly based on tension
        this.masterBus.gain.setTargetAtTime(0.1 + (totalIntensity * 0.15), this.ctx.currentTime, 0.5);

        // Intensify drones
        this.ambientDrones.forEach((d, i) => {
            const isFundamental = i === 0;
            const baseVol = isFundamental ? 0.08 : 0.03;
            const targetVol = baseVol * (0.5 + totalIntensity * 1.5);
            
            d.gain.gain.setTargetAtTime(targetVol, this.ctx!.currentTime, 0.8);
            
            // Slightly shift frequency in deep sectors
            const baseFreq = d.osc.frequency.value;
            const detune = totalIntensity * 2;
            d.osc.detune.setTargetAtTime(detune * 100, this.ctx!.currentTime, 2.0);
        });
    }
}

export const Audio = new AudioManager();
