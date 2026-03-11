import { useRef, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { Enemy } from './types';
import { playBulletImpact, playEnemyDeath } from './soundEngine';

const POWERUP_DROP_CHANCE = 0.10;

const ATTACK_RANGE = 2.0;
const ATTACK_COOLDOWN = 1.5;
const ATTACK_DAMAGE = 10;
const BOB_SPEED = 3;
const BOB_AMPLITUDE = 0.1;

function EnemyMesh({
  enemy,
  attackCooldowns,
  posRefs,
}: {
  enemy: Enemy;
  attackCooldowns: MutableRefObject<Map<string, number>>;
  posRefs: MutableRefObject<Map<string, THREE.Vector3>>;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const healthBarRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (enemy.state === 'dead' || !meshRef.current) return;

    const pos = posRefs.current.get(enemy.id);
    if (!pos) return;

    const playerPos = new THREE.Vector3(camera.position.x, 0, camera.position.z);
    const enemyFlat = new THREE.Vector3(pos.x, 0, pos.z);
    const distToPlayer = playerPos.distanceTo(enemyFlat);

    const bobY = pos.y + Math.sin(Date.now() * 0.001 * BOB_SPEED) * BOB_AMPLITUDE;
    meshRef.current.position.set(pos.x, bobY, pos.z);

    const dir = playerPos.clone().sub(enemyFlat);
    if (dir.lengthSq() > 0.01) {
      meshRef.current.lookAt(camera.position.x, bobY, camera.position.z);
    }

    if (distToPlayer < ATTACK_RANGE) {
      const cooldown = attackCooldowns.current.get(enemy.id) ?? 0;
      if (cooldown <= 0) {
        useGameStore.getState().damagePlayer(ATTACK_DAMAGE);
        attackCooldowns.current.set(enemy.id, ATTACK_COOLDOWN);
      } else {
        attackCooldowns.current.set(enemy.id, cooldown - delta);
      }
    }

    if (distToPlayer > ATTACK_RANGE * 0.7) {
      const moveDir = playerPos.clone().sub(enemyFlat).normalize();
      pos.x += moveDir.x * enemy.speed * delta;
      pos.z += moveDir.z * enemy.speed * delta;
    }

    const currentEnemy = useGameStore.getState().enemies.find(e => e.id === enemy.id);
    if (currentEnemy && healthBarRef.current) {
      const pct = currentEnemy.health / currentEnemy.maxHealth;
      healthBarRef.current.scale.x = Math.max(0.001, pct);
      healthBarRef.current.position.x = -0.5 + pct * 0.5;
    }
  });

  if (enemy.state === 'dead') return null;

  const body = { color: '#6a0000', metalness: 0.3, roughness: 0.7 };
  const dark = { color: '#3a0000', metalness: 0.3, roughness: 0.7 };
  const horn = { color: '#111111', metalness: 0.6, roughness: 0.4 };
  const eye  = { color: '#ff5500', emissive: '#ff3300', emissiveIntensity: 2.5 };

  return (
    <group ref={meshRef} position={enemy.position}>
      {/* torso */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.85, 0.95, 0.48]} />
        <meshStandardMaterial {...body} />
      </mesh>
      {/* shoulders — wider than torso */}
      <mesh position={[0, 0.54, 0]}>
        <boxGeometry args={[1.2, 0.22, 0.46]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* head */}
      <mesh position={[0, 0.96, 0]}>
        <boxGeometry args={[0.62, 0.52, 0.44]} />
        <meshStandardMaterial {...body} />
      </mesh>
      {/* brow ridge */}
      <mesh position={[0, 1.16, 0.22]}>
        <boxGeometry args={[0.64, 0.1, 0.12]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* jaw */}
      <mesh position={[0, 0.72, 0.18]}>
        <boxGeometry args={[0.48, 0.18, 0.26]} />
        <meshStandardMaterial color="#4a0000" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* left horn */}
      <mesh position={[-0.22, 1.42, 0]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[0.1, 0.44, 0.1]} />
        <meshStandardMaterial {...horn} />
      </mesh>
      {/* right horn */}
      <mesh position={[0.22, 1.42, 0]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.1, 0.44, 0.1]} />
        <meshStandardMaterial {...horn} />
      </mesh>
      {/* left eye */}
      <mesh position={[-0.16, 0.98, 0.23]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial {...eye} />
      </mesh>
      {/* right eye */}
      <mesh position={[0.16, 0.98, 0.23]}>
        <sphereGeometry args={[0.075, 8, 8]} />
        <meshStandardMaterial {...eye} />
      </mesh>
      {/* left arm */}
      <mesh position={[-0.62, -0.1, 0]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.22, 0.72, 0.22]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* right arm */}
      <mesh position={[0.62, -0.1, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.22, 0.72, 0.22]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* legs */}
      <mesh position={[-0.22, -0.72, 0]}>
        <boxGeometry args={[0.28, 0.54, 0.28]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      <mesh position={[0.22, -0.72, 0]}>
        <boxGeometry args={[0.28, 0.54, 0.28]} />
        <meshStandardMaterial {...dark} />
      </mesh>
      {/* health bar track */}
      <mesh position={[0, 1.85, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.08]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      {/* health bar fill */}
      <mesh ref={healthBarRef} position={[0, 1.85, 0.05]}>
        <boxGeometry args={[1.0, 0.08, 0.05]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
    </group>
  );
}

export default function EnemySystem() {
  const { enemies } = useGameStore();
  const attackCooldowns = useRef<Map<string, number>>(new Map());
  const posRefs = useRef<Map<string, THREE.Vector3>>(new Map());

  enemies.forEach((enemy) => {
    if (!posRefs.current.has(enemy.id)) {
      posRefs.current.set(
        enemy.id,
        new THREE.Vector3(enemy.position[0], enemy.position[1], enemy.position[2])
      );
    }
  });

  useFrame(() => {
    const store = useGameStore.getState();
    if (store.gameState.phase !== 'playing') return;

    posRefs.current.forEach((pos, id) => {
      const enemy = store.enemies.find(e => e.id === id);
      if (!enemy || enemy.state === 'dead') return;

      const bulletHits = store.bullets.filter(b => {
        const bPos = new THREE.Vector3(...b.position);
        return bPos.distanceTo(pos) < 1.2;
      });

      if (bulletHits.length > 0) {
        bulletHits.forEach(b => store.removeBullet(b.id));
        const dmgMult = store.gameState.damageMultiplier ?? 1;
        store.damageEnemy(id, 25 * bulletHits.length * dmgMult);
        const updated = useGameStore.getState().enemies.find(e => e.id === id);
        if (updated && updated.state === 'dead') {
          playEnemyDeath();
          store.addScore(100 + store.gameState.wave * 50);
          if (Math.random() < POWERUP_DROP_CHANCE) {
            const type = Math.random() < 0.5 ? 'damage' : 'speed';
            store.addPowerup({
              id: `powerup-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              type,
              position: [pos.x, 0, pos.z],
            });
          }
        } else {
          playBulletImpact();
        }
      }
    });

    const liveEnemies = store.enemies.filter(e => e.state !== 'dead');
    if (liveEnemies.length === 0 && store.enemies.length > 0) {
      posRefs.current.clear();
      attackCooldowns.current.clear();
      useGameStore.getState().setGameState({ phase: 'waveComplete' });
    }
  });

  return (
    <group>
      {enemies.map((enemy) => (
        <EnemyMesh
          key={enemy.id}
          enemy={enemy}
          attackCooldowns={attackCooldowns}
          posRefs={posRefs}
        />
      ))}
    </group>
  );
}
