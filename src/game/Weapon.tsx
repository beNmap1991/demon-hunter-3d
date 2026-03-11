import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { muzzleWorldPosition, muzzleWorldDirection } from './weaponState';
import { reloadState } from './reloadState';

const MUZZLE_LOCAL = new THREE.Vector3(0, 0.01, -0.41);

const DARK = '#1a1a1a';
const DARKER = '#111111';
const MID = '#252525';
const RAIL = '#1e1e1e';

function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * clamp01(t); }
function invLerp(a: number, b: number, v: number) { return clamp01((v - a) / (b - a)); }
function rangeLerp(inA: number, inB: number, outA: number, outB: number, v: number) {
  return lerp(outA, outB, invLerp(inA, inB, v));
}

interface WeaponMeshProps {
  magRef: React.MutableRefObject<THREE.Group | null>;
}

function WeaponMesh({ magRef }: WeaponMeshProps) {
  const matProps = { depthTest: false, depthWrite: false };
  const r = 999;

  return (
    <group renderOrder={r}>
      {/* === RECEIVER / BODY === */}
      <mesh renderOrder={r} position={[0, 0, -0.02]}>
        <boxGeometry args={[0.065, 0.075, 0.35]} />
        <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} {...matProps} />
      </mesh>

      {/* === BARREL === */}
      <mesh renderOrder={r} position={[0, 0.01, -0.26]}>
        <boxGeometry args={[0.024, 0.024, 0.22]} />
        <meshStandardMaterial color={DARKER} metalness={0.9} roughness={0.2} {...matProps} />
      </mesh>

      {/* === MUZZLE DEVICE === */}
      <mesh renderOrder={r} position={[0, 0.01, -0.385]}>
        <boxGeometry args={[0.032, 0.032, 0.042]} />
        <meshStandardMaterial color={DARKER} metalness={0.9} roughness={0.1} {...matProps} />
      </mesh>

      {/* === HANDGUARD === */}
      <mesh renderOrder={r} position={[0, -0.004, -0.175]}>
        <boxGeometry args={[0.058, 0.062, 0.18]} />
        <meshStandardMaterial color={MID} metalness={0.5} roughness={0.5} {...matProps} />
      </mesh>

      {/* === STOCK === */}
      <mesh renderOrder={r} position={[0, -0.01, 0.185]}>
        <boxGeometry args={[0.055, 0.062, 0.16]} />
        <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} {...matProps} />
      </mesh>
      <mesh renderOrder={r} position={[0, -0.012, 0.27]}>
        <boxGeometry args={[0.052, 0.068, 0.018]} />
        <meshStandardMaterial color={MID} metalness={0.4} roughness={0.6} {...matProps} />
      </mesh>

      {/* === PISTOL GRIP === */}
      <mesh renderOrder={r} position={[0, -0.108, 0.05]}>
        <boxGeometry args={[0.046, 0.14, 0.056]} />
        <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.6} {...matProps} />
      </mesh>

      {/* === MAGAZINE (animated group) === */}
      <group ref={magRef}>
        <mesh renderOrder={r} position={[0, -0.148, -0.03]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[0.046, 0.165, 0.054]} />
          <meshStandardMaterial color={MID} metalness={0.6} roughness={0.4} {...matProps} />
        </mesh>
      </group>

      {/* === TOP RAIL === */}
      <mesh renderOrder={r} position={[0, 0.048, -0.02]}>
        <boxGeometry args={[0.018, 0.018, 0.31]} />
        <meshStandardMaterial color={RAIL} metalness={0.8} roughness={0.3} {...matProps} />
      </mesh>

      {/* === FRONT SIGHT POST === */}
      <mesh renderOrder={r} position={[0, 0.072, -0.245]}>
        <boxGeometry args={[0.01, 0.046, 0.012]} />
        <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} {...matProps} />
      </mesh>

      {/* === REAR SIGHT === */}
      <mesh renderOrder={r} position={[0, 0.066, 0.08]}>
        <boxGeometry args={[0.03, 0.03, 0.028]} />
        <meshStandardMaterial color={DARK} metalness={0.7} roughness={0.3} {...matProps} />
      </mesh>

      {/* === CHARGING HANDLE === */}
      <mesh renderOrder={r} position={[0, 0.028, 0.13]}>
        <boxGeometry args={[0.055, 0.016, 0.032]} />
        <meshStandardMaterial color={MID} metalness={0.7} roughness={0.3} {...matProps} />
      </mesh>
    </group>
  );
}

