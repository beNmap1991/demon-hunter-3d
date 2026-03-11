import * as THREE from 'three';

const ARENA_SIZE = 30;
const WALL_HEIGHT = 5;
const WALL_THICKNESS = 1;

function Wall({ position, rotation, size }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#555566" roughness={0.9} />
    </mesh>
  );
}

const pillarPositions: [number, number, number][] = [
  [-15, 1.5, -15], [15, 1.5, -15],
  [-15, 1.5, 15], [15, 1.5, 15],
  [-5, 1.5, -20], [5, 1.5, -20],
  [-5, 1.5, 20], [5, 1.5, 20],
  [-20, 1.5, -5], [-20, 1.5, 5],
  [20, 1.5, -5], [20, 1.5, 5],
];

export default function Arena() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ARENA_SIZE * 2, ARENA_SIZE * 2, 20, 20]} />
        <meshStandardMaterial color="#334433" roughness={1} />
      </mesh>

      <Wall
        position={[0, WALL_HEIGHT / 2, -ARENA_SIZE]}
        size={[ARENA_SIZE * 2, WALL_HEIGHT, WALL_THICKNESS]}
      />
      <Wall
        position={[0, WALL_HEIGHT / 2, ARENA_SIZE]}
        size={[ARENA_SIZE * 2, WALL_HEIGHT, WALL_THICKNESS]}
      />
      <Wall
        position={[-ARENA_SIZE, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE * 2]}
      />
      <Wall
        position={[ARENA_SIZE, WALL_HEIGHT / 2, 0]}
        size={[WALL_THICKNESS, WALL_HEIGHT, ARENA_SIZE * 2]}
      />

      {pillarPositions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 3, 1.5]} />
          <meshStandardMaterial color="#445544" roughness={0.8} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5.0, 0]}>
        <planeGeometry args={[ARENA_SIZE * 2, ARENA_SIZE * 2]} />
        <meshStandardMaterial color="#1a1a2e" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
