import { create } from 'zustand';
import { Enemy, Bullet, Powerup, GameState } from './types';

interface GameStore {
  gameState: GameState;
  enemies: Enemy[];
  bullets: Bullet[];
  powerups: Powerup[];
  setGameState: (state: Partial<GameState>) => void;
  setEnemies: (enemies: Enemy[]) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;
  damagePlayer: (damage: number) => void;
  addScore: (points: number) => void;
  reloadAmmo: () => void;
  startGame: () => void;
  nextWave: () => void;
  resetGame: () => void;
  addPowerup: (powerup: Powerup) => void;
  removePowerup: (id: string) => void;
  activatePowerup: (type: 'damage' | 'speed') => void;
  tickPowerups: (delta: number) => void;
}

const initialGameState: GameState = {
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  score: 0,
  wave: 1,
  phase: 'menu',
  kills: 0,
  hitFlashTime: 0,
  damageMultiplier: 1,
  damageMultiplierTime: 0,
  speedMultiplier: 1,
  speedMultiplierTime: 0,
};

const generateEnemies = (wave: number): Enemy[] => {
  const count = 3 + wave * 2;
  const enemies: Enemy[] = [];
  const colors = ['#ff4444', '#ff8800', '#ff44ff', '#ffff00', '#00ff88'];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    enemies.push({
      id: `enemy-${wave}-${i}`,
      position: [
        Math.cos(angle) * radius,
        0.75,
        Math.sin(angle) * radius,
      ],
      health: 50 + wave * 10,
      maxHealth: 50 + wave * 10,
      speed: 1.5 + wave * 0.2,
      state: 'chasing',
      color: colors[i % colors.length],
    });
  }
  return enemies;
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: initialGameState,
  enemies: [],
  bullets: [],
  powerups: [],

  setGameState: (state) =>
    set((prev) => ({ gameState: { ...prev.gameState, ...state } })),

  setEnemies: (enemies) => set({ enemies }),

  addBullet: (bullet) =>
    set((prev) => ({ bullets: [...prev.bullets, bullet] })),

  removeBullet: (id) =>
    set((prev) => ({ bullets: prev.bullets.filter((b) => b.id !== id) })),

  damageEnemy: (id, damage) =>
    set((prev) => {
      const enemies = prev.enemies.map((e) => {
        if (e.id !== id) return e;
        const health = e.health - damage;
        return { ...e, health, state: health <= 0 ? 'dead' : e.state } as Enemy;
      });
      return { enemies };
    }),

  damagePlayer: (damage) =>
    set((prev) => {
      if (prev.gameState.phase !== 'playing') return prev;
      const health = Math.max(0, prev.gameState.health - damage);
      const phase = health <= 0 ? 'dead' : prev.gameState.phase;
      return { gameState: { ...prev.gameState, health, phase, hitFlashTime: Date.now() } };
    }),

  addScore: (points) =>
    set((prev) => {
      const score = prev.gameState.score + points;
      const kills = prev.gameState.kills + 1;
      return { gameState: { ...prev.gameState, score, kills } };
    }),

  reloadAmmo: () =>
    set((prev) => ({
      gameState: { ...prev.gameState, ammo: prev.gameState.maxAmmo },
    })),

  addPowerup: (powerup) =>
    set((prev) => ({ powerups: [...prev.powerups, powerup] })),

  removePowerup: (id) =>
    set((prev) => ({ powerups: prev.powerups.filter((p) => p.id !== id) })),

  activatePowerup: (type) =>
    set((prev) => {
      if (type === 'damage') {
        return { gameState: { ...prev.gameState, damageMultiplier: 2, damageMultiplierTime: 15 } };
      } else {
        return { gameState: { ...prev.gameState, speedMultiplier: 2, speedMultiplierTime: 15 } };
      }
    }),

  tickPowerups: (delta) =>
    set((prev) => {
      const gs = prev.gameState;
      let dmgMult = gs.damageMultiplier;
      let dmgTime = gs.damageMultiplierTime;
      let spdMult = gs.speedMultiplier;
      let spdTime = gs.speedMultiplierTime;

      if (dmgTime > 0) {
        dmgTime = Math.max(0, dmgTime - delta);
        if (dmgTime === 0) dmgMult = 1;
      }
      if (spdTime > 0) {
        spdTime = Math.max(0, spdTime - delta);
        if (spdTime === 0) spdMult = 1;
      }

      if (dmgMult === gs.damageMultiplier && dmgTime === gs.damageMultiplierTime &&
          spdMult === gs.speedMultiplier && spdTime === gs.speedMultiplierTime) {
        return prev;
      }

      return {
        gameState: {
          ...gs,
          damageMultiplier: dmgMult,
          damageMultiplierTime: dmgTime,
          speedMultiplier: spdMult,
          speedMultiplierTime: spdTime,
        },
      };
    }),

  startGame: () =>
    set({
      gameState: { ...initialGameState, phase: 'playing' },
      enemies: generateEnemies(1),
      bullets: [],
      powerups: [],
    }),

  nextWave: () =>
    set((prev) => {
      const wave = prev.gameState.wave + 1;
      return {
        gameState: {
          ...prev.gameState,
          wave,
          phase: 'playing',
          health: Math.min(prev.gameState.maxHealth, prev.gameState.health + 30),
          ammo: prev.gameState.maxAmmo,
        },
        enemies: generateEnemies(wave),
        bullets: [],
        powerups: [],
      };
    }),

  resetGame: () =>
    set({
      gameState: initialGameState,
      enemies: [],
      bullets: [],
      powerups: [],
    }),
}));
