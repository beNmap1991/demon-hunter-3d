import { useGameStore } from './useGameStore';
import { useEffect, useState } from 'react';

export default function HUD() {
  const { gameState } = useGameStore();
  const healthPct = (gameState.health / gameState.maxHealth) * 100;
  const ammoPct = (gameState.ammo / gameState.maxAmmo) * 100;
  const isLowHealth = gameState.health < 30;
  const isLowAmmo = gameState.ammo <= 5;
  const isReloading = gameState.ammo === 0;

  const [flashKey, setFlashKey] = useState(0);
  useEffect(() => {
    if (gameState.hitFlashTime > 0) {
      setFlashKey((k) => k + 1);
    }
  }, [gameState.hitFlashTime]);

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-10">
      <div key={flashKey} className={flashKey > 0 ? 'hit-flash' : ''} />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="bg-black/60 rounded-lg p-3 min-w-[160px]">
          <div className="text-xs text-gray-400 mb-1 font-mono uppercase tracking-wider">Health</div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-1">
            <div
              className="h-3 rounded-full transition-all duration-200"
              style={{
                width: `${healthPct}%`,
                backgroundColor: isLowHealth ? '#ff2222' : '#22cc44',
              }}
            />
          </div>
          <div className={`text-sm font-bold font-mono ${isLowHealth ? 'text-red-400' : 'text-green-400'}`}>
            {gameState.health} / {gameState.maxHealth}
          </div>
        </div>

        <div className="bg-black/60 rounded-lg p-3 text-center min-w-[120px]">
          <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">Wave</div>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{gameState.wave}</div>
          <div className="text-xs text-gray-400 font-mono">Score: <span className="text-white">{gameState.score}</span></div>
        </div>

        <div className="bg-black/60 rounded-lg p-3 min-w-[140px]">
          <div className="text-xs text-gray-400 mb-1 font-mono uppercase tracking-wider flex justify-between">
            <span>Ammo</span>
            {isReloading && <span className="text-yellow-300 animate-pulse">RELOADING...</span>}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 mb-1">
            <div
              className="h-3 rounded-full transition-all duration-200"
              style={{
                width: `${ammoPct}%`,
                backgroundColor: isLowAmmo ? '#ff8800' : '#4488ff',
              }}
            />
          </div>
          <div className={`text-sm font-bold font-mono ${isLowAmmo ? 'text-orange-400' : 'text-blue-300'}`}>
            {gameState.ammo} / {gameState.maxAmmo}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          <div className="absolute w-[2px] h-6 bg-white/80 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-6 h-[2px] bg-white/80 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute w-1 h-1 rounded-full bg-red-400 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {isLowHealth && (
        <div className="absolute inset-0 border-4 border-red-600/40 pointer-events-none animate-pulse" />
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <div className="text-gray-400/70 text-xs font-mono">
          WASD Move · Mouse Aim · Click/Space Shoot · ESC Unlock
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/60 rounded-lg p-2">
        <div className="text-xs text-gray-400 font-mono">Kills: <span className="text-white font-bold">{gameState.kills}</span></div>
      </div>

      {(gameState.damageMultiplierTime > 0 || gameState.speedMultiplierTime > 0) && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-3">
          {gameState.damageMultiplierTime > 0 && (
            <div className="flex items-center gap-2 bg-yellow-900/80 border border-yellow-500/60 rounded-lg px-3 py-2">
              <span className="text-yellow-400 font-black font-mono text-lg leading-none">2x</span>
              <div className="text-right">
                <div className="text-yellow-300 text-xs font-mono uppercase tracking-wider">Damage</div>
                <div className="text-yellow-100 font-bold font-mono text-sm">{Math.ceil(gameState.damageMultiplierTime)}s</div>
              </div>
            </div>
          )}
          {gameState.speedMultiplierTime > 0 && (
            <div className="flex items-center gap-2 bg-blue-900/80 border border-blue-400/60 rounded-lg px-3 py-2">
              <span className="text-blue-300 font-black font-mono text-lg leading-none">▶▶</span>
              <div className="text-right">
                <div className="text-blue-300 text-xs font-mono uppercase tracking-wider">Speed</div>
                <div className="text-blue-100 font-bold font-mono text-sm">{Math.ceil(gameState.speedMultiplierTime)}s</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
