import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   BiomeOcean — The Abyssal Deep
   • Underwater columns of god rays (animated planes)
   • Bioluminescent jellyfish (glowing spheres that bob)
   • Coral formations (multi-cone structures)
   • Kelp forest (swaying cylinders)
   • Bubble streams rising from the seafloor
   • Anglerfish lure (dangling glowing orb)
   • Proximity: dark deep → glowing as you approach creatures
─────────────────────────────────────────────────────────────────*/


const _charPos = new THREE.Vector3()
const _objPos  = new THREE.Vector3()
const OCEAN_REVEAL_RADIUS = 13
const OCEAN_FULL_RADIUS = 3.8
const JELLY_LANES = [-8.5, -5.5, -2.5, 0, 2.5, 5.5, 8.5]

let _seed2 = 77
const orng = () => {
  _seed2 = (_seed2 * 16807 + 0) % 2147483647
  return (_seed2 - 1) / 2147483646
}

// Jellyfish component — bobs, pulses glow
function Jellyfish({ position, color, charPosRef, isDarkRef }) {
  const groupRef  = useRef()
  const capMatRef = useRef()
  const lightRef  = useRef()
  const proxRef   = useRef(0)
  const phase     = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const dark = isDarkRef.current

    if (charPosRef?.current && groupRef.current) {
      _objPos.set(...position)
      _charPos.copy(charPosRef.current)
      const dist = _charPos.distanceTo(_objPos)
      const target = dark ? THREE.MathUtils.clamp(THREE.MathUtils.inverseLerp(14, 4, dist), 0, 1) : 1
      proxRef.current = THREE.MathUtils.lerp(proxRef.current, target, 0.04)
    }
    const p = proxRef.current

    // Bob up and down
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.7 + phase.current) * 0.8
      // Pulse scale
      const pulse = 1 + Math.sin(t * 2.2 + phase.current) * 0.06
      groupRef.current.scale.setScalar(pulse)
    }

    if (capMatRef.current) {
      capMatRef.current.emissiveIntensity = dark
        ? p * 3.5 + Math.sin(t * 1.8 + phase.current) * 0.3 * p
        : 1.2
      capMatRef.current.opacity = dark ? THREE.MathUtils.lerp(0.06, 0.85, p) : 0.82
    }

    if (lightRef.current) {
      lightRef.current.intensity = dark
        ? p * 2.5 + Math.sin(t * 2.0 + phase.current) * 0.2 * p
        : 0.8
    }
  })

  const tentacleOffsets = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: Math.sin(i / 8 * Math.PI * 2) * 0.35,
      z: Math.cos(i / 8 * Math.PI * 2) * 0.35,
      h: 0.8 + Math.random() * 0.6,
    })), [])

  return (
    <group ref={groupRef} position={position}>
      {/* Cap */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial
          ref={capMatRef}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Tentacles */}
      {tentacleOffsets.map((t, i) => (
        <mesh key={i} position={[t.x, -t.h / 2 + 0.1, t.z]}>
          <cylinderGeometry args={[0.012, 0.004, t.h, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
      ))}
      <pointLight ref={lightRef} color={color} intensity={0} distance={10} decay={2} />
    </group>
  )
}

// Coral — multi-cone cluster
function Coral({ position, color, height }) {
  const spikes = useMemo(() =>
    Array.from({ length: 6 + Math.floor(Math.random() * 5) }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      h: height * (0.4 + Math.random() * 0.6),
      r: 0.05 + Math.random() * 0.12,
    })), [height])

  return (
    <group position={position}>
      {spikes.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2, s.z]}>
          <coneGeometry args={[s.r, s.h, 6]} />
          <meshStandardMaterial color={color} roughness={0.5} emissive={color} emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

// Kelp strand — swaying tall cylinder
function Kelp({ position, height, isDarkRef }) {
  const meshRef = useRef()
  const phase   = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.6 + phase.current) * 0.12
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4 + phase.current * 1.3) * 0.06
    }
  })

  return (
    <mesh ref={meshRef} position={[position[0], height / 2, position[2]]}>
      <cylinderGeometry args={[0.04, 0.07, height, 4, 6]} />
      <meshStandardMaterial color="#1a4a1a" roughness={0.8} />
    </mesh>
  )
}

