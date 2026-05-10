import { GameState } from '../GameState';

export class TelemetrySystem {
    private static maxLogs = 5;
    private static backgroundTraces = [
        "ADAPTATION TRACE: SYNCING",
        "NEURAL BUFFER: STABLE",
        "MEMETIC FRAGMENT: 1980 PROTOCOL",
        "SIGNAL RADIANCE: HIGH",
        "RECURSIVE DEPTH: 12",
        "BUFFER SYNC: SUCCESS",
        "LORE_ID: SECTOR_ZERO",
        "QUANTUM FLUCTUATIONS DETECTED",
        "CORE TEMP: NOMINAL",
        "SYNCHRONIZATION: 100%"
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
