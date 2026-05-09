import * as THREE from 'three';
import { GameState, GameStateData } from '../GameState';

export class DroneSynthesizer {
    private drones: { osc: OscillatorNode, gain: GainNode }[] = [];
    private isolationSine: OscillatorNode | null = null;
    private groundingHum: { osc: OscillatorNode, gain: GainNode } | null = null;
    private windFilter: BiquadFilterNode | null = null;
    private ambientActive = false;

    constructor(private ctx: AudioContext, private masterBus: GainNode) {}

    public start() {
        if (this.ambientActive) return;
        this.ambientActive = true;

        this.createDrone(32.7, 0.12, 'sine'); // Low C
        this.createDrone(49.0, 0.04, 'sine'); // Low G
        
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

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.05;
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        this.startPulsar();
        this.startIsolation();
        this.startGrounding();
        this.startWind();
        this.startMoodSequence();
    }

    private createDrone(freq: number, vol: number, type: OscillatorType) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = vol;
        osc.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        this.drones.push({ osc, gain });
    }

    private startIsolation() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 220;
        gain.gain.value = 0.005;
        osc.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        this.isolationSine = osc;
        this.drones.push({ osc, gain });
    }

    private startGrounding() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.value = 55;
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        gain.gain.value = 0;
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        this.groundingHum = { osc, gain };
    }

    private startPulsar() {
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

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(pGain.gain);
        lfo.start();

        const sweep = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();
        sweep.frequency.value = 0.1;
        sweepGain.gain.value = 200;
        sweep.connect(sweepGain);
        sweepGain.connect(pFilter.frequency);
        sweep.start();
    }

    private startWind() {
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

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(this.windFilter.frequency);
        lfo.start();
    }

    private startMoodSequence() {
        const playBlip = () => {
            if (GameState.isPaused || GameState.isDead) {
                setTimeout(playBlip, 1000);
                return;
            }
            const notes = GameState.currentZone === 'LANDING' ? [440, 554.37, 659.25] : [220, 247.5, 275, 330];
            const note = notes[Math.floor(Math.random() * notes.length)];
            
            this.triggerBlip(note);
            setTimeout(playBlip, 3000 + Math.random() * 5000);
        };
        playBlip();
    }

    private triggerBlip(freq: number) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(this.masterBus);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }

    public update(state: GameStateData, maxThreat: number) {
        if (this.windFilter) {
            const isAtEdges = Math.abs(state.playerPos.x) > 200 || Math.abs(state.playerPos.z) > 200;
            const filterTarget = isAtEdges ? 2000 : (state.currentZone === 'LANDING' ? 600 : 400);
            this.windFilter.frequency.setTargetAtTime(filterTarget, this.ctx.currentTime, 1.0);
        }

        if (this.groundingHum) {
            const velocity = state.movingSpeed;
            const motionIntensity = state.isMoving ? 0.02 * velocity : 0;
            this.groundingHum.gain.gain.setTargetAtTime(motionIntensity, this.ctx.currentTime, 0.2);
            this.groundingHum.osc.frequency.setTargetAtTime(55 + velocity * 5, this.ctx.currentTime, 0.1);
        }

        const roomX = Math.floor(state.playerPos.x / 60);
        const roomZ = Math.floor(state.playerPos.z / 60);
        const sectorDissonance = (roomX + roomZ) * 2; 

        const jitterIntensity = maxThreat * 50; 
        
        this.drones.forEach((d, i) => {
            const isIsolation = d.osc === this.isolationSine;
            const baseFreq = isIsolation ? 220 : (i === 0 ? 32.7 : 49.0);
            d.osc.frequency.setTargetAtTime(baseFreq + sectorDissonance, this.ctx.currentTime, 2.0);

            const baseVol = isIsolation ? 0.005 : (i === 0 ? 0.08 : 0.04);
            const targetVol = baseVol * (0.8 + maxThreat * 3);
            d.gain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.5);
            
            if (maxThreat > 0.4) {
               const rand = (Math.random() - 0.5) * maxThreat * 100;
               d.osc.detune.setValueAtTime(jitterIntensity + rand, this.ctx.currentTime);
            } else {
               d.osc.detune.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            }
        });
    }
}