export default function Weapon() {
  const groupRef = useRef<THREE.Group>(null);
  const magRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const recoilOffset = useRef(0);
  const recoilVelocity = useRef(0);
  const prevBulletCount = useRef(0);
  const swayTime = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const store = useGameStore.getState();
    const bulletCount = store.bullets.length;

    // Recoil spring
    if (bulletCount > prevBulletCount.current) {
      recoilVelocity.current = 0.06;
    }
    prevBulletCount.current = bulletCount;

    recoilOffset.current += recoilVelocity.current;
    recoilVelocity.current += (-recoilOffset.current * 18 - recoilVelocity.current * 8) * delta;
    if (Math.abs(recoilOffset.current) < 0.0001 && Math.abs(recoilVelocity.current) < 0.0001) {
      recoilOffset.current = 0;
      recoilVelocity.current = 0;
    }

    // Idle sway
    swayTime.current += delta;
    const swayX = Math.sin(swayTime.current * 1.2) * 0.004;
    const swayY = Math.sin(swayTime.current * 0.8) * 0.002;

    // ── Reload animation ──────────────────────────────────────────────────
    const { isReloading, progress: p } = reloadState;
    let reloadLower = 0;   // extra downward shift
    let reloadTilt = 0;    // extra forward pitch
    let magY = 0;          // magazine drop offset

    if (isReloading) {
      // Weapon lowers and tilts in (0→0.15), holds (0.15→0.85), recovers (0.85→1)
      if (p < 0.15) {
        reloadLower = rangeLerp(0, 0.15, 0, 0.09, p);
        reloadTilt  = rangeLerp(0, 0.15, 0, 0.32, p);
      } else if (p < 0.85) {
        reloadLower = 0.09;
        reloadTilt  = 0.32;
      } else {
        reloadLower = rangeLerp(0.85, 1, 0.09, 0, p);
        reloadTilt  = rangeLerp(0.85, 1, 0.32, 0, p);
      }

      // Magazine: ejects (0.2→0.47) then re-seats (0.47→0.74)
      if (p > 0.2 && p < 0.47) {
        magY = rangeLerp(0.2, 0.47, 0, -0.32, p);
      } else if (p >= 0.47 && p < 0.74) {
        magY = rangeLerp(0.47, 0.74, -0.32, 0, p);
      }
    }

    // ── Position & orient ────────────────────────────────────────────────
    const localOffset = new THREE.Vector3(
      0.22 + swayX,
      -0.18 + swayY - recoilOffset.current * 0.15 - reloadLower,
      -0.42 + recoilOffset.current * 0.5
    );
    localOffset.applyQuaternion(camera.quaternion);

    groupRef.current.position.copy(camera.position).add(localOffset);
    groupRef.current.quaternion.copy(camera.quaternion);

    const combinedEuler = new THREE.Euler(
      -recoilOffset.current * 0.8 + reloadTilt,
      0,
      0
    );
    groupRef.current.quaternion.multiply(
      new THREE.Quaternion().setFromEuler(combinedEuler)
    );

    // Animate magazine group
    if (magRef.current) {
      magRef.current.position.y = magY;
    }

    // ── Muzzle tracking ──────────────────────────────────────────────────
    muzzleWorldPosition
      .copy(MUZZLE_LOCAL)
      .applyQuaternion(groupRef.current.quaternion)
      .add(groupRef.current.position);

    muzzleWorldDirection
      .set(0, 0, -1)
      .applyQuaternion(groupRef.current.quaternion)
      .normalize();
  });

  return (
    <group ref={groupRef}>
      <WeaponMesh magRef={magRef} />
    </group>
  );
}
