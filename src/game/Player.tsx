import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { muzzleWorldPosition, muzzleWorldDirection } from './weaponState';
import { playGunshot, playPlayerDamage, playReload } from './soundEngine';
import { reloadState } from './reloadState';

enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  shoot = 'shoot',
  reload = 'reload',
}

const PLAYER_SPEED = 5;
const PLAYER_HEIGHT = 1.7;
const SHOOT_COOLDOWN = 0.1;
const BULLET_SPEED = 35;
const ARENA_SIZE = 28;
const RELOAD_DURATION = 1.5;

export default function Player() {
  const { camera } = useThree();
  const [, getControls] = useKeyboardControls<Controls>();

  const yaw = useRef(0);
  const pitch = useRef(0);
  const shootTimer = useRef(0);
  const isPointerLocked = useRef(false);
  const reloadTimer = useRef(0);
  const isReloading = useRef(false);
  const trauma = useRef(0);
  const mouseHeld = useRef(false);
  const reloadKeyWasDown = useRef(false);

  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (state) => state.gameState.health,
      (health, prevHealth) => {
        if (health < prevHealth) {
          trauma.current = Math.min(1, trauma.current + 0.9);
          playPlayerDamage();
        }
      }
    );
    return unsub;
  }, []);

  const startReload = () => {
    const store = useGameStore.getState();
    if (isReloading.current) return;
    if (store.gameState.ammo >= store.gameState.maxAmmo) return;
    isReloading.current = true;
    reloadTimer.current = RELOAD_DURATION;
    reloadState.isReloading = true;
    reloadState.progress = 0;
    playReload();
  };

  const shoot = () => {
    const store = useGameStore.getState();
    if (store.gameState.phase !== 'playing') return;
    if (store.gameState.ammo <= 0 || isReloading.current) return;
    if (shootTimer.current > 0) return;

    playGunshot();
    shootTimer.current = SHOOT_COOLDOWN;

    const pos = muzzleWorldPosition.clone();
    const dir = muzzleWorldDirection.clone().normalize();

    const bulletId = `bullet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    store.addBullet({
      id: bulletId,
      position: [pos.x, pos.y, pos.z],
      direction: [dir.x, dir.y, dir.z],
      speed: BULLET_SPEED,
      life: 2.5,
    });

    const newAmmo = Math.max(0, store.gameState.ammo - 1);
    store.setGameState({ ammo: newAmmo });

    if (newAmmo <= 0) {
      startReload();
    }
  };

  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 0);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const sensitivity = 0.002;
      yaw.current -= e.movementX * sensitivity;
      pitch.current -= e.movementY * sensitivity;
      pitch.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch.current));
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!isPointerLocked.current) {
        const target = e.target as HTMLElement;
        if (target && target.tagName === 'CANVAS') {
          document.body.requestPointerLock();
        }
        return;
      }
      mouseHeld.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mouseHeld.current = false;
    };

    const handleLockChange = () => {
      const locked = !!document.pointerLockElement;
      isPointerLocked.current = locked;
      if (!locked) {
        mouseHeld.current = false;
        const { phase } = useGameStore.getState().gameState;
        if (phase === 'playing') {
          useGameStore.getState().setGameState({ phase: 'paused' });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('pointerlockchange', handleLockChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('pointerlockchange', handleLockChange);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const { gameState } = useGameStore.getState();
    if (gameState.phase !== 'playing') return;

    shootTimer.current = Math.max(0, shootTimer.current - delta);

    if (isReloading.current) {
      reloadTimer.current -= delta;
      reloadState.progress = Math.min(1, 1 - reloadTimer.current / RELOAD_DURATION);
      if (reloadTimer.current <= 0) {
        isReloading.current = false;
        reloadState.isReloading = false;
        reloadState.progress = 0;
        useGameStore.getState().reloadAmmo();
      }
    }

    const controls = getControls();

    // Manual reload on R (edge-triggered)
    if (controls.reload && !reloadKeyWasDown.current) {
      startReload();
    }
    reloadKeyWasDown.current = !!controls.reload;

    // Full auto: fire while mouse held or Space held
    if ((mouseHeld.current && isPointerLocked.current) || controls.shoot) {
      shoot();
    }

    // Trauma / camera shake
    if (trauma.current > 0) {
      trauma.current = Math.max(0, trauma.current - delta * 4);
    }
    const shake = trauma.current * trauma.current;
    const MAX_ANGLE = 0.035;
    const shakeYaw   = yaw.current   + (Math.random() * 2 - 1) * MAX_ANGLE * shake;
    const shakePitch = pitch.current + (Math.random() * 2 - 1) * MAX_ANGLE * shake;

    const euler = new THREE.Euler(shakePitch, shakeYaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, yaw.current, 0));
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, yaw.current, 0));

    const velocity = new THREE.Vector3();
    if (controls.forward) velocity.add(forward);
    if (controls.back) velocity.sub(forward);
    if (controls.left) velocity.sub(right);
    if (controls.right) velocity.add(right);

    if (velocity.lengthSq() > 0) {
      const speedMult = gameState.speedMultiplier ?? 1;
      velocity.normalize().multiplyScalar(PLAYER_SPEED * speedMult * delta);
    }

    const newPos = camera.position.clone().add(velocity);
    newPos.x = Math.max(-ARENA_SIZE, Math.min(ARENA_SIZE, newPos.x));
    newPos.z = Math.max(-ARENA_SIZE, Math.min(ARENA_SIZE, newPos.z));
    newPos.y = PLAYER_HEIGHT;
    camera.position.copy(newPos);
  });

  return null;
}
