import React, { useMemo, memo, useState } from 'react';
import { GameState } from '../game/GameState';
import { motion } from 'motion/react';
import { Audio } from '../game/AudioSystem';
import { Volume2, VolumeX, Radar } from 'lucide-react';

const MinimapMarkers = memo(() => {
  const visiblePois = useMemo(() => {
    return GameState.pois
      .map(poi => {
        const dx = (poi.pos.x - GameState.playerPos.x) * 2;
        const dz = (poi.pos.z - GameState.playerPos.z) * 2;
        return { poi, dx, dz };
      })
      .filter(({ dx, dz }) => Math.abs(dx) <= 90 && Math.abs(dz) <= 90);
  }, [GameState.pois, GameState.playerPos.x, GameState.playerPos.z]);

  return (
    <>
      {visiblePois.map(({ poi, dx, dz }) => (
        <div 
          key={poi.id}
          className="absolute w-2 h-2 rounded-sm transition-all duration-300"
          style={{ 
            left: `calc(50% + ${dx}px)`, 
            top: `calc(50% + ${dz}px)`,
            backgroundColor: `#${poi.color.toString(16).padStart(6, '0')}`,
            transform: 'translate(-50%, -50%) scale(0.8)',
            borderRadius: poi.type === 'wall' ? '0' : '50%'
          }}
        />
      ))}
    </>
  );
});

export const Minimap = () => {
    const [isMuted, setIsMuted] = useState(GameState.audio.isRadarMuted);

    if (!GameState.hud.showMinimap) return null;

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        GameState.audio.isRadarMuted = !GameState.audio.isRadarMuted;
        setIsMuted(GameState.audio.isRadarMuted);
        Audio.playCollect(); // Feedback click
    };

    return (
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl w-48 h-48 overflow-hidden relative pointer-events-none group">
            {/* Grid Lines (Rooms of 60 units = 120px) */}
            <div 
                className="absolute inset-0 opacity-20 z-0"
                style={{
                    backgroundImage: `linear-gradient(to right, #444 1px, transparent 1px), linear-gradient(to bottom, #444 1px, transparent 1px)`,
                    backgroundSize: '120px 120px',
                    backgroundPosition: `calc(50% - ${GameState.playerPos.x * 2}px) calc(50% - ${GameState.playerPos.z * 2}px)`
                }}
            />

            {/* Scanlines Effect */}
            <div className="absolute inset-0 z-30 opacity-20 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
            </div>

            {/* Radar Sweep Effect */}
            <motion.div 
                animate={{ 
                    scale: [0.5, 2],
                    opacity: [0.5, 0]
                }}
                onUpdate={(latest: any) => {
                    if (latest.scale > 0.5 && latest.scale < 0.55) {
                        Audio.playRadarPulse();
                    }
                }}
                transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-500/20 rounded-full z-0"
            />

            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-full h-[1px] bg-white" />
                <div className="h-full w-[1px] bg-white" />
            </div>
            
            <MinimapMarkers />

            {/* Compass Indicators */}
            <div className="absolute inset-0 pointer-events-none text-[8px] font-bold text-white/20 p-1">
                <div className="absolute top-1 left-1/2 -translate-x-1/2">N</div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">S</div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2">W</div>
                <div className="absolute right-1 top-1/2 -translate-y-1/2">E</div>
            </div>

            {/* Player in center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] z-20">
                <motion.div 
                    animate={{ rotate: -GameState.playerRotation * (180/Math.PI) }}
                    className="w-full h-full flex items-center justify-center"
                >
                    <div className="w-1 h-4 bg-white rounded-full -mt-3 shadow-[0_0_10px_white]" />
                </motion.div>
            </div>

            {/* Controls */}
            <div className="absolute top-2 right-2 flex gap-1 z-40">
                <button 
                    onClick={toggleMute}
                    className="p-1.5 bg-black/40 hover:bg-black/80 border border-white/10 rounded-lg pointer-events-auto transition-all active:scale-95"
                >
                    {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                </button>
            </div>

            <div className="absolute bottom-2 left-2 text-[8px] font-black uppercase tracking-widest text-emerald-400 animate-pulse">Scanner Active: P.A.S. v4.2</div>
        </div>
    );
};
