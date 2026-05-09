import { GameState } from '../game/GameState';

export const DebugPanel = () => {
    const isSoftware = GameState.debug.gpu.includes('CPU');
    
    return (
        <div className={`absolute top-8 left-1/2 -translate-x-1/2 acheron-panel-dark border ${isSoftware ? 'border-red-500/50' : 'border-white/10'} px-6 py-3 flex flex-col gap-2 min-w-[400px] z-10 pointer-events-none`}>
            <div className="flex justify-between items-center text-biometric text-[10px]">
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSoftware ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className={isSoftware ? 'text-red-400' : ''}>{GameState.debug.fps} FPS</span>
                </div>
                <div className="flex gap-4 text-telemetry">
                    <span>TRIS: {(GameState.debug.triangles / 1000).toFixed(1)}k</span>
                    <span>CALLS: {GameState.debug.drawCalls}</span>
                    <span>OBJS: {GameState.debug.objectCount}</span>
                </div>
            </div>
            
            <div className="h-px bg-white/10 w-full" />

            <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-telemetry">
                    <div className="flex items-center gap-2">
                        <span className="opacity-40">Renderer</span>
                        <span className={isSoftware ? 'text-red-400' : 'text-white/80'}>{GameState.debug.gpu}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="opacity-40">Room</span>
                        <span className="text-emerald-300">15x15 Tiles</span>
                    </div>
                </div>
                {isSoftware && (
                    <div className="text-[8px] text-red-500/80 font-bold uppercase tracking-tighter">
                        ⚠️ Warning: Hardware Acceleration is disabled in your browser. Performance will be limited.
                    </div>
                )}
            </div>
        </div>
    );
};
