import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { InventorySystem } from '../game/InventorySystem';

export const TitleCard = () => {
    if (!GameState.hud.showStatus) return null;
    return (
        <div className="acheron-panel p-5 pointer-events-none">
            <h1 className="acheron-header">Adventure 2.5D</h1>
            <p className="text-telemetry opacity-40 italic mt-1 font-bold">1980 Adventure Protocol // Reconstruction</p>
        </div>
    );
};

export const SignalIntegrityBar = () => {
    const integrity = GameState.signalIntegrity;
    const color = integrity > 0.3 ? 'bg-emerald-500' : 'bg-red-500';
    
    return (
        <div className="acheron-panel p-4 min-w-[200px] pointer-events-none border-l-4 border-l-emerald-500">
            <div className="flex justify-between items-center mb-2">
                <span className="acheron-label">Signal Integrity</span>
                <span className={`font-mono text-xs ${integrity > 0.3 ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
                    {(integrity * 100).toFixed(0)}%
                </span>
            </div>
            <div className="h-1 bg-black/40 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${integrity * 100}%` }}
                    className={`h-full ${color} shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                />
            </div>
        </div>
    );
};

export const GearDisplay = () => {
    const activeItem = InventorySystem.getActiveItem();
    return (
        <div className="acheron-panel p-5 flex flex-col gap-3 min-w-[200px] pointer-events-none">
            <span className="acheron-label">Active System</span>
            <div className="flex gap-4 items-center">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={GameState.activeIndex}
                        initial={{ opacity: 0, x: -20, rotate: -10 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        exit={{ opacity: 0, x: 20, rotate: 10 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="flex items-center gap-4 py-1"
                    >
                        <div 
                            className="acheron-slot shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}44` : '#222' }}
                        >
                            <div className="w-6 h-6 rotate-45" style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}` : '#444' }} />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight uppercase leading-none">{activeItem?.name || 'Empty'}</div>
                            <div className="text-telemetry mt-1 text-white/30">Synchronization: 100%</div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export const Compass = () => {
    return (
        <div className="acheron-panel rounded-full w-24 h-24 flex items-center justify-center relative pointer-events-none">
            <motion.div 
                animate={{ rotate: (GameState.playerRotation - Math.PI) * (180/Math.PI) }}
                className="w-16 h-16 border-2 border-emerald-400/20 rounded-full flex items-center justify-center italic font-black text-xs text-white/40"
            >
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400">N</span>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px]">S</span>
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-[8px]">W</span>
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[8px]">E</span>
                <div className="w-[1px] h-10 bg-emerald-400 shadow-[0_0_5px_#34d399]" />
            </motion.div>
        </div>
    );
};
