import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { Audio } from '../game/AudioSystem';

export function OnboardingBriefing() {
    const [, setTick] = useState(0);
    
    useEffect(() => {
        if (GameState.showBriefing) {
            GameState.isPaused = true;
            // Force a tick to ensure PauseMenu sees it
            setTick(t => t + 1);
        }
    }, []);

    if (!GameState.showBriefing) return null;

    const dismiss = () => {
        GameState.showBriefing = false;
        GameState.isPaused = false;
        Audio.playUIClick();
        setTick(t => t + 1);
    };

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-xl w-full acheron-panel p-8 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-emerald-400">Mission Briefing</h2>
                            <p className="text-xs text-emerald-900 font-mono tracking-widest mt-1">PROTOCOL: REBOOT_SECTOR_ZERO</p>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-500/40 text-right">
                            INIT_STAMP: 2026.05.10<br />
                            SURVEYOR_ID: LINK_7Y
                        </div>
                    </div>

                    <div className="space-y-6 text-sm leading-relaxed text-emerald-100/80">
                        <p>
                            Surveyor, you are being projected into <span className="text-emerald-400 font-bold">Sector Zero</span>—a unstable reconstruction of the 1980 Adventure Protocol. Your neural link is active, but fragile.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-950/20 p-4 border border-emerald-900/30">
                                <h3 className="text-emerald-400 font-black text-xs uppercase mb-2">Objectives</h3>
                                <ul className="text-[11px] space-y-1 opacity-70">
                                    <li>• Locate the Black Key</li>
                                    <li>• Breach the Black Castle</li>
                                    <li>• Recover the Source Code (Chalice)</li>
                                    <li>• Return to the Golden Throne</li>
                                </ul>
                            </div>
                            <div className="bg-emerald-950/20 p-4 border border-emerald-900/30">
                                <h3 className="text-emerald-400 font-black text-xs uppercase mb-2">Controls</h3>
                                <ul className="text-[11px] space-y-1 opacity-70">
                                    <li>• [WASD]: Navigational Thrust</li>
                                    <li>• [SPACE]: Pulse Spear Attack</li>
                                    <li>• [Q]: Discard Current Item</li>
                                    <li>• [1-3]: System Selection</li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-[11px] italic text-emerald-700">
                            Warning: Security Daemons (Dragons) detect your Neural Signal. Any collision will result in catastrophic Packet Loss and Link Termination.
                        </p>
                    </div>

                    <button 
                        onClick={dismiss}
                        className="w-full mt-8 py-3 bg-emerald-500 text-black font-black uppercase text-sm tracking-tighter hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                        Engage Neural Link
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
