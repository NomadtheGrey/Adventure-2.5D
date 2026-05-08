import { useEffect, useRef, useState } from 'react';
import { Game } from './game/main';
import { InventorySystem } from './game/InventorySystem';
import { GameState } from './game/GameState';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
      gameRef.current = new Game(containerRef.current);
    }

    // High frequency sync for HUD items
    let frame: number;
    const sync = () => {
      setTick(t => t + 1);
      frame = requestAnimationFrame(sync);
    };
    sync();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-emerald-950 text-white font-sans">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* HUD Backdrop */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex justify-between items-start z-10">
        <div className="flex flex-col gap-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-emerald-400">Adventure 2.5D</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40">Modernized Isometric Atari Classic</p>
            </div>

            {/* Minimap */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl w-48 h-48 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-full h-[1px] bg-white" />
                    <div className="h-full w-[1px] bg-white" />
                </div>
                {GameState.pois.map(poi => {
                    const dx = (poi.pos.x - GameState.playerPos.x) * 2;
                    const dz = (poi.pos.z - GameState.playerPos.z) * 2;
                    if (Math.abs(dx) > 90 || Math.abs(dz) > 90) return null;
                    return (
                        <div 
                            key={poi.id}
                            className="absolute w-2 h-2 rounded-sm transition-all duration-300"
                            style={{ 
                                left: `calc(50% + ${dx}px)`, 
                                top: `calc(50% + ${dz}px)`,
                                backgroundColor: `#${poi.color.toString(16)}`,
                                transform: 'translate(-50%, -50%) scale(0.8)',
                                borderRadius: poi.type === 'wall' ? '0' : '50%'
                            }}
                        />
                    );
                })}
                {/* Player in center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] z-20">
                    <motion.div 
                        animate={{ rotate: -GameState.playerRotation * (180/Math.PI) }}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <div className="w-1 h-3 bg-white rounded-full -mt-2" />
                    </motion.div>
                </div>
                <div className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest opacity-30">Scanner Active</div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-4">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col gap-3 min-w-[200px] shadow-2xl">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-emerald-400/60">Selected Gear</span>
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
                            style={{ backgroundColor: InventorySystem.getActiveItem()?.color ? `#${InventorySystem.getActiveItem()?.color.toString(16)}44` : '#222' }}
                        >
                            <div className="w-6 h-6 rotate-45" style={{ backgroundColor: InventorySystem.getActiveItem()?.color ? `#${InventorySystem.getActiveItem()?.color.toString(16)}` : '#444' }} />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-tight uppercase leading-none">{InventorySystem.getActiveItem()?.name || 'Empty'}</div>
                            <div className="text-[9px] font-black uppercase tracking-wider opacity-30 mt-1">Ready for action</div>
                        </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
            </div>

            {/* Compass */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full w-24 h-24 flex items-center justify-center shadow-2xl relative">
                <motion.div 
                    animate={{ rotate: -GameState.playerRotation * (180/Math.PI) }}
                    className="w-16 h-16 border-2 border-emerald-400/20 rounded-full flex items-center justify-center italic font-black text-xs text-white/40"
                >
                    <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400">N</span>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px]">S</span>
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 text-[8px]">W</span>
                    <span className="absolute -right-1 top-1/2 -translate-y-1/2 text-[8px]">E</span>
                    <div className="w-[1px] h-10 bg-emerald-400 shadow-[0_0_5px_#34d399]" />
                </motion.div>
            </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10 bg-black/20 p-3 rounded-full backdrop-blur-md border border-white/5">
        {GameState.inventory.map((item, idx) => (
            <motion.div
                key={item.type + idx}
                animate={{ 
                    scale: GameState.activeIndex === idx ? 1.25 : 1, 
                    backgroundColor: GameState.activeIndex === idx ? `rgba(255,255,255,0.2)` : `rgba(0,0,0,0.3)`
                }}
                className={`w-14 h-14 rounded-full border-2 ${GameState.activeIndex === idx ? 'border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'border-white/10'} flex items-center justify-center cursor-pointer transition-colors overflow-hidden`}
            >
                <div 
                    className="w-4 h-4 rotate-45" 
                    style={{ backgroundColor: `#${item.color.toString(16)}` }} 
                />
            </motion.div>
        ))}
      </div>

      {/* Win/Loss Screens */}
      <AnimatePresence>
        {GameState.isDead && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-950/90 backdrop-blur-2xl"
            >
                <motion.h2 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-8xl font-black tracking-tighter uppercase italic text-red-500 mb-8"
                >
                    Eaten
                </motion.h2>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 bg-white text-red-950 font-black uppercase tracking-widest rounded-full hover:bg-red-200 transition-colors"
                >
                    Try Again
                </button>
            </motion.div>
        )}

        {GameState.hasWon && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-emerald-950/90 backdrop-blur-2xl"
            >
                <motion.h2 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="text-8xl font-black tracking-tighter uppercase italic text-emerald-400 mb-8"
                >
                    Quest Complete
                </motion.h2>
                <p className="text-xl font-bold mb-10 opacity-70">The Chalice is yours.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 bg-white text-emerald-950 font-black uppercase tracking-widest rounded-full hover:bg-emerald-100 transition-colors"
                >
                    Return to Kingdom
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-8 right-8 text-right bg-black/30 backdrop-blur-md border border-white/5 p-6 rounded-2xl text-[10px] text-white/40 font-black uppercase tracking-[0.2em] leading-loose z-10">
          <span className="text-white/70">[WASD]</span> Navigation<br/>
          <span className="text-white/70">[CLICK]</span> Thrust Spear<br/>
          <span className="text-white/70">[SCROLL]</span> Select Item
      </div>

      {/* Debug HUD */}
      <div className={`absolute top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border ${GameState.debug.gpu.includes('CPU') ? 'border-red-500/50' : 'border-white/10'} px-6 py-3 rounded-2xl flex flex-col gap-2 min-w-[400px] z-10 shadow-2xl`}>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-400">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${GameState.debug.gpu.includes('CPU') ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className={GameState.debug.gpu.includes('CPU') ? 'text-red-400' : ''}>{GameState.debug.fps} FPS</span>
            </div>
            <div className="flex gap-4 opacity-70">
              <span>TRIS: {(GameState.debug.triangles / 1000).toFixed(1)}k</span>
              <span>CALLS: {GameState.debug.drawCalls}</span>
              <span>OBJS: {GameState.debug.objectCount}</span>
            </div>
          </div>
          
          <div className="h-px bg-white/10 w-full" />

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[9px] font-bold">
              <div className="flex items-center gap-2">
                 <span className="text-white/40 uppercase">Renderer</span>
                 <span className={GameState.debug.gpu.includes('CPU') ? 'text-red-400' : 'text-white'}>{GameState.debug.gpu}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-white/40 uppercase">Room</span>
                 <span className="text-emerald-300">15x15 Tiles</span>
              </div>
            </div>
            {GameState.debug.gpu.includes('CPU') && (
              <div className="text-[8px] text-red-500/80 font-bold uppercase tracking-tighter">
                ⚠️ Warning: Hardware Acceleration is disabled in your browser. Performance will be limited.
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
