import { GameState, GameStateData, ItemType } from './GameState';

/**
 * Procedural Audio System (Rule 5: Separate Doing from Thinking)
 * Generates techno-simulation sounds using Web Audio API.
 */
export class AudioManager {
    private ctx: AudioContext | null = null;
    private masterBus: GainNode | null = null;
    private drones: Map<string, OscillatorNode> = new Map();
    private windFilter: BiquadFilterNode | null = null;
    private groundingHum: { osc: OscillatorNode, gain: GainNode } | null = null;
    private isolationSine: OscillatorNode | null = null;
    private masterDetuneLFO: OscillatorNode | null = null;

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

        // Tonal Isolation: A mid-frequency 220Hz (A2) sine wave (lonely technical observation)
        this.startIsolation();

        // Grounding Hum: Tactile movement feedback
        this.startGrounding();

        // Wind/Noise layer
        this.startWind();
        this.startMoodSequence();
    }

    private startIsolation() {
        if (!this.ctx || !this.masterBus) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 220;
        gain.gain.value = 0.005; // Very low
        osc.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        this.isolationSine = osc;
        this.ambientDrones.push({ osc, gain });
    }

    private startGrounding() {
        if (!this.ctx || !this.masterBus) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.value = 55; // Low grounding hum
        
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        
        gain.gain.value = 0; // Starts silent
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        
        this.groundingHum = { osc, gain };
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

        this.windFilter = this.ctx.createBiquadFilter();
        this.windFilter.type = 'lowpass';
        this.windFilter.frequency.value = 400;
        this.windFilter.Q.value = 10;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.02;

        source.connect(this.windFilter);
        this.windFilter.connect(gain);
        gain.connect(this.masterBus);
        source.start();

        // Modulate wind frequency (Unstable wilderness floor)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(this.windFilter.frequency);
        lfo.start();
    }

    private startMoodSequence() {
        if (!this.ctx) return;
        const playBlip = () => {
            if (GameState.isPaused || GameState.isDead) {
                setTimeout(playBlip, 1000);
                return;
            }

            const notes = GameState.currentZone === 'LANDING' 
                ? [440, 554.37, 659.25] // A Major triad (Peaceful)
                : [220, 247.5, 275, 330]; // Geometric intervals (Uncertain)
            
            const note = notes[Math.floor(Math.random() * notes.length)];
            
            if (Math.random() > 0.4) {
                this.beep(note, 1.5, 'sine', 0);
            } else {
                // High frequency "glitch chirp"
                this.beep(note * 4, 0.05, 'triangle', 0);
            }
            
            setTimeout(playBlip, 3000 + Math.random() * 5000);
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

    public playPhase() {
        if (!this.ctx || !this.masterBus) return;
        const now = this.ctx.currentTime;
        this.beep(200, 0.1, 'sine', 0);
        this.beep(800, 0.1, 'sawtooth', 0.05);
        this.noise(0.05, 0.2);
    }

    public playBoundary() {
        if (!this.ctx || !this.masterBus) return;
        this.noise(0.3, 0.5);
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
            this.masterBus.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2); 
            return;
        }

        // Death Handling: Fade out after 3 seconds
        if (state.isDead) {
            this.masterBus.gain.setTargetAtTime(0, this.ctx.currentTime, 3.0);
            return;
        }

        // 1. Wilderness Ambiance Sync
        if (this.windFilter) {
            const isAtEdges = Math.abs(state.playerPos.x) > 200 || Math.abs(state.playerPos.z) > 200;
            const filterTarget = isAtEdges ? 2000 : (state.currentZone === 'LANDING' ? 600 : 400);
            this.windFilter.frequency.setTargetAtTime(filterTarget, this.ctx.currentTime, 1.0);
        }

        // 2. Grounding Hum (Movement Feedback)
        if (this.groundingHum) {
            const velocity = state.movingSpeed;
            const motionIntensity = state.isMoving ? 0.02 * velocity : 0;
            this.groundingHum.gain.gain.setTargetAtTime(motionIntensity, this.ctx.currentTime, 0.2);
            
            // Subtle frequency shift based on movement
            this.groundingHum.osc.frequency.setTargetAtTime(55 + velocity * 5, this.ctx.currentTime, 0.1);
        }

        // 3. Sector Harmonics (Room-based frequency modulation)
        const roomX = Math.floor(state.playerPos.x / 60);
        const roomZ = Math.floor(state.playerPos.z / 60);
        const sectorDissonance = (roomX + roomZ) * 2; 

        // 4. Threat Detection (Neural Interference)
        const hostiles = state.pois.filter(p => p.type === 'dragon');
        let maxThreat = 0;
        hostiles.forEach(d => {
            const dist = state.playerPos.distanceTo(d.pos);
            const intensity = Math.max(0, 1 - (dist / 50)); 
            if (intensity > maxThreat) maxThreat = intensity;
        });

        // Modulate master volume based on threat/intensity
        this.masterBus.gain.setTargetAtTime(0.15 + (maxThreat * 0.1), this.ctx.currentTime, 0.5);

        // Update ambient drones & Neural Jitter
        const jitterIntensity = maxThreat * 50; 
        
        this.ambientDrones.forEach((d, i) => {
            const isIsolation = d.osc === this.isolationSine;
            const baseFreq = isIsolation ? 220 : (i === 0 ? 32.7 : 49.0);
            
            // Apply Sector Dissonance
            d.osc.frequency.setTargetAtTime(baseFreq + sectorDissonance, this.ctx!.currentTime, 2.0);

            const baseVol = isIsolation ? 0.005 : (i === 0 ? 0.08 : 0.04);
            const targetVol = baseVol * (0.8 + maxThreat * 3);
            
            d.gain.gain.setTargetAtTime(targetVol, this.ctx!.currentTime, 0.5);
            
            // Apply Jitter: High threat creates "Signal Degradation"
            if (maxThreat > 0.4) {
               const rand = (Math.random() - 0.5) * maxThreat * 100;
               d.osc.detune.setValueAtTime(jitterIntensity + rand, this.ctx!.currentTime);
            } else {
               d.osc.detune.setTargetAtTime(0, this.ctx!.currentTime, 0.5);
            }
        });

        // Random "Static Bursts" at high threat
        if (maxThreat > 0.8 && Math.random() > 0.98) {
            this.noise(0.05, 0.05 * maxThreat);
        }
    }
}

export const Audio = new AudioManager();
