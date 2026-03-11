import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { Powerup } from './types';
import { playPowerupPickup } from './soundEngine';

const PICKUP_RADIUS = 1.5;
const BOB_SPEED = 2.5;
const BOB_AMPLITUDE = 0.07;
const BASE_Y = 0.28;

function ArrowIcon() {
  const mat = { color: '#ffffff' as const, emissive: '#aaddff' as const, emissiveIntensity: 1.2 };
  return (
    <group>
      {/* Shaft */}
      <mesh position={[-0.06, 0, 0.03]}>
        <boxGeometry args={[0.32, 0.1, 0.04]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Arrowhead top arm */}
      <mesh position={[0.17, 0.115, 0.03]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.075, 0.04]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      {/* Arrowhead bottom arm */}
      <mesh position={[0.17, -0.115, 0.03]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.075, 0.04]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}

function DamageIcon() {
  return (
    <Text
      position={[0, 0, 0.03]}
      fontSize={0.38}
      color="#FFD700"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.025}
      outlineColor="#7a4400"
    >
      2x
    </Text>
  );
}

function PowerupMesh({ powerup }: { powerup: Powerup }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const bobTime = useRef(Math.random() * Math.PI * 2);
  const collected = useRef(false);

  const isDamage = powerup.type === 'damage';
  const diskColor = isDamage ? '#b87800' : '#0055cc';
  const diskEmissive = isDamage ? '#cc8800' : '#0033aa';

  useFrame((_, delta) => {
    if (collected.current || !groupRef.current) return;

    bobTime.current += delta * BOB_SPEED;
    const bobY = BASE_Y + Math.sin(bobTime.current) * BOB_AMPLITUDE;
    groupRef.current.position.y = bobY;
    groupRef.current.lookAt(camera.position.x, bobY, camera.position.z);

    const dx = camera.position.x - powerup.position[0];
    const dz = camera.position.z - powerup.position[2];
    if (Math.sqrt(dx * dx + dz * dz) < PICKUP_RADIUS) {
      collected.current = true;
      playPowerupPickup();
      const store = useGameStore.getState();
      store.activatePowerup(powerup.type);
      store.removePowerup(powerup.id);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[powerup.position[0], BASE_Y, powerup.position[2]]}
    >
      {/* Backing disk */}
      <mesh>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 20]} />
        <meshStandardMaterial
          color={diskColor}
          emissive={diskEmissive}
          emissiveIntensity={1.8}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Rim ring */}
      <mesh>
        <torusGeometry args={[0.42, 0.04, 8, 24]} />
        <meshStandardMaterial
          color={isDamage ? '#FFD700' : '#44aaff'}
          emissive={isDamage ? '#cc9900' : '#2266cc'}
          emissiveIntensity={2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Icon */}
      {isDamage ? <DamageIcon /> : <ArrowIcon />}
      {/* Glow point light */}
      <pointLight
        color={isDamage ? '#ffaa00' : '#4488ff'}
        intensity={0.8}
        distance={3}
      />
    </group>
  );
}

export default function PowerupSystem() {
  const { powerups } = useGameStore();

  useFrame((_, delta) => {
    const store = useGameStore.getState();
    if (store.gameState.phase === 'playing') {
      store.tickPowerups(delta);
    }
  });

  return (
    <group>
      {powerups.map((p) => (
        <PowerupMesh key={p.id} powerup={p} />
      ))}
    </group>
  );
}
