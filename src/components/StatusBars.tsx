import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { InventorySystem } from '../game/InventorySystem';

export const TitleCard = () => {
    if (!GameState.hud.showStatus) return null;
    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl pointer-events-none">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-emerald-400">Adventure 2.5D</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Modernized Isometric Atari Classic</p>
        </div>
    );
};

export const GearDisplay = () => {
    const activeItem = InventorySystem.getActiveItem();
    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col gap-3 min-w-[200px] shadow-2xl pointer-events-none">
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-emerald-400/60">Active System</span>
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
                            className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}44` : '#222' }}
                        >
                            <div className="w-6 h-6 rotate-45" style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}` : '#444' }} />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight uppercase leading-none">{activeItem?.name || 'Empty'}</div>
                            <div className="text-[9px] font-black uppercase tracking-wider opacity-30 mt-1">Synchronization: 100%</div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export const Compass = () => (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl relative pointer-events-none">
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
