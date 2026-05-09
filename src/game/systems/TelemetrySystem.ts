import { GameState } from '../GameState';

export class TelemetrySystem {
    private static maxLogs = 5;
    private static backgroundTraces = [
        "ADAPTATION TRACE: STABLE",
        "NEURAL BUFFER: 88%",
        "MEMETIC FRAGMENT DETECTED",
        "SIGNAL RADIANCE: HIGH",
        "RECURSIVE DEPTH: 12",
        "BUFFER SYNC: SUCCESS",
        "LATENCY OPTIMIZED",
        "DATA MIST: EVAPORATED",
        "CORE TEMP: NOMINAL"
    ];

    public static log(text: string) {
        const id = Math.random().toString(36).substr(2, 9);
        GameState.telemetryLogs.unshift({ id, text: text.toUpperCase(), time: Date.now() });
        
        if (GameState.telemetryLogs.length > this.maxLogs) {
            GameState.telemetryLogs.pop();
        }
    }

    public static update() {
        if (GameState.isPaused || GameState.isDead) return;

        // Random background traces
        if (Math.random() < 0.005) {
            const trace = this.backgroundTraces[Math.floor(Math.random() * this.backgroundTraces.length)];
            this.log(trace);
        }
    }
}
