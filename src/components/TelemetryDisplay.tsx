import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { APP_METADATA } from '../version';

export function TelemetryDisplay() {
    const logs = GameState.telemetryLogs;

    return (
        <div className="flex flex-col gap-1 w-64 pointer-events-none select-none">
            <div className="flex justify-between items-end mb-2 border-b border-emerald-900/50 pb-1">
                <div className="text-[10px] text-emerald-500 font-mono opacity-60 tracking-[0.2em] uppercase">
                    Telemetry Log
                </div>
                <div className="text-[9px] text-emerald-500 font-mono opacity-40">
                    v{APP_METADATA.version}
                </div>
            </div>
            <div className="flex flex-col-reverse gap-1">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="bg-black/40 backdrop-blur-sm border-l-2 border-emerald-500/30 px-3 py-1.5"
                        >
                            <div className="text-[11px] font-mono text-emerald-400 leading-tight">
                                <span className="opacity-40 mr-2">[{new Date(log.time).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                                {log.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {logs.length === 0 && (
                <div className="text-[10px] font-mono text-emerald-900 animate-pulse italic">
                    SCANNING DATA STREAMS...
                </div>
            )}
        </div>
    );
}
