import { useEffect } from 'react';
import { useGameStore } from './useGameStore';

function useExitPointerLock(active: boolean) {
  useEffect(() => {
    if (active && document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, [active]);
}

function requestLockAndResume() {
  useGameStore.getState().setGameState({ phase: 'playing' });
  document.body.requestPointerLock();
}

export default function MenuScreen() {
  const { startGame, gameState, nextWave, resetGame } = useGameStore();
  const isNotPlaying = gameState.phase !== 'playing';

  useExitPointerLock(isNotPlaying);

  if (gameState.phase === 'playing') return null;

  if (gameState.phase === 'paused') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-auto">
        <div className="text-center p-8 bg-gray-900/98 rounded-2xl border border-gray-700 max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-4xl font-black text-white mb-1 font-mono">PAUSED</div>
          <div className="text-gray-400 mb-8 text-sm font-mono">Game is paused</div>
          <div className="space-y-3">
            <button
              onClick={requestLockAndResume}
              className="w-full py-3 px-6 bg-green-600 hover:bg-green-500 text-white font-bold font-mono rounded-lg text-base transition-colors"
            >
              ▶ RESUME
            </button>
            <button
              onClick={resetGame}
              className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold font-mono rounded-lg text-base transition-colors"
            >
              ← MAIN MENU
            </button>
          </div>
          <div className="text-gray-600 text-xs font-mono mt-5">Click Resume or press ESC to re-lock cursor</div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'dead') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-auto">
        <div className="text-center p-8 bg-gray-900/95 rounded-2xl border border-red-800 max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-6xl font-black text-red-500 mb-2 font-mono tracking-tight">YOU DIED</div>
          <div className="text-gray-400 mb-6 text-sm">Better luck next time, soldier.</div>
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Wave Reached</span>
              <span className="text-yellow-400 font-bold">{gameState.wave}</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Final Score</span>
              <span className="text-green-400 font-bold">{gameState.score}</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Total Kills</span>
              <span className="text-blue-400 font-bold">{gameState.kills}</span>
            </div>
          </div>
          <button
            onClick={resetGame}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold font-mono rounded-lg text-lg transition-colors"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'waveComplete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 cursor-auto">
        <div className="text-center p-8 bg-gray-900/95 rounded-2xl border border-yellow-700 max-w-sm w-full mx-4 shadow-2xl">
          <div className="text-5xl font-black text-yellow-400 mb-1 font-mono">WAVE CLEARED!</div>
          <div className="text-gray-400 mb-4 text-sm">Prepare for the next assault...</div>
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Wave</span>
              <span className="text-yellow-400 font-bold">{gameState.wave} → {gameState.wave + 1}</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-gray-400">Score</span>
              <span className="text-green-400 font-bold">{gameState.score}</span>
            </div>
            <div className="text-xs text-green-500 font-mono mt-2">+30 Health restored</div>
          </div>
          <div className="space-y-3">
            <button
              onClick={nextWave}
              className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-500 text-white font-bold font-mono rounded-lg text-lg transition-colors"
            >
              NEXT WAVE →
            </button>
            <button
              onClick={resetGame}
              className="w-full py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold font-mono rounded-lg text-sm transition-colors"
            >
              ← MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-auto">
      <div className="text-center p-8 max-w-md w-full mx-4">
        <div className="mb-2">
          <div className="text-7xl font-black text-white font-mono tracking-tight leading-none">DEMON</div>
          <div className="text-4xl font-black text-red-500 font-mono tracking-widest">HUNTER</div>
        </div>
        <div className="text-gray-500 text-sm font-mono mb-10">3D Browser First Person Shooter</div>

        <div className="space-y-3 mb-10 text-left bg-gray-900/80 rounded-xl p-5 border border-gray-800">
          <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Controls</div>
          <div className="grid grid-cols-2 gap-2 text-sm font-mono">
            <span className="text-gray-500">Move</span>
            <span className="text-white">W A S D</span>
            <span className="text-gray-500">Aim</span>
            <span className="text-white">Mouse (after locking)</span>
            <span className="text-gray-500">Shoot</span>
            <span className="text-white">Left Click / Space</span>
            <span className="text-gray-500">Lock cursor</span>
            <span className="text-white">Click the game area</span>
            <span className="text-gray-500">Pause / unlock</span>
            <span className="text-white">ESC</span>
          </div>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 px-8 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black font-mono rounded-xl text-xl transition-colors shadow-lg shadow-red-900/50"
        >
          START GAME
        </button>
        <div className="text-gray-600 text-xs font-mono mt-4">
          Click the game area after starting to lock your cursor and begin aiming.
        </div>
      </div>
    </div>
  );
}
