import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   Character — matches the reference sprite:
   • Round, slightly-flattened body — cream belly, warm taupe fur
   • Large expressive dark eyes with white catchlight dots
   • Sage-green leaf hood that comes to a soft point
   • Small brown crossbody satchel with flap
   • Stubby round arms and legs
   • Idle: gentle bob + slow head sway
   • Moving: faster bob, arm/leg swing, slight body squash
───────────────────────────────────────────────────────────────── */

// Palette lifted from reference sprite
const C = {
  fur:       '#8a7260',   // warm taupe body
  belly:     '#e8dfc8',   // cream front
  hood:      '#7ba05b',   // sage green
  hoodDark:  '#5a7840',   // deeper green fold
  leaf:      '#6b9448',   // leaf tip
  eye:       '#1e1208',   // near-black iris
  catchlight:'#ffffff',
  blush:     '#e89090',
  nose:      '#c0896a',
  satchel:   '#8b5e3c',   // medium brown
  satchelDk: '#6a4428',   // dark brown flap/strap
  sole:      '#4a3020',   // feet
  shadow:    '#000000',
}

export default function Character({ isMoving = false }) {
  const rootRef   = useRef()
  const bodyRef   = useRef()
  const headRef   = useRef()
  const hoodRef   = useRef()
  const larmRef   = useRef()
  const rarmRef   = useRef()
  const llegRef   = useRef()
  const rlegRef   = useRef()
  const shadowRef = useRef()

  useFrame((state) => {
    state.invalidate()
    const t = state.clock.getElapsedTime()

    const bobFreq = isMoving ? 8.0 : 3.0
    const bobAmp  = isMoving ? 0.08 : 0.045
    const bob = Math.abs(Math.sin(t * bobFreq)) * bobAmp

    if (rootRef.current) rootRef.current.position.y = bob

    // Body squash/stretch on land
    const squash = isMoving ? (1 + Math.sin(t * bobFreq * 2) * 0.05) : 1
    if (bodyRef.current) {
      bodyRef.current.scale.y = squash
      bodyRef.current.scale.x = 1 / Math.sqrt(squash)
      bodyRef.current.scale.z = 1 / Math.sqrt(squash)
    }

    // Head sway
    if (headRef.current) {
      headRef.current.rotation.z = isMoving
        ? Math.sin(t * 4.2) * 0.055
        : Math.sin(t * 1.2) * 0.022
      headRef.current.rotation.x = isMoving ? 0.06 : 0
    }

    // Hood gentle wobble
    if (hoodRef.current) {
      hoodRef.current.rotation.x = Math.sin(t * 1.8) * 0.03
      hoodRef.current.rotation.z = Math.sin(t * 1.2) * 0.015
    }

    // Arms swing opposite phase
    const armSwing = isMoving ? Math.sin(t * bobFreq) * 0.38 : Math.sin(t * 1.6) * 0.05
    if (larmRef.current) larmRef.current.rotation.x =  armSwing
    if (rarmRef.current) rarmRef.current.rotation.x = -armSwing

    // Legs
    const legSwing = isMoving ? Math.sin(t * bobFreq) * 0.30 : 0
    if (llegRef.current) llegRef.current.rotation.x =  legSwing
    if (rlegRef.current) rlegRef.current.rotation.x = -legSwing

    // Shadow scales down when character rises
    if (shadowRef.current) {
      const s = 1 - bob * 0.8
      shadowRef.current.scale.set(s, s, 1)
    }
  })

  return (
    <group>
      {/* Ground shadow */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]} scale={[1, 0.625, 1]}>
  <circleGeometry args={[0.32, 24]} />
  <meshBasicMaterial color={C.shadow} transparent opacity={0.22} depthWrite={false} />
</mesh>

      <group ref={rootRef}>

        {/* ── Legs (rendered behind body so Z-depth is correct) ── */}
        <group ref={llegRef} position={[-0.10, 0.26, 0]}>
          <mesh position={[0, -0.10, 0]}>
            {/* short stubby leg */}
            <capsuleGeometry args={[0.095, 0.14, 4, 8]} />
            <meshStandardMaterial color={C.fur} roughness={0.75} />
          </mesh>
          {/* round foot */}
          <mesh position={[0, -0.22, 0.05]}>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshStandardMaterial color={C.sole} roughness={0.85} />
          </mesh>
        </group>

        <group ref={rlegRef} position={[0.10, 0.26, 0]}>
          <mesh position={[0, -0.10, 0]}>
            <capsuleGeometry args={[0.095, 0.14, 4, 8]} />
            <meshStandardMaterial color={C.fur} roughness={0.75} />
          </mesh>
          <mesh position={[0, -0.22, 0.05]}>
            <sphereGeometry args={[0.11, 8, 6]} />
            <meshStandardMaterial color={C.sole} roughness={0.85} />
          </mesh>
        </group>

        {/* ── Main body — round, slightly wider than tall ── */}
        <group ref={bodyRef} position={[0, 0.55, 0]}>
          {/* Outer fur body */}
          <mesh>
            <sphereGeometry args={[0.32, 12, 10]} />
            <meshStandardMaterial color={C.fur} roughness={0.80} />
          </mesh>
          {/* Cream belly oval — slightly forward */}
          <mesh position={[0, -0.02, 0.20]} scale={[0.72, 0.82, 0.28]}>
            <sphereGeometry args={[0.28, 10, 8]} />
            <meshStandardMaterial color={C.belly} roughness={0.65} />
          </mesh>

          {/* Green cloak/poncho draping over shoulders */}
          <mesh position={[0, 0.10, -0.04]} scale={[1.12, 0.55, 1.05]}>
            <sphereGeometry args={[0.32, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.75]} />
            <meshStandardMaterial color={C.hood} roughness={0.72} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* ── Crossbody satchel ── */}
        <group position={[0.22, 0.50, 0.20]}>
          {/* bag body */}
          <mesh rotation={[0, -0.3, 0]}>
            <boxGeometry args={[0.14, 0.13, 0.07]} />
            <meshStandardMaterial color={C.satchel} roughness={0.82} />
          </mesh>
          {/* flap */}
          <mesh position={[0, 0.045, 0.038]} rotation={[-0.25, -0.3, 0]}>
            <boxGeometry args={[0.14, 0.07, 0.018]} />
            <meshStandardMaterial color={C.satchelDk} roughness={0.78} />
          </mesh>
          {/* tiny button clasp */}
          <mesh position={[0, 0.038, 0.050]}>
            <sphereGeometry args={[0.012, 5, 4]} />
            <meshStandardMaterial color="#c8a870" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* strap — diagonal from left shoulder to right hip */}
          <mesh position={[-0.14, 0.14, -0.05]} rotation={[0, 0, 0.6]}>
            <cylinderGeometry args={[0.012, 0.012, 0.38, 4]} />
            <meshStandardMaterial color={C.satchelDk} roughness={0.85} />
          </mesh>
        </group>

        {/* ── Arms ── */}
        <group ref={larmRef} position={[-0.30, 0.62, 0.02]}>
          <mesh position={[0, -0.10, 0]} rotation={[0, 0, 0.18]}>
            <capsuleGeometry args={[0.075, 0.16, 4, 7]} />
            <meshStandardMaterial color={C.fur} roughness={0.78} />
          </mesh>
          {/* round paw */}
          <mesh position={[-0.02, -0.22, 0]}>
            <sphereGeometry args={[0.09, 7, 6]} />
            <meshStandardMaterial color={C.belly} roughness={0.65} />
          </mesh>
        </group>

        <group ref={rarmRef} position={[0.30, 0.62, 0.02]}>
          <mesh position={[0, -0.10, 0]} rotation={[0, 0, -0.18]}>
            <capsuleGeometry args={[0.075, 0.16, 4, 7]} />
            <meshStandardMaterial color={C.fur} roughness={0.78} />
          </mesh>
          <mesh position={[0.02, -0.22, 0]}>
            <sphereGeometry args={[0.09, 7, 6]} />
            <meshStandardMaterial color={C.belly} roughness={0.65} />
          </mesh>
        </group>

        {/* ── Head ── */}
        <group ref={headRef} position={[0, 0.96, 0]}>

          {/* Head sphere */}
          <mesh>
            <sphereGeometry args={[0.255, 12, 10]} />
            <meshStandardMaterial color={C.fur} roughness={0.72} />
          </mesh>

          {/* Cream face mask */}
          <mesh position={[0, 0.01, 0.17]} scale={[0.80, 0.72, 0.35]}>
            <sphereGeometry args={[0.24, 10, 8]} />
            <meshStandardMaterial color={C.belly} roughness={0.60} />
          </mesh>

          {/* Eyes — big and round */}
          {/* Left eye */}
          <mesh position={[-0.09, 0.055, 0.225]}>
            <sphereGeometry args={[0.052, 8, 7]} />
            <meshStandardMaterial color={C.eye} roughness={0.15} />
          </mesh>
          {/* Right eye */}
          <mesh position={[0.09, 0.055, 0.225]}>
            <sphereGeometry args={[0.052, 8, 7]} />
            <meshStandardMaterial color={C.eye} roughness={0.15} />
          </mesh>
          {/* Catchlight L */}
          <mesh position={[-0.075, 0.072, 0.268]}>
            <sphereGeometry args={[0.016, 5, 4]} />
            <meshBasicMaterial color={C.catchlight} />
          </mesh>
          {/* Catchlight R */}
          <mesh position={[0.104, 0.072, 0.268]}>
            <sphereGeometry args={[0.016, 5, 4]} />
            <meshBasicMaterial color={C.catchlight} />
          </mesh>

          {/* Tiny nose */}
          <mesh position={[0, -0.018, 0.248]}>
            <sphereGeometry args={[0.022, 5, 4]} />
            <meshStandardMaterial color={C.nose} roughness={0.5} />
          </mesh>

          {/* Smile — small arc mesh */}
          <mesh position={[0, -0.055, 0.245]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.038, 0.008, 4, 8, Math.PI * 0.70]} />
            <meshBasicMaterial color="#8a5040" />
          </mesh>

          {/* Blush cheeks */}
          <mesh position={[-0.155, -0.008, 0.20]} rotation={[0.1, 0.4, 0]}>
            <sphereGeometry args={[0.042, 5, 4]} />
            <meshBasicMaterial color={C.blush} transparent opacity={0.45} />
          </mesh>
          <mesh position={[0.155, -0.008, 0.20]} rotation={[0.1, -0.4, 0]}>
            <sphereGeometry args={[0.042, 5, 4]} />
            <meshBasicMaterial color={C.blush} transparent opacity={0.45} />
          </mesh>

          {/* ── Hood — leaf-shaped, comes to a soft point at top ── */}
          <group ref={hoodRef} position={[0, 0.055, -0.025]}>
            {/* Main hood cap */}
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.295, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color={C.hood} roughness={0.70} side={THREE.DoubleSide} />
            </mesh>
            {/* Front brim arc */}
            <mesh position={[0, 0.005, 0.12]} rotation={[0.40, 0, 0]}>
              <torusGeometry args={[0.235, 0.032, 4, 12, Math.PI * 1.15]} />
              <meshStandardMaterial color={C.hoodDark} roughness={0.72} />
            </mesh>
            {/* Leaf tip — pointed top */}
            <mesh position={[0, 0.36, -0.04]} rotation={[0.22, 0, 0]}>
              <coneGeometry args={[0.065, 0.22, 5]} />
              <meshStandardMaterial color={C.leaf} roughness={0.70} flatShading />
            </mesh>
            {/* Fold crease on leaf tip */}
            <mesh position={[0, 0.38, -0.02]} rotation={[0.18, 0, 0]}>
              <coneGeometry args={[0.022, 0.14, 4]} />
              <meshStandardMaterial color={C.hoodDark} roughness={0.75} />
            </mesh>
            {/* Side leaves — decorative */}
            {[
              [-0.18, 0.20,  0.08,  0.2,  0, -0.5],
              [ 0.18, 0.22,  0.06,  0.2,  0,  0.5],
            ].map(([lx, ly, lz, rx, ry, rz], i) => (
              <mesh key={i} position={[lx, ly, lz]} rotation={[rx, ry, rz]}>
                <coneGeometry args={[0.048, 0.14, 4]} />
                <meshStandardMaterial color={C.leaf} roughness={0.72} flatShading />
              </mesh>
            ))}
            {/* Small floating acorn decoration */}
            <group>
              <mesh>
                <sphereGeometry args={[0.035, 5, 4]} />
                <meshStandardMaterial color="#b07830" roughness={0.5} metalness={0.2} />
              </mesh>
            </group>
          </group>
        </group>

      </group>
    </group>
  )
}
