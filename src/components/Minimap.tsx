import React, { useMemo, memo, useState } from 'react';
import { GameState } from '../game/GameState';
import { motion } from 'motion/react';
import { Audio } from '../game/AudioSystem';
import { Volume2, VolumeX, Radar } from 'lucide-react';

const MinimapMarkers = () => {
    // We update every frame driven by App's tick
    const playerPos = GameState.playerPos;
    const pois = GameState.pois;

    const markers = pois.map(poi => {
        // Radar scale: 1 unit = 1.1 pixels (80 units ~ 88px, fits in 90px radius)
        const dx = (poi.pos.x - playerPos.x) * 1.1;
        const dz = (poi.pos.z - playerPos.z) * 1.1;
        const distSq = dx * dx + dz * dz;
        const LIMIT_SQ = 8100; // 90^2

        let isOffscreen = distSq > LIMIT_SQ;
        let finalDx = dx;
        let finalDz = dz;

        if (isOffscreen) {
            // Only show trackers for important entities
            if (poi.type === 'bat' || poi.type === 'dragon' || poi.type === 'item') {
                const dist = Math.sqrt(distSq);
                finalDx = (dx / dist) * 90;
                finalDz = (dz / dist) * 90;
            } else {
                return null;
            }
        }

        return { poi, dx: finalDx, dz: finalDz, isOffscreen };
    }).filter((m): m is any => m !== null);

    return (
        <>
            {markers.map(({ poi, dx, dz, isOffscreen }) => {
                let size = 8;
                let opacity = isOffscreen ? 0.6 : 1;
                let borderRadius = '50%';
                
                if (poi.type === 'tree') { size = 5; opacity = 0.6; }
                else if (poi.type === 'bush') { size = 4; opacity = 0.5; }
                else if (poi.type === 'water') { size = 12; opacity = 0.4; borderRadius = '4px'; }
                else if (poi.type === 'wall') { size = 6; opacity = 0.7; borderRadius = '2px'; }
                else if (poi.type === 'gate') { size = 10; opacity = 0.9; borderRadius = '2px'; }
                else if (poi.type === 'dragon') { size = 8; opacity = 1.0; }
                else if (poi.type === 'bat') { size = 6; opacity = 1.0; borderRadius = '0'; }

                if (isOffscreen) size = 4;

                const colorStr = `#${poi.color.toString(16).padStart(6, '0')}`;

                return (
                    <motion.div 
                        key={poi.id}
                        initial={false}
                        animate={{ 
                            left: `calc(50% + ${dx}px)`, 
                            top: `calc(50% + ${dz}px)`,
                            opacity: opacity,
                            scale: isOffscreen ? [1, 1.5, 1] : 1
                        }}
                        transition={{ 
                            scale: { repeat: Infinity, duration: 1 }
                        }}
                        className={`absolute transition-colors duration-300 ${poi.type === 'item' ? 'animate-ping' : ''} ${poi.type === 'bat' ? 'rotate-45' : ''}`}
                        style={{ 
                            width: size,
                            height: size,
                            backgroundColor: colorStr,
                            boxShadow: (poi.type === 'dragon' || poi.type === 'item' || poi.type === 'bat') ? `0 0 10px ${colorStr}` : 'none',
                            transform: 'translate(-50%, -50%)',
                            border: opacity > 0.5 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                            borderRadius: borderRadius,
                            zIndex: isOffscreen ? 10 : 5
                        }}
                    >
                        {isOffscreen && (
                            <div 
                                className="absolute inset-0 border border-white rounded-full animate-ping"
                                style={{ borderColor: colorStr }}
                            />
                        )}
                    </motion.div>
                );
            })}
        </>
    );
};

export const Minimap = () => {
    const [isMuted, setIsMuted] = useState(GameState.audio.isRadarMuted);
    const [, setTick] = useState(0);

    React.useEffect(() => {
        let frame: number;
        const sync = () => {
            setTick(t => t + 1);
            frame = requestAnimationFrame(sync);
        };
        sync();
        return () => cancelAnimationFrame(frame);
    }, []);

    if (!GameState.hud.showMinimap) return null;

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        GameState.audio.isRadarMuted = !GameState.audio.isRadarMuted;
        setIsMuted(GameState.audio.isRadarMuted);
        Audio.playCollect(); // Feedback click
    };

    return (
        <div className="acheron-panel p-2 w-48 h-48 overflow-hidden relative pointer-events-none group">
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
            <div className="absolute inset-0 z-30 opacity-20 pointer-events-none rounded-2xl acheron-scanner-glass" />

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
                    className="acheron-button-small"
                >
                    {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
                </button>
            </div>

            <div className="absolute bottom-2 left-2 text-biometric text-[8px] animate-pulse">Scanner Active: P.A.S. v4.2</div>
        </div>
    );
};
