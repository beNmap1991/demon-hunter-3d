import { Canvas } from '@react-three/fiber';
import { KeyboardControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Suspense } from 'react';
import Player from './Player';
import EnemySystem from './EnemySystem';
import BulletSystem from './BulletSystem';
import Arena from './Arena';
import HUD from './HUD';
import MenuScreen from './MenuScreen';
import Weapon from './Weapon';
import PowerupSystem from './PowerupSystem';
import { useGameStore } from './useGameStore';
import { startAmbient, stopAmbient } from './soundEngine';
import { useEffect } from 'react';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
  reload = 'reload',
}

const keyMap = [
  { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
  { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
  { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
  { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
  { name: Controls.shoot, keys: ['Space'] },
  { name: Controls.reload, keys: ['KeyR'] },
];

function GameScene() {
  const { gameState } = useGameStore();
  const isPlaying = gameState.phase === 'playing';

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 4, 0]} intensity={0.3} color="#4488ff" />
      <fog attach="fog" args={['#0a0a14', 20, 70]} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} />

      <Arena />

      {isPlaying && (
        <>
          <Player />
          <EnemySystem />
          <BulletSystem />
          <Weapon />
          <PowerupSystem />
        </>
      )}
    </>
  );
}

export default function Game() {
  const { gameState } = useGameStore();
  const isPlaying = gameState.phase === 'playing';

  useEffect(() => {
    if (gameState.phase === 'playing') {
      startAmbient();
    } else {
      stopAmbient();
    }
  }, [gameState.phase]);

  return (
    <div className="fixed inset-0 bg-black" style={{ cursor: isPlaying ? 'none' : 'auto' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ fov: 75, near: 0.1, far: 200 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <MenuScreen />
      {isPlaying && <HUD />}
    </div>
  );
}