function GlowVent({ position, color, charPosRef, isDarkRef }) {
  const matRef = useRef()
  const haloRef = useRef()
  const lightRef = useRef()
  const proxRef = useRef(0)

  useFrame(({ clock }) => {
    const dark = isDarkRef.current
    const t = clock.getElapsedTime()
    let target = dark ? 0 : 1

    if (dark && charPosRef?.current) {
      _charPos.copy(charPosRef.current)
      _objPos.set(...position)
      const dist = _charPos.distanceTo(_objPos)
      target = THREE.MathUtils.clamp(
        THREE.MathUtils.inverseLerp(OCEAN_REVEAL_RADIUS, OCEAN_FULL_RADIUS, dist), 0, 1)
    }

    proxRef.current = THREE.MathUtils.lerp(proxRef.current, target, 0.05)
    const p = proxRef.current
    const pulse = 0.85 + Math.sin(t * 1.9 + position[2] * 0.1) * 0.15

    if (matRef.current) {
      matRef.current.emissiveIntensity = dark ? p * 4.8 * pulse : 1.2
      matRef.current.opacity = dark ? THREE.MathUtils.lerp(0.05, 0.85, p) : 0.65
    }
    if (haloRef.current) haloRef.current.opacity = dark ? p * 0.18 * pulse : 0.06
    if (lightRef.current) lightRef.current.intensity = dark ? p * 3.6 * pulse : 0.7
  })

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 18]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={0.05}
          transparent
          opacity={0.05}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.7, 24]} />
        <meshBasicMaterial ref={haloRef} color={color} transparent opacity={0} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0} distance={16} decay={2} />
    </group>
  )
}

