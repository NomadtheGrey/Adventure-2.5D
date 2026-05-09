import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { InventorySystem } from '../game/InventorySystem';

export const InventoryBar = () => {
    const inventory = GameState.inventory;
    const activeIndex = GameState.activeIndex;
    const activeItem = inventory[activeIndex];

    if (inventory.length === 0 || !GameState.hud.showInventory) return null;

    return (
        <div className="absolute right-6 top-8 flex flex-col items-end h-[85vh] w-80 z-20 pointer-events-none group">
            
            <div className="relative flex flex-col items-end h-full w-full">
                {/* Active System Header & Detail Panel */}
                <div className="mb-4 mr-2 relative z-20 pointer-events-auto">
                    <div className="acheron-panel-dark p-5 flex flex-col gap-2 min-w-[240px] items-end">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-telemetry opacity-40">HUD_v4.2</div>
                            <span className="acheron-label">Active System</span>
                        </div>
                        
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-4 py-2 flex-row-reverse"
                            >
                                <div 
                                    className="acheron-slot border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.15)] overflow-hidden"
                                    style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}11` : '#111' }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                    <div className="w-5 h-5 rotate-45 relative z-10" style={{ backgroundColor: activeItem?.color ? `#${activeItem.color.toString(16).padStart(6, '0')}` : '#444' }} />
                                </div>
                                <div className="flex flex-col text-right">
                                    <div className="text-xl font-black tracking-tighter uppercase leading-none text-white drop-shadow-sm">{activeItem?.name || 'Link Error'}</div>
                                    <div className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 mt-2 flex items-center justify-end gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Feed Synchronized
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        
                        <div className="h-[1px] w-full bg-white/10 mt-2" />
                    </div>
                </div>

                {/* The "Rail" - Fixed relative to the icon centers (52px = 8px margin + 20px padding + 24px icon center) */}
                <div className="acheron-rail right-[52px] top-40 bottom-32" />
                
                {/* Scrolling List Container */}
                <div className="relative h-full flex items-center justify-end w-full overflow-hidden pr-8 z-10">
                    <motion.div 
                        animate={{ y: -activeIndex * 52 }}
                        transition={{ type: "spring", stiffness: 250, damping: 30 }}
                        className="flex flex-col gap-3 py-[350px] items-end"
                    >
                        {inventory.map((item, idx) => {
                            const isActive = idx === activeIndex;
                            const dist = Math.abs(idx - activeIndex);
                            
                            return (
                                <motion.div
                                    key={item.type + idx}
                                    initial={false}
                                    animate={{ 
                                        scale: isActive ? 1.2 : 0.85,
                                        opacity: isActive ? 1 : Math.max(0.1, 0.4 - dist * 0.12),
                                        x: isActive ? -16 : 0
                                    }}
                                    className={`${isActive ? 'acheron-inventory-box-active' : 'acheron-inventory-box'}`}
                                >
                                    {/* Scanning Line overlay for active items */}
                                    {isActive && (
                                        <motion.div 
                                            animate={{ y: [-20, 40] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-x-0 top-0 h-[1px] bg-emerald-300/60"
                                        />
                                    )}

                                    {/* Item Icon */}
                                    <div 
                                        className="w-3.5 h-3.5 rotate-45 transform-gpu" 
                                        style={{ 
                                            backgroundColor: `#${item.color.toString(16).padStart(6, '0')}`,
                                            boxShadow: isActive ? `0 0 15px #${item.color.toString(16).padStart(6, '0')}` : 'none'
                                        }} 
                                    />
                                    
                                    {/* Label/Descriptor */}
                                    <div className="absolute right-full mr-6 flex flex-col justify-center text-right">
                                        <div className={`whitespace-nowrap text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'text-emerald-400 scale-110 origin-right' : 'text-white/20'}`}>
                                            {item.name}
                                        </div>
                                        <div className={`text-telemetry transition-colors ${isActive ? 'text-white/40' : 'text-white/10'}`}>
                                            [{item.type.slice(0, 3)}_{idx.toString().padStart(2, '0')}]
                                        </div>
                                    </div>

                                    {/* Connection Line to Rail (Tiny horizontal segment) */}
                                    <div className={`absolute left-full w-4 h-[1px] bg-emerald-500/20 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            {/* Status Block */}
            <div className="absolute bottom-20 right-10 flex flex-col gap-2 items-end">
                <div className="acheron-label opacity-30">Hull Matrix Integrity</div>
                <div className="flex gap-1.5 flex-row-reverse">
                    {[...Array(12)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-3 h-1 rounded-full transition-all duration-500 ${i < (inventory.length + 4) ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-white/5'}`} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ControlsHint = () => {
    if (!GameState.hud.showControls) return null;
    
    return (
        <div className="absolute bottom-8 left-8 p-6 flex flex-col gap-3 group pointer-events-none acheron-panel z-20">
            <div className="flex flex-col gap-1 mb-1">
                <div className="acheron-label opacity-80">Interface Guide</div>
                <div className="h-[1px] w-8 bg-emerald-500/40" />
            </div>
            
            <div className="flex flex-col gap-2">
                {[
                    { keys: ['W', 'A', 'S', 'D'], label: 'Navigation' },
                    { keys: ['Q'], label: 'Drop System' },
                    { keys: ['CLICK'], label: 'Primary Action' },
                    { keys: ['SCROLL'], label: 'Select System' },
                    { keys: ['ESC'], label: 'System Options' }
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="flex gap-1 min-w-[80px] justify-end">
                            {item.keys.map(k => (
                                <span key={k} className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/60">
                                    {k}
                                </span>
                            ))}
                        </div>
                        <span className="text-telemetry tracking-[0.15em] opacity-30">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
