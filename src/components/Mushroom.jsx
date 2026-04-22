import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   Mushroom — proximity glow system
   ─────────────────────────────────────────────────────────────────
   • In DARK mode (default / night): mushrooms are completely dark
     silhouettes at distance. As the character approaches within
     GLOW_RADIUS units they smoothly illuminate — cap emissive
     brightens, a point light fades in, stem glows faintly.
   • In LIGHT mode: mushrooms are always lightly visible (no
     proximity effect needed — world is bright).

   Props:
     position   [x, y, z]
     color      hex string — cap hue
     charPosRef React ref holding THREE.Vector3 of character pos
     isDark     boolean — whether night mode is active
───────────────────────────────────────────────────────────────── */

const GLOW_RADIUS  = 5.5   // units — start of glow fade-in
const FULL_RADIUS  = 2.2   // units — fully bright
const _charPos = new THREE.Vector3()
const _mushPos = new THREE.Vector3()

export default function Mushroom({ position, color = '#c84040', charPosRef, isDark = true }) {
  const groupRef    = useRef()
  const capMatRef   = useRef()
  const stemMatRef  = useRef()
  const lightRef    = useRef()
  // Proximity factor 0 → 1
  const proximityRef = useRef(isDark ? 0 : 1)

  // Slight idle sway
  const swayPhase = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // ── Compute proximity ──
    if (charPosRef?.current && groupRef.current) {
      _mushPos.set(...position)
      _charPos.copy(charPosRef.current)
      const dist = _charPos.distanceTo(_mushPos)

      const target = isDark
        ? THREE.MathUtils.clamp(
            THREE.MathUtils.inverseLerp(GLOW_RADIUS, FULL_RADIUS, dist),
            0, 1
          )
        : 1

      // Smooth lerp toward target
      proximityRef.current = THREE.MathUtils.lerp(proximityRef.current, target, 0.04)
    }

    const p = proximityRef.current

    // ── Sway ──
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 1.1 + swayPhase.current) * 0.025
    }

    // ── Cap emissive — dark until proximity ──
    if (capMatRef.current) {
      // In dark mode: base opacity near-zero, emissive grows with proximity
      capMatRef.current.emissiveIntensity = isDark
        ? p * 2.8 + (Math.sin(t * 2.4 + swayPhase.current) * 0.12 * p)
        : 0.3
      // Cap is nearly invisible as silhouette when p≈0 in dark mode
      capMatRef.current.opacity = isDark
        ? THREE.MathUtils.lerp(0.08, 1.0, p)
        : 1.0
      capMatRef.current.transparent = true
    }

    // ── Stem — faint silhouette at distance ──
    if (stemMatRef.current) {
      stemMatRef.current.opacity = isDark
        ? THREE.MathUtils.lerp(0.06, 0.95, p)
        : 1.0
      stemMatRef.current.transparent = true
    }

    // ── Point light intensity ──
    if (lightRef.current) {
      lightRef.current.intensity = isDark
        ? p * 1.6 + Math.sin(t * 3.0 + swayPhase.current) * 0.08 * p
        : 0
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Stem */}
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.045, 0.065, 0.24, 6]} />
        <meshStandardMaterial
          ref={stemMatRef}
          color="#d8c898"
          roughness={0.75}
          opacity={isDark ? 0.06 : 1.0}
          transparent={isDark}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.17, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
        <meshStandardMaterial
          ref={capMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={isDark ? 0 : 0.3}
          roughness={0.45}
          metalness={0.05}
          opacity={isDark ? 0.08 : 1.0}
          transparent={isDark}
          flatShading
        />
      </mesh>

      {/* Spots on cap — always same transparency as cap */}
      {[
        [ 0.04, 0.38, 0.12],
        [-0.07, 0.35, 0.10],
        [ 0.10, 0.33, 0.05],
      ].map(([sx, sy, sz], i) => (
        <mesh key={i} position={[sx, sy, sz]}>
          <sphereGeometry args={[0.022, 5, 4]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={isDark
              ? THREE.MathUtils.lerp(0.05, 0.70, proximityRef.current)
              : 0.70}
          />
        </mesh>
      ))}

      {/* Proximity point light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.35, 0]}
        color={color}
        intensity={0}
        distance={7}
        decay={2}
      />
    </group>
  )
}
