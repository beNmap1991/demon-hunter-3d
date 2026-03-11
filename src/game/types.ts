export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  state: 'idle' | 'chasing' | 'dead';
  color: string;
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  life: number;
}

export interface Powerup {
  id: string;
  type: 'damage' | 'speed';
  position: [number, number, number];
}

export interface GameState {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  wave: number;
  phase: 'menu' | 'playing' | 'paused' | 'dead' | 'waveComplete';
  kills: number;
  hitFlashTime: number;
  damageMultiplier: number;
  damageMultiplierTime: number;
  speedMultiplier: number;
  speedMultiplierTime: number;
}
