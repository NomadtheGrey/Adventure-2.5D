import { useEffect, useState } from 'react';
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
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none acheron-scanner-glass" />

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

                        <h1 className="text-6xl text-biometric italic mb-2 tracking-[0.2em] font-black">INITIALIZING</h1>
                        <p className="text-biometric text-sm opacity-60 mb-12 tracking-[0.5em]">Pulse Acquisition Scanner // v4.2</p>

                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                console.log("Overlays: Engage Link clicked");
                                Audio.init();
                                Audio.resume();
                                setTimeout(() => Audio.playUIClick(), 100);
                                GameState.isInitialized = true;
                            }}
                            className="btn-link-engage min-w-[280px]"
                        >
                            <span className="relative z-10 text-lg">Engage Link</span>
                        </motion.button>
                        
                        <div className="mt-12 flex gap-8">
                            <div className="text-telemetry">
                                Sector: LAB-0{GameState.worldSeed.toString(16).slice(2, 6).toUpperCase()}
                            </div>
                            <div className="text-telemetry">
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
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-2xl acheron-scanner-glass"
                >
                    <motion.h1 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-8xl font-black tracking-tighter uppercase italic text-red-500 mb-2 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    >
                        SIGNAL LOST
                    </motion.h1>
                    <p className="text-telemetry text-xl !text-red-500/60 mb-10">Link Severed // Biometric Failure</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-link-engage !bg-red-500 !text-black !border-red-500 hover:!bg-red-400 !clip-none min-w-[280px]"
                        style={{ clipPath: 'none' }}
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
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-2xl acheron-scanner-glass"
                >
                    <motion.h1 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-8xl acheron-header mb-2 scale-[2.5]"
                    >
                        ARTIFACT SECURED
                    </motion.h1>
                    <p className="text-biometric opacity-60 mb-10 tracking-[0.5em] text-xl mt-8">Source Code Unified // Extraction Ready</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="btn-link-engage !bg-white !text-emerald-950 !border-white hover:!bg-emerald-100 !clip-none min-w-[280px]"
                        style={{ clipPath: 'none' }}
                    >
                        Terminate Survey
                    </button>
                </motion.div>
            )}

            {/* In-game Message Display */}
            {GameState.message && (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-black/60 border border-emerald-500/50 text-emerald-400 px-6 py-3 font-mono text-xl tracking-widest backdrop-blur-md"
                    >
                        <span className="animate-pulse mr-2">▲</span>
                        {GameState.message}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