export default function BiomeOcean({ origin, isDark = true, charPosRef }) {
  const ox = origin?.x ?? 0
  const oz = origin?.z ?? -330

  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const godRayRefs    = useRef([])
  const bubbleRefs    = useRef([])
  const anglerRef     = useRef()
  const anglerLightRef= useRef()

  const props = useMemo(() => {
    _seed2 = 77

    const jellyfish = Array.from({ length: 18 }, (_, i) => ({
      position: [
        ox + JELLY_LANES[i % JELLY_LANES.length] + Math.sin(i * 0.85) * 1.3 + (orng() - 0.5) * 1.8,
        3 + orng() * 10,
        oz - 8 - i * 2.9 - orng() * 6,
      ],
      color: ['#40c8ff','#80ffff','#ff80ff','#40ff80','#ff8040','#8040ff'][i % 6],
    }))

    const corals = Array.from({ length: 22 }, (_, i) => ({
      position: [ox + (orng() - 0.5) * 42, 0, oz - 4 - orng() * 60],
      color: ['#ff4080','#ff8020','#20c0ff','#ff2060','#ff6040','#c020ff'][i % 6],
      height: 0.6 + orng() * 2.2,
    }))

    const kelp = Array.from({ length: 30 }, () => ({
      position: [ox + (orng() - 0.5) * 40, 0, oz - 5 - orng() * 55],
      height: 2 + orng() * 5,
    }))

    const godRays = Array.from({ length: 8 }, (_, i) => ({
      position: [ox + (i - 4) * 7, 12, oz - 12 - i * 6],
      height: 14 + orng() * 6,
      width: 2 + orng() * 3,
    }))

    const bubbleStreams = Array.from({ length: 10 }, () => ({
      x: ox + (orng() - 0.5) * 36,
      z: oz - 8 - orng() * 50,
    }))

    const bgRocks = Array.from({ length: 12 }, () => ({
      position: [ox + (orng() - 0.5) * 55, orng() * 3 - 1, oz - 62 - orng() * 15],
      scale: 2 + orng() * 4,
    }))

    const glowVents = Array.from({ length: 9 }, (_, i) => ({
      position: [ox + Math.sin(i * 1.25) * 2.8, 0.08, oz - 5 - i * 6.8],
      color: ['#40c8ff', '#80ffaa', '#80ffff'][i % 3],
    }))

    return { jellyfish, corals, kelp, godRays, bubbleStreams, bgRocks, glowVents }
  }, [ox, oz])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const dark = isDarkRef.current

    // ── God rays — shimmer opacity ────────────────────────────────
    godRayRefs.current.forEach((mesh, i) => {
      if (!mesh?.material) return
      mesh.material.opacity = (dark ? 0.06 : 0.12) + Math.sin(t * 0.5 + i * 0.8) * 0.03
    })

    // ── Bubble streams — animate position ─────────────────────────
    bubbleRefs.current.forEach((group, i) => {
      if (!group) return
      const stream = props.bubbleStreams[i]
      group.children.forEach((bubble, j) => {
        const speed = 0.8 + j * 0.15
        const y = ((t * speed + j * 1.5) % 12)
        bubble.position.y = y
        bubble.material.opacity = Math.min(1, y / 2) * 0.5 * (1 - y / 12)
      })
    })

    // ── Anglerfish lure ───────────────────────────────────────────
    if (anglerRef.current) {
      anglerRef.current.position.y = 4.5 + Math.sin(t * 1.2) * 0.4
      anglerRef.current.position.x = ox + Math.sin(t * 0.3) * 3
    }
    if (anglerLightRef.current) {
      anglerLightRef.current.intensity = (dark ? 5 : 2) + Math.sin(t * 3.0) * 2
    }
  })

  return (
    <group>
      {/* ── Seafloor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0, oz - 35]}>
        <planeGeometry args={[75, 80]} />
        <meshStandardMaterial color={isDark ? '#020c10' : '#041828'} roughness={1} />
      </mesh>

      {/* ── Sand ripples ── */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={`sand-${i}`} rotation={[-Math.PI / 2, i * 0.3, 0]}
          position={[ox + (i - 7) * 5, 0.01, oz - 20 - i * 4]}>
          <planeGeometry args={[8, 1.5]} />
          <meshBasicMaterial color={isDark ? '#040c14' : '#062030'} transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ))}

      {/* ── God rays (light columns from above) ── */}
      {props.godRays.map((ray, i) => (
        <mesh key={`ray-${i}`}
          ref={el => { godRayRefs.current[i] = el }}
          position={ray.position}
          rotation={[0, (i * 0.4), 0.1 * (i % 3 - 1)]}
        >
          <planeGeometry args={[ray.width, ray.height]} />
          <meshBasicMaterial
            color={isDark ? '#0a3050' : '#1a6090'}
            transparent
            opacity={isDark ? 0.1 : 0.13}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ── Kelp forest ── */}
      {props.kelp.map((k, i) => (
        <Kelp key={`kelp-${i}`} position={k.position} height={k.height} isDarkRef={isDarkRef} />
      ))}

      {/* ── Coral formations ── */}
      {props.corals.map((c, i) => (
        <Coral key={`coral-${i}`} position={c.position} color={c.color} height={c.height} />
      ))}

      {/* ── Jellyfish ── */}
      {props.jellyfish.map((j, i) => (
        <Jellyfish
          key={`jelly-${i}`}
          position={j.position}
          color={j.color}
          charPosRef={charPosRef}
          isDarkRef={isDarkRef}
        />
      ))}

      {/* ── Bubble streams ── */}
      {props.glowVents.map((g, i) => (
        <GlowVent
          key={`glow-vent-${i}`}
          position={g.position}
          color={g.color}
          charPosRef={charPosRef}
          isDarkRef={isDarkRef}
        />
      ))}

      {props.bubbleStreams.map((stream, i) => (
        <group key={`bubbles-${i}`}
          ref={el => { bubbleRefs.current[i] = el }}
          position={[stream.x, 0, stream.z]}
        >
          {Array.from({ length: 8 }, (_, j) => (
            <mesh key={j} position={[
              (Math.random() - 0.5) * 0.4,
              j * 1.5,
              (Math.random() - 0.5) * 0.4,
            ]}>
              <sphereGeometry args={[0.04 + Math.random() * 0.06, 5, 4]} />
              <meshBasicMaterial color="#80c0ff" transparent opacity={0.3} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Anglerfish lure (dangling glowing orb) ── */}
      <group ref={anglerRef} position={[ox + 8, 4.5, oz - 38]}>
        {/* Dangling stalk */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.6, 4]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        {/* Lure ball */}
        <mesh>
          <sphereGeometry args={[0.28, 10, 8]} />
          <meshStandardMaterial color="#60ffaa" emissive="#40ff90" emissiveIntensity={8} roughness={0} />
        </mesh>
        <pointLight ref={anglerLightRef} color="#60ffaa" intensity={5} distance={18} decay={2} />
      </group>

      {/* ── Background rocks ── */}
      {props.bgRocks.map((r, i) => (
        <mesh key={`bgr-${i}`} position={r.position} scale={r.scale}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={isDark ? '#030a10' : '#041420'} roughness={1} flatShading />
        </mesh>
      ))}

      {/* ── Bioluminescent particle field ── */}
      <Sparkles
        count={isDark ? 110 : 55}
        scale={[52, 16, 68]}
        position={[ox, 6, oz - 35]}
        size={isDark ? 2.5 : 1.5}
        speed={0.06}
        color="#40c8ff"
        opacity={isDark ? 0.7 : 0.3}
      />
      <Sparkles
        count={36}
        scale={[40, 4, 55]}
        position={[ox, 1, oz - 35]}
        size={1.8}
        speed={0.12}
        color="#80ffaa"
        opacity={isDark ? 0.58 : 0.25}
      />

      {/* ── Volumetric water planes ── */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`water-${i}`} rotation={[-Math.PI / 2, 0, 0]}
          position={[ox + (i - 3) * 8, 0.5 + i * 1.5, oz - 25 - i * 5]}>
          <planeGeometry args={[60, 55]} />
          <meshBasicMaterial
            color={isDark ? '#020c18' : '#042030'}
            transparent
            opacity={0.06 - i * 0.008}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ── Scene lights ── */}
      <pointLight position={[ox, 8, oz - 20]} color="#1a8080" intensity={isDark ? 2.8 : 4} distance={40} />
      <pointLight position={[ox - 12, 3, oz - 40]} color="#204080" intensity={isDark ? 2.1 : 3} distance={30} />
      <pointLight position={[ox + 10, 5, oz - 55]} color="#102840" intensity={isDark ? 2.1 : 3} distance={35} />
    </group>
  )
}
