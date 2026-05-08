import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { Audio } from '../game/AudioSystem';

export const Overlays = () => {
    return (
        <AnimatePresence>
            {!GameState.isInitialized && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-3xl pointer-events-auto"
                >
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                    </div>

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-24 h-24 mb-10 relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-emerald-500/30 rounded-full"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_20px_#34d399]" />
                            </div>
                        </div>

                        <h1 className="text-6xl font-black tracking-[0.2em] uppercase italic text-emerald-400 mb-2">INITIALIZING</h1>
                        <p className="text-sm font-bold text-emerald-400/60 uppercase tracking-[0.5em] mb-12">Pulse Acquisition Scanner // v4.2</p>

                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ 
                                boxShadow: ["0 0 0px #34d399", "0 0 20px #34d399", "0 0 0px #34d399"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            onClick={() => {
                                Audio.init();
                                Audio.playUIClick();
                                GameState.isInitialized = true;
                            }}
                            className="group relative px-12 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-sm overflow-hidden"
                        >
                            <span className="relative z-10 text-lg">Engage Link</span>
                        </motion.button>
                        
                        <div className="mt-12 flex gap-8">
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
                                Sector: LAB-0{GameState.worldSeed.toString(16).slice(2, 6).toUpperCase()}
                            </div>
                            <div className="text-[10px] text-white/20 uppercase tracking-widest font-mono">
                                Bio-Link: READY
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {GameState.isDead && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-2xl"
                >
                    <motion.h1 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-8xl font-black tracking-tighter uppercase italic text-red-500 mb-2"
                    >
                        SIGNAL LOST
                    </motion.h1>
                    <p className="text-xl font-bold mb-10 text-red-500/60 uppercase tracking-[0.5em]">Link Severed // Biometric Failure</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-10 py-5 bg-white text-red-950 font-black uppercase tracking-widest rounded-full hover:bg-red-200 transition-colors pointer-events-auto"
                    >
                        Re-establish Link
                    </button>
                </motion.div>
            )}

            {GameState.hasWon && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-2xl"
                >
                    <motion.h1 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-8xl font-black tracking-tighter uppercase italic text-emerald-400 mb-2"
                    >
                        ARTIFACT SECURED
                    </motion.h1>
                    <p className="text-xl font-bold mb-10 text-emerald-400/60 uppercase tracking-[0.5em]">Source Code Unified // Extraction Ready</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-10 py-5 bg-white text-emerald-950 font-black uppercase tracking-widest rounded-full hover:bg-emerald-100 transition-colors pointer-events-auto"
                    >
                        Terminate Survey
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
