# Demon Hunter 🔫

  A fully playable browser-based 3D first-person shooter built with React Three Fiber.

  ## Play It Live
  > Playable directly in the browser — no install required.

  ## Features

  - **Full FPS controls** — WASD movement, mouse aim, pointer lock
  - **Full-auto fire** — hold mouse button or Space to fire continuously
  - **Manual reload** — press **R** to reload at any time
  - **3D Assault Rifle** — with recoil animation and reload animation (magazine ejects and re-seats)
  - **Demon enemies** — hand-crafted 3D demon models with glowing eyes, horns, and health bars that always face the player
  - **Wave system** — enemies get harder each wave; wave-complete screen between rounds
  - **Power-ups** (10% drop chance on kill):
    - 🟡 **2x Damage** — golden floating disc, doubles damage for 15 seconds
    - 🔵 **Speed Boost** — blue floating arrow disc, doubles movement speed for 15 seconds
  - **HUD** — health bar, ammo counter, wave/score, kill count, active power-up timers
  - **Sound effects** — gunshot, bullet impact, enemy death, power-up pickup, player damage, ambient hum (Web Audio API, no external files)
  - **Hit feedback** — red perimeter flash + camera shake on damage
  - **Pause system** — ESC unlocks mouse and pauses; click canvas to resume

  ## Controls

  | Action | Input |
  |--------|-------|
  | Move | WASD / Arrow Keys |
  | Aim | Mouse |
  | Fire (full auto) | Hold Left Click / Hold Space |
  | Reload | R |
  | Unlock mouse / Pause | ESC |
  | Resume | Click canvas |

  ## Tech Stack

  - [React](https://react.dev/) + [Vite](https://vitejs.dev/)
  - [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
  - [@react-three/drei](https://github.com/pmndrs/drei)
  - [Three.js](https://threejs.org/)
  - [Zustand](https://zustand.docs.pmnd.rs/) (game state)
  - [Tailwind CSS](https://tailwindcss.com/) (HUD/menus)
  - Web Audio API (procedural sound synthesis — no audio files)

  ## Getting Started

  ```bash
  # Install dependencies
  pnpm install

  # Start dev server
  pnpm --filter @workspace/3d-game run dev
  ```

  Open [http://localhost:PORT](http://localhost:PORT) in your browser, click the canvas to lock the mouse, and start hunting demons.
  