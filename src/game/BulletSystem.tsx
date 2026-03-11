import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

export default function BulletSystem() {
  const { bullets } = useGameStore();
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  useFrame((_, delta) => {
    const store = useGameStore.getState();

    store.bullets.forEach((bullet) => {
      const mesh = meshRefs.current.get(bullet.id);
      if (!mesh) return;

      const dir = new THREE.Vector3(...bullet.direction);
      mesh.position.addScaledVector(dir, bullet.speed * delta);

      const pos = mesh.position;
      const newLife = bullet.life - delta;
      const outOfBounds = Math.abs(pos.x) > 40 || Math.abs(pos.z) > 40 || pos.y < -2 || pos.y > 20;

      if (newLife <= 0 || outOfBounds) {
        store.removeBullet(bullet.id);
        meshRefs.current.delete(bullet.id);
      } else {
        useGameStore.setState((prev) => ({
          bullets: prev.bullets.map((b) =>
            b.id === bullet.id
              ? { ...b, position: [pos.x, pos.y, pos.z], life: newLife }
              : b
          ),
        }));
      }
    });
  });

  return (
    <group>
      {bullets.map((bullet) => (
        <mesh
          key={bullet.id}
          position={bullet.position}
          ref={(mesh) => {
            if (mesh) meshRefs.current.set(bullet.id, mesh);
            else meshRefs.current.delete(bullet.id);
          }}
        >
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      ))}
    </group>
  );
}
