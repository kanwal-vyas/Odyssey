# ODYSSEY — Scroll-based 3D World

A React + Vite + Three.js scroll-driven 3D scene with 4 biomes and StringTune integration.

## Quick Start

```bash
npm install
npm run dev
```

---

## Architecture

### Why NOT using `@react-three/drei`'s `ScrollControls`

The original code used `ScrollControls` from drei, which wraps the canvas in an internal scroll container. This caused two problems:

1. The scroll element was inside the canvas, so the page didn't scroll naturally
2. `useScroll()` only works inside a `ScrollControls` context

**Solution**: We use a fixed canvas + a natural 600vh scroll container outside it. Scroll offset is read from `window.scrollY` inside `useFrame`, which is simpler and more reliable.

### StringTune Integration

StringTune is isolated from R3F's render loop:

- Loaded asynchronously via dynamic `import()`
- Pointed at a hidden sentinel DOM element (not the canvas)
- Progress is fed via a shared `useRef` that the `useFrame` loop writes to and a polling RAF reads from
- If StringTune fails to load or construct, the rest of the scene is completely unaffected

### Rendering Safety

The scene follows a progressive loading strategy:

1. `Canvas` renders immediately with a visible spinning cube (`DebugCube`)
2. Scene atmosphere, ground, and biomes are added as separate components
3. Each biome is self-contained and isolated from the others
4. `console.log` confirms render loop is alive every 120 frames (~2s at 60fps)

### Camera System

- `WAYPOINTS` defines 4 camera positions + look targets aligned to biome Z-centres
- `WorldController` lerps between them based on scroll offset
- Character follows the look target with slight lag

### CSS Safety

- `.canvas-wrapper` is `position: fixed; inset: 0` — always fills viewport
- `.scroll-container` is `position: relative; height: 600vh` — sits in document flow, allows scrolling
- `.hud` has `pointer-events: none` — never blocks canvas interaction
- Progress bar uses direct `style.width` assignment (no CSS vars / no `setProperty` quirks)

---

## File Structure

```
odyssey-website/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx       ← All scene + UI logic
    └── index.css     ← Design tokens + HUD styles
```

---

## Dependencies

| Package | Version | Role |
|---|---|---|
| react | ^18.2.0 | UI framework |
| @react-three/fiber | ^8.15.19 | React renderer for Three.js |
| @react-three/drei | ^9.88.0 | Three.js helpers (Stars, Float, Sparkles, Text, Billboard) |
| three | ^0.160.0 | 3D engine |
| @fiddle-digital/string-tune | ^1.1.55 | CSS animation sequencer (isolated) |

### Dev Dependencies

Using Vite 5 + `@vitejs/plugin-react` v4 to avoid peer-dep conflicts with React 18.
The original `package.json` used Vite 8 and `@types/react` v19 which conflict with React 18.

---

## Debug Console Output

On load you should see:
```
[R3F] Canvas created — WebGL renderer ready
[R3F] SceneAtmosphere mounted — fog & bg set
[StringTune] Initialized successfully  (or a non-fatal warning)
[R3F] frame loop alive — scroll offset: 0.000   (every ~2 seconds)
```