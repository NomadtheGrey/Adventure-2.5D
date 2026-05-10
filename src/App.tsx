import { useEffect, useRef, useState } from 'react';
import { Game } from './game/main';
import { Minimap } from './components/Minimap';
import { TelemetryDisplay } from './components/TelemetryDisplay';
import { TitleCard, GearDisplay, Compass, SignalIntegrityBar } from './components/StatusBars';
import { InventoryBar, ControlsHint } from './components/InventoryBar';
import { Overlays } from './components/Overlays';
import { OnboardingBriefing } from './components/OnboardingBriefing';
import { DebugPanel } from './components/DebugPanel';
import { PauseMenu } from './components/PauseMenu';
import { Audio } from './game/AudioSystem';
import { GameState } from './game/GameState';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (containerRef.current && !gameRef.current) {
        gameRef.current = new Game(containerRef.current);
    }

    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && GameState.isInitialized && !GameState.isDead && !GameState.hasWon) {
            GameState.isPaused = !GameState.isPaused;
            Audio.playUIClick();
            setTick(t => t + 1);
        }
    };

    window.addEventListener('keydown', handleKey);

    // We wait for user interaction to start audio (browser policy)
    let frame: number;
    const sync = () => {
      setTick(t => t + 1);
      frame = requestAnimationFrame(sync);
    };
    sync();
    return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div 
        className="relative w-full h-screen overflow-hidden bg-emerald-950 text-white font-sans cursor-default"
    >
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* HUD Layers */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none flex justify-between items-start z-10">
        <div className="flex flex-col gap-4">
            <TitleCard />
            <SignalIntegrityBar />
            <Minimap />
            <TelemetryDisplay />
        </div>
      </div>

      <OnboardingBriefing />

      {/* Bottom UI */}
      <InventoryBar />
      <ControlsHint />

      {/* Overlays & Debug */}
      <Overlays />
      <PauseMenu />
      <DebugPanel />

      {/* Phase Flash Effect */}
      {GameState.isPhasing && (
          <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-50 pointer-events-none animate-pulse" />
      )}

      {/* Signal Loss Glitch Effect */}
      {GameState.isDead && (
        <div className="absolute inset-0 z-[100] pointer-events-none overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="absolute inset-0 mix-blend-overlay animate-pulse bg-red-900/20" />
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-50 animate-[scanline_2s_linear_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-red-500 font-mono text-4xl font-bold tracking-widest animate-pulse">
              SIGNAL LOST...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
