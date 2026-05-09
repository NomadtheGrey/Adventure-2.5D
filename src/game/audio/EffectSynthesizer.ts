import { GameState } from '../GameState';

export class EffectSynthesizer {
    constructor(private ctx: AudioContext, private masterBus: GainNode) {}

    public beep(freq: number, duration: number, type: OscillatorType = 'sine', delay = 0) {
        if (GameState.audio.isMuted) return;
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

    public noise(duration: number, volume: number) {
        if (GameState.audio.isMuted) return;
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
}
