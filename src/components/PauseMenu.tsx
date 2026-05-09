import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState } from '../game/GameState';
import { Audio } from '../game/AudioSystem';
import { Volume2, VolumeX, Settings, X, Power, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export const PauseMenu = () => {
    const isPaused = GameState.isPaused;
    const [, setTick] = React.useState(0);

    const toggleMute = () => {
        GameState.audio.isMuted = !GameState.audio.isMuted;
        Audio.playUIClick();
        setTick(t => t + 1);
    };

    const toggleHud = (key: keyof typeof GameState.hud) => {
        GameState.hud[key] = !GameState.hud[key];
        Audio.playUIClick();
        setTick(t => t + 1);
    };

    const resume = () => {
        GameState.isPaused = false;
        Audio.playUIClick();
    };

    return (
        <AnimatePresence>
            {isPaused && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto"
                >
                    <motion.div 
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-[450px] acheron-panel-dark p-10 flex flex-col gap-8 overflow-hidden relative"
                    >
                        {/* Hardware-like details */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50" />
                        <div className="text-telemetry absolute top-2 right-4 opacity-10">SYSTEM_PAUSER_V3</div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-emerald-400" />
                                    <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">Neural Hub</h1>
                                </div>
                                <div className="text-telemetry mt-1 opacity-40 ml-8">Options & Configuration</div>
                            </div>
                            <button onClick={resume} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        {/* Settings Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Audio Section */}
                            <div className="flex flex-col gap-3">
                                <div className="text-telemetry opacity-20 ml-2">Audio Systems</div>
                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        onClick={toggleMute}
                                        className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all border-l-2 border-emerald-500/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            {GameState.audio.isMuted ? <VolumeX className="text-red-400" /> : <Volume2 className="text-emerald-400" />}
                                            <div className="text-left">
                                                <div className="text-telemetry opacity-40">Master Link Volume</div>
                                                <div className="text-sm font-black text-white">{GameState.audio.isMuted ? 'Muted' : 'Synchronized'}</div>
                                            </div>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${GameState.audio.isMuted ? 'bg-red-900 border border-red-500/50' : 'bg-emerald-900 border border-emerald-500/50 shadow-[0_0_10px_#34d399]'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* HUD Section */}
                            <div className="flex flex-col gap-3">
                                <div className="text-telemetry opacity-20 ml-2">Optic Overlays (HUD)</div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'showMinimap', label: 'Tactical Map', key: 'showMinimap' },
                                        { id: 'showStatus', label: 'Hull Metrics', key: 'showStatus' },
                                        { id: 'showInventory', label: 'Cargo Feed', key: 'showInventory' },
                                        { id: 'showControls', label: 'Control Hints', key: 'showControls' },
                                    ].map((item) => {
                                        const visible = GameState.hud[item.key as keyof typeof GameState.hud];
                                        return (
                                            <button 
                                                key={item.id}
                                                onClick={() => toggleHud(item.key as keyof typeof GameState.hud)}
                                                className={`flex items-center justify-between p-3 bg-white/5 border rounded-lg transition-all ${visible ? 'border-emerald-500/30' : 'border-white/5 opacity-40'}`}
                                            >
                                                <div className="flex flex-col text-left">
                                                    <div className="text-telemetry opacity-40">{item.label}</div>
                                                    <div className="text-[10px] font-black text-white">{visible ? 'VISIBLE' : 'HIDDEN'}</div>
                                                </div>
                                                {visible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-white/20" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Progress Meter */}
                        <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                             <div className="flex justify-between text-telemetry opacity-20 items-center">
                                <span>Sector Artifact Retention</span>
                                <span className="text-emerald-500/60 font-black">{GameState.inventory.length} / 8 DATACORE</span>
                             </div>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(GameState.inventory.length / 8) * 100}%` }}
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_#34d399] rounded-full"
                                />
                             </div>
                        </div>

                        <button 
                            onClick={resume}
                            className="btn-link-engage !w-full !rounded-xl !clip-none py-6 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(52,211,153,0.2)] mt-2"
                            style={{ clipPath: 'none' }}
                        >
                            <Power className="w-5 h-5" />
                            Return to Reality
                        </button>

                        <div className="text-center text-telemetry !opacity-5 mt-2">
                            Acheron Protocol Activated
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
