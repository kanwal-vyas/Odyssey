import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   BiomeEmber — The Ember Wastes
   A volcanic hellscape:
   • Lava rivers (animated emissive planes with UV drift effect)
   • Geyser pillars that erupt periodically (particle bursts)
   • Obsidian rock formations (dark glassy spires)
   • Ash storm particles raining sideways
   • Fire columns at key points
   • Heat shimmer (proximity orange glow)
   • Cinder particles rising from lava
─────────────────────────────────────────────────────────────────*/

const _charPos = new THREE.Vector3()
const _objPos  = new THREE.Vector3()
const EMBER_REVEAL_RADIUS = 14
const EMBER_FULL_RADIUS = 4
const EMBER_GROWTH_REVEAL_RADIUS = 18
const EMBER_GROWTH_FULL_RADIUS = 5
const PATH_CLEAR_HALF_WIDTH = 1.9

const EMBER_GROWTH_LAYOUT = [
  { x: 0.0, z: 0.0, radius: 0.34, height: 2.8, rotX: 0.08, rotY: 0.00, rotZ: 0.00, color: '#ffb14f' },
  { x: 0.76, z: -1.3, radius: 0.24, height: 2.0, rotX: 0.14, rotY: 0.16, rotZ: 0.16, color: '#ff8a38' },
  { x: -0.78, z: -1.1, radius: 0.26, height: 2.2, rotX: 0.16, rotY: -0.18, rotZ: -0.14, color: '#ff7a2c' },
  { x: 0.58, z: 1.4, radius: 0.22, height: 1.8, rotX: -0.10, rotY: 0.10, rotZ: 0.12, color: '#ff6420' },
  { x: -0.52, z: 1.2, radius: 0.20, height: 1.6, rotX: -0.08, rotY: -0.12, rotZ: -0.12, color: '#ff6f24' },
]

const EMBER_GROWTH_POSITIONS = [
  { x: -3.1, z: -14 },
  { x: -3.4, z: -20 },
  { x: 3.0, z: -22 },
  { x: 3.3, z: -28 },
  { x: -3.6, z: -30 },
  { x: -2.9, z: -38 },
  { x: 3.1, z: -40 },
  { x: 3.6, z: -48 },
  { x: -3.5, z: -50 },
  { x: -3.2, z: -58 },
  { x: 3.4, z: -60 },
  { x: 2.8, z: -68 },
  { x: -3.0, z: -72 },
  { x: 3.2, z: -76 },
]

const EMBER_PATH_ACCENTS = [
  { x: -2.1, z: -14, rotation: 0.12, length: 3.8, width: 0.07 },
  { x: -2.2, z: -18, rotation: 0.18, length: 4.4, width: 0.08 },
  { x: 2.0, z: -20, rotation: -0.10, length: 3.4, width: 0.07 },
  { x: 2.1, z: -24, rotation: -0.16, length: 3.9, width: 0.08 },
  { x: -2.5, z: -28, rotation: 0.14, length: 3.5, width: 0.07 },
  { x: -2.4, z: -34, rotation: 0.12, length: 3.6, width: 0.07 },
  { x: 2.4, z: -36, rotation: -0.08, length: 3.1, width: 0.06 },
  { x: 2.5, z: -42, rotation: -0.14, length: 3.5, width: 0.07 },
  { x: -2.2, z: -46, rotation: 0.10, length: 3.2, width: 0.06 },
  { x: -2.1, z: -54, rotation: 0.16, length: 3.8, width: 0.07 },
  { x: 2.2, z: -56, rotation: -0.16, length: 3.6, width: 0.07 },
  { x: 2.3, z: -62, rotation: -0.10, length: 3.2, width: 0.07 },
  { x: -2.3, z: -66, rotation: 0.12, length: 3.0, width: 0.06 },
  { x: -2.0, z: -70, rotation: 0.08, length: 2.8, width: 0.06 },
  { x: 2.2, z: -72, rotation: -0.12, length: 2.9, width: 0.06 },
  { x: 2.0, z: -74, rotation: -0.06, length: 2.8, width: 0.06 },
]

let _seed3 = 131
const erng = () => {
  _seed3 = (_seed3 * 16807 + 0) % 2147483647
  return (_seed3 - 1) / 2147483646
}

// Geyser — erupts on a timer, shoots upward sparks
function Geyser({ position }) {
  const pillarRef   = useRef()
  const lightRef    = useRef()
  const phase       = useRef(Math.random() * 20)
  const ERUPT_EVERY = 8 + Math.random() * 6

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase.current
    const cycleT = t % ERUPT_EVERY
    const erupting = cycleT < 2.5

    if (pillarRef.current) {
      // Scale the eruption pillar
      const scaleY = erupting ? Math.min(1, cycleT / 0.4) * (1 - Math.max(0, cycleT - 1.8) / 0.7) : 0
      pillarRef.current.scale.y = Math.max(0.001, scaleY)
      pillarRef.current.visible = scaleY > 0.01
    }

    if (lightRef.current) {
      lightRef.current.intensity = erupting
        ? 6 + Math.sin(t * 12) * 2
        : 0.5 + Math.sin(t * 2) * 0.3
    }
  })

  return (
    <group position={position}>
      {/* Vent base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 0.3, 8]} />
        <meshStandardMaterial color="#1a0808" roughness={0.9} />
      </mesh>
      {/* Steam/fire pillar — scale animated */}
      <mesh ref={pillarRef} position={[0, 3, 0]} visible={false}>
        <cylinderGeometry args={[0.15, 0.35, 6, 6]} />
        <meshBasicMaterial color="#ff6020" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 1, 0]} color="#ff4010" intensity={0.5} distance={14} decay={2} />
    </group>
  )
}

// Obsidian spire
function ObsidianSpire({ position, height, twist, isDark }) {
  return (
    <group position={position} rotation={[0, twist, 0]}>
      <mesh position={[0, height / 2, 0]} rotation={[0, 0, (Math.random() - 0.5) * 0.3]}>
        <coneGeometry args={[0.15 + height * 0.06, height, 5]} />
        <meshStandardMaterial
          color={isDark ? '#26151b' : '#0a0508'}
          roughness={0.08}
          metalness={0.88}
          emissive={isDark ? '#ff6420' : '#080203'}
          emissiveIntensity={isDark ? 0.18 : 0}
          flatShading
        />
      </mesh>
      {/* Dark emissive base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 0.4, 5]} />
        <meshStandardMaterial
          color={isDark ? '#28100d' : '#150808'}
          roughness={0.28}
          emissive={isDark ? '#ff6220' : '#300808'}
          emissiveIntensity={isDark ? 0.75 : 0.3}
        />
      </mesh>
      {isDark && (
        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.9, 18]} />
          <meshBasicMaterial
            color="#ff7a2c"
            transparent
            opacity={0.22}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}

// Lava river segment
function LavaRiver({ position, width, length, rotation = 0, isDark }) {
  const matRef = useRef()
  const glowRef = useRef()
  const phase  = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime()
      const pulse = Math.sin(t * 0.8 + phase.current)
      matRef.current.emissiveIntensity = (isDark ? 2.5 : 1.4) + pulse * (isDark ? 0.65 : 0.4)
      if (glowRef.current) {
        glowRef.current.opacity = (isDark ? 0.34 : 0.16) + pulse * 0.06
      }
    }
  })

  return (
    <group rotation={[-Math.PI / 2, 0, rotation]} position={position}>
      <mesh>
        <planeGeometry args={[width, length, 4, 8]} />
        <meshStandardMaterial
          ref={matRef}
          color={isDark ? '#ff6a1f' : '#ff2200'}
          emissive="#ff4400"
          emissiveIntensity={isDark ? 2.5 : 1.4}
          roughness={0.0}
          metalness={0.3}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[width * (isDark ? 2.1 : 1.5), length * 1.08]} />
        <meshBasicMaterial
          ref={glowRef}
          color={isDark ? '#ff6f24' : '#ff4a12'}
          transparent
          opacity={isDark ? 0.34 : 0.16}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function EmberVein({ position, rotation, charPosRef, isDarkRef }) {
  const matRef = useRef()
  const haloRef = useRef()
  const lightRef = useRef()
  const proxRef = useRef(0)

  useFrame(({ clock }) => {
    const dark = isDarkRef.current
    const t = clock.getElapsedTime()
    let target = dark ? 0.18 : 1

    if (dark && charPosRef?.current) {
      _charPos.copy(charPosRef.current)
      _objPos.set(...position)
      const dist = _charPos.distanceTo(_objPos)
      target = THREE.MathUtils.lerp(
        0.18,
        1,
        THREE.MathUtils.clamp(
          THREE.MathUtils.inverseLerp(EMBER_REVEAL_RADIUS, EMBER_FULL_RADIUS, dist), 0, 1,
        ),
      )
    }

    proxRef.current = THREE.MathUtils.lerp(proxRef.current, target, 0.05)
    const p = proxRef.current
    const pulse = 0.82 + Math.sin(t * 2.6 + position[2] * 0.09) * 0.18

    if (matRef.current) matRef.current.opacity = dark ? THREE.MathUtils.lerp(0.16, 0.92, p) * pulse : 0.45
    if (haloRef.current) haloRef.current.opacity = dark ? THREE.MathUtils.lerp(0.06, 0.2, p) * pulse : 0.04
    if (lightRef.current) lightRef.current.intensity = dark ? THREE.MathUtils.lerp(1.2, 6.2, p) * pulse : 1.0
  })

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      <mesh>
        <planeGeometry args={[0.16, 3.2]} />
        <meshBasicMaterial
          ref={matRef}
          color="#ff7b30"
          transparent
          opacity={0.16}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.4, 4.8]} />
        <meshBasicMaterial
          ref={haloRef}
          color="#ff5a18"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 1.1]} color="#ff3a10" intensity={0} distance={15} decay={2} />
    </group>
  )
}

function EmberGrowthCluster({ position, charPosRef, isDarkRef }) {
  const groupRef = useRef()
  const spikeRefs = useRef([])
  const lightRef = useRef()
  const proxRef = useRef(isDarkRef.current ? 0.34 : 1)

  useFrame(({ clock }) => {
    const dark = isDarkRef.current
    const t = clock.getElapsedTime()
    let target = dark ? 0.34 : 1

    if (dark && charPosRef?.current) {
      _charPos.copy(charPosRef.current)
      _objPos.set(...position)
      const dist = _charPos.distanceTo(_objPos)
      target = THREE.MathUtils.lerp(
        0.34,
        1,
        THREE.MathUtils.clamp(
          THREE.MathUtils.inverseLerp(EMBER_GROWTH_REVEAL_RADIUS, EMBER_GROWTH_FULL_RADIUS, dist), 0, 1,
        ),
      )
    }

    proxRef.current = THREE.MathUtils.lerp(proxRef.current, target, 0.06)
    const growth = proxRef.current
    const pulse = 0.94 + Math.sin(t * 2.1 + position[2] * 0.025) * 0.06

    if (groupRef.current) {
      groupRef.current.position.y = 0.02 + Math.sin(t * 1.2 + position[2] * 0.015) * 0.05
    }

    spikeRefs.current.forEach((spike, i) => {
      if (!spike) return
      const wave = 0.92 + Math.sin(t * 2.8 + i * 0.85) * 0.12
      const width = THREE.MathUtils.lerp(0.55, 1.18 + i * 0.06, growth) * wave
      const height = THREE.MathUtils.lerp(0.32, 1.42 + i * 0.08, growth) * wave
      spike.scale.set(width, height, width)
    })

    if (lightRef.current) {
      lightRef.current.intensity = THREE.MathUtils.lerp(1.4, 6.8, growth) * pulse
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.5, 0.72, 0.24, 7]} />
        <meshStandardMaterial
          color="#1c0906"
          roughness={0.92}
          emissive={isDarkRef.current ? '#501607' : '#140606'}
          emissiveIntensity={isDarkRef.current ? 0.42 : 0.1}
        />
      </mesh>

      {EMBER_GROWTH_LAYOUT.map((item, i) => (
        <group
          key={`growth-spike-${i}`}
          ref={(el) => { spikeRefs.current[i] = el }}
          position={[item.x, 0.12, item.z]}
          rotation={[item.rotX, item.rotY, item.rotZ]}
        >
          <mesh position={[0, item.height / 2, 0]}>
            <coneGeometry args={[item.radius, item.height, 6]} />
            <meshStandardMaterial
              color={item.color}
              emissive={item.color}
              emissiveIntensity={isDarkRef.current ? 2.1 : 0.8}
              roughness={0.22}
              metalness={0.08}
            />
          </mesh>
          <mesh position={[0, item.height * 0.62, 0]}>
            <sphereGeometry args={[item.radius * 0.7, 8, 7]} />
            <meshBasicMaterial
              color={item.color}
              transparent
              opacity={isDarkRef.current ? 0.3 : 0.18}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <pointLight
        ref={lightRef}
        position={[0, 1.8, 0]}
        color="#ff7a2c"
        intensity={0}
        distance={20}
        decay={2}
      />
    </group>
  )
}

export default function BiomeEmber({
  origin,
  isDark = true,
  charPosRef,
  cliffEdgeZ = -356,
  quality = 'medium',
}) {
  const ox = origin?.x ?? 0
  const oz = origin?.z ?? -440
  const isLowQuality = quality === 'low'
  const isMediumQuality = quality === 'medium'
  const emberStartZ = oz + 5
  const emberEndZ = cliffEdgeZ
  const emberDepth = Math.max(12, emberStartZ - emberEndZ)
  const emberCenterZ = (emberStartZ + emberEndZ) / 2

  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const rockMatRefs = useRef([])
  const ashRefs     = useRef([])

  const props = useMemo(() => {
    _seed3 = 131

    const geysers = [
      { position: [ox - 18, 0, oz - 14] },
      { position: [ox - 22, 0, oz - 24] },
      { position: [ox - 20, 0, oz - 36] },
      { position: [ox - 24, 0, oz - 48] },
      { position: [ox + 15, 0, oz - 18] },
      { position: [ox + 18, 0, oz - 30] },
      { position: [ox + 20, 0, oz - 44] },
      { position: [ox + 17, 0, oz - 57] },
    ]

    const spires = Array.from({ length: 28 }, () => ({
      position: [
        ox + (erng() > 0.5 ? 1 : -1) * (9 + erng() * 16),
        0,
        oz - 5 - erng() * 58,
      ],
      height: 1.0 + erng() * 5.0,
      twist: erng() * Math.PI,
    }))

    const lavaRivers = [
      { position: [ox - 16, 0.04, oz - 26], width: 4.4, length: 34, rotation: -0.28 },
      { position: [ox - 14, 0.04, oz - 48], width: 2.8, length: 22, rotation: -0.12 },
      { position: [ox + 13, 0.04, oz - 22], width: 2.2, length: 12, rotation: 0.34 },
      { position: [ox + 18, 0.04, oz - 46], width: 2.0, length: 18, rotation: 0.18 },
    ]

    const ashStreams = Array.from({ length: 12 }, (_, i) => ({
      position: [ox + (i - 6) * 5, 4 + erng() * 6, oz - 15 - i * 4],
    }))

    const bgBoulders = Array.from({ length: 15 }, () => ({
      position: [ox + (erng() - 0.5) * 52, erng() * 2, oz - 58 - erng() * 15],
      scale: 2 + erng() * 5,
    }))

    // Fire columns at dramatic points
    const fireColumns = [
      { position: [ox - 19, 0, oz - 18] },
      { position: [ox + 17, 0, oz - 35] },
      { position: [ox - 15, 0, oz - 52] },
      { position: [ox + 15, 0, oz - 62] },
    ]

    const emberVeins = EMBER_PATH_ACCENTS.map((accent) => ({
      position: [ox + accent.x, 0.075, oz + accent.z],
      rotation: accent.rotation,
    }))

    const pathCracks = EMBER_PATH_ACCENTS.map((accent, index) => ({
      index,
      position: [ox + accent.x, 0.02, oz + accent.z],
      rotation: accent.rotation,
      width: accent.width,
      length: accent.length,
    }))

    const growthClusters = EMBER_GROWTH_POSITIONS.map((cluster, index) => ({
      index,
      position: [ox + cluster.x, 0, oz + cluster.z],
    }))

    const trimmedRivers = lavaRivers
      .filter((r) => r.position[2] >= cliffEdgeZ + 8)
      .map((r) => {
        const safeBackZ = cliffEdgeZ + 4
        const maxLength = Math.max(6, (r.position[2] - safeBackZ) * 2)
        return { ...r, length: Math.min(r.length, maxLength) }
      })

    return {
      geysers: geysers.filter((g) => g.position[2] >= cliffEdgeZ + 6),
      spires: spires.filter((s) => s.position[2] >= cliffEdgeZ + 4),
      lavaRivers: trimmedRivers,
      ashStreams: ashStreams.filter((a) => a.position[2] >= cliffEdgeZ + 6),
      bgBoulders: bgBoulders.filter((b) => b.position[2] >= cliffEdgeZ + 6),
      fireColumns: fireColumns.filter((f) => f.position[2] >= cliffEdgeZ + 6),
      emberVeins: emberVeins.filter((v) => v.position[2] >= cliffEdgeZ + 3),
      pathCracks: pathCracks.filter((crack) => crack.position[2] >= cliffEdgeZ + 2),
      growthClusters: growthClusters.filter((cluster) => cluster.position[2] >= cliffEdgeZ + 4),
    }
  }, [cliffEdgeZ, ox, oz])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // ── Ash particle drift ────────────────────────────────────────
    ashRefs.current.forEach((group) => {
      if (!group) return
      group.children.forEach((particle, j) => {
        particle.position.x += 0.015
        particle.position.y += Math.sin(t * 0.5 + j) * 0.003 - 0.005
        if (particle.position.x > 8) particle.position.x = -8
        if (particle.position.y < -2) particle.position.y = 3 + Math.random() * 3
      })
    })

    // ── Rock emissive pulse ───────────────────────────────────────
    rockMatRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.emissiveIntensity = (isDark ? 0.24 : 0.1) + Math.sin(t * 0.5 + i * 0.7) * (isDark ? 0.12 : 0.08)
    })
  })

  return (
    <group>
      {/* ── Scorched ground ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0, emberCenterZ]}>
        <planeGeometry args={[80, emberDepth]} />
        <meshStandardMaterial
          color={isDark ? '#1a0804' : '#140804'}
          roughness={1}
        />
      </mesh>

      {props.growthClusters.map((cluster, i) => (
        (!isLowQuality || i < 8) && (!isMediumQuality || i < 12) && (
        <EmberGrowthCluster
          key={`growth-cluster-${cluster.index}`}
          position={cluster.position}
          charPosRef={charPosRef}
          isDarkRef={isDarkRef}
        />
        )
      ))}

      {/* ── Cracked ground pattern ── */}
      {props.pathCracks.map((crack, i) => (
        (!isLowQuality || i < 10) && (!isMediumQuality || i < 14) && (
        <mesh
          key={`crack-${crack.index}`}
          rotation={[-Math.PI / 2, crack.rotation, 0]}
          position={crack.position}
        >
          <planeGeometry args={[crack.width, crack.length]} />
          <meshBasicMaterial
            color={isDark ? '#ff7a2b' : '#ff2200'}
            transparent
            opacity={isDark ? 0.72 : 0.4}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        )
      ))}

      {/* ── Lava rivers ── */}
      {props.lavaRivers.map((r, i) => (
        <LavaRiver key={`lava-${i}`} {...r} isDark={isDark} />
      ))}

      {/* ── Lava glow from rivers ── */}
      {props.emberVeins.map((v, i) => (
        (!isLowQuality || i < 10) && (!isMediumQuality || i < 14) && (
        <EmberVein
          key={`ember-vein-${i}`}
          position={[
            v.position[0] < ox
              ? Math.min(v.position[0], ox - PATH_CLEAR_HALF_WIDTH)
              : Math.max(v.position[0], ox + PATH_CLEAR_HALF_WIDTH),
            v.position[1],
            v.position[2],
          ]}
          rotation={v.rotation}
          charPosRef={charPosRef}
          isDarkRef={isDarkRef}
        />
        )
      ))}

      {props.lavaRivers.map((r, i) => (
        (!isLowQuality || i < 3) && (
        <pointLight key={`lavaglow-${i}`}
          position={[r.position[0], 0.5, r.position[2]]}
          color="#ff3300"
          intensity={isDark ? 5 : 2}
          distance={16}
          decay={2}
        />
        )
      ))}

      {/* ── Obsidian spires ── */}
      {props.spires.map((s, i) => (
        (!isLowQuality || i < 16) && (!isMediumQuality || i < 22) && (
        <ObsidianSpire key={`spire-${i}`} {...s} isDark={isDark} />
        )
      ))}

      {/* ── Geysers ── */}
      {props.geysers.map((g, i) => (
        (!isLowQuality || i < 4) && (!isMediumQuality || i < 6) && (
        <Geyser key={`geyser-${i}`} position={g.position} />
        )
      ))}

      {/* ── Fire columns ── */}
      {props.fireColumns.map((fc, i) => (
        (!isLowQuality || i < 2) && (
        <group key={`fire-${i}`} position={fc.position}>
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[0, j * 1.2 + 0.5, 0]}>
              <sphereGeometry args={[0.25 - j * 0.04, 6, 5]} />
              <meshBasicMaterial
                color={['#ff2200','#ff5500','#ff8800','#ffaa00'][j]}
                transparent
                opacity={0.7 - j * 0.15}
                depthWrite={false}
              />
            </mesh>
          ))}
          <pointLight color="#ff4400" intensity={isDark ? 6.5 : 2} distance={20} decay={2} />
        </group>
        )
      ))}

      {/* ── Ash particles (sideways drift) ── */}
      {props.ashStreams.map((ash, i) => (
        (!isLowQuality || i < 6) && (!isMediumQuality || i < 9) && (
        <group key={`ash-${i}`} ref={el => { ashRefs.current[i] = el }} position={ash.position}>
          {Array.from({ length: isLowQuality ? 6 : isMediumQuality ? 8 : 12 }, (_, j) => (
            <mesh key={j} position={[(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3]}>
              <sphereGeometry args={[0.03 + Math.random() * 0.05, 4, 3]} />
              <meshBasicMaterial
                color={isDark ? '#ff9a63' : '#402020'}
                transparent
                opacity={isDark ? 0.44 : 0.3}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
        )
      ))}

      {/* ── Background boulders ── */}
      {props.bgBoulders.map((b, i) => (
        (!isLowQuality || i < 9) && (
        <mesh key={`boulder-${i}`} position={b.position} scale={b.scale}>
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial
            ref={el => { rockMatRefs.current[i] = el }}
            color={isDark ? '#2c110b' : '#150808'}
            roughness={0.85}
            emissive="#ff1100"
            emissiveIntensity={isDark ? 0.24 : 0.1}
            flatShading
          />
        </mesh>
        )
      ))}

      {/* ── Ember/cinder sparkles rising ── */}
      <Sparkles
        count={isLowQuality ? (isDark ? 44 : 24) : isMediumQuality ? (isDark ? 78 : 40) : (isDark ? 120 : 60)}
        scale={[48, 14, Math.max(18, emberDepth)]}
        position={[ox, 4, emberCenterZ]}
        size={isDark ? 3 : 2}
        speed={0.3}
        color="#ff6020"
        opacity={isDark ? 0.88 : 0.5}
      />
      <Sparkles
        count={isLowQuality ? 18 : isMediumQuality ? 28 : 45}
        scale={[30, 4, Math.max(16, emberDepth - 4)]}
        position={[ox, 0.5, emberCenterZ]}
        size={1.5}
        speed={0.5}
        color="#ff2200"
        opacity={0.6}
      />

      {/* ── Volcano silhouette in background ── */}
      <mesh position={[ox - 27, 2.4, cliffEdgeZ - 8]}>
        <coneGeometry args={[24, 16, 10]} />
        <meshStandardMaterial color={isDark ? '#160909' : '#2b140d'} roughness={1} flatShading />
      </mesh>
      <mesh position={[ox - 27, 11.2, cliffEdgeZ - 10]}>
        <coneGeometry args={[13.5, 30, 10]} />
        <meshStandardMaterial color={isDark ? '#0b0303' : '#160706'} roughness={1} flatShading />
      </mesh>
      <mesh position={[ox - 27, 24.5, cliffEdgeZ - 10]}>
        <cylinderGeometry args={[4.6, 6.4, 2.8, 10, 1, true]} />
        <meshStandardMaterial color={isDark ? '#170808' : '#31170d'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[ox - 27, 23.3, cliffEdgeZ - 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.6, 18]} />
        <meshBasicMaterial color="#ff6a1f" transparent opacity={isDark ? 0.58 : 0.34} depthWrite={false} />
      </mesh>
      <mesh position={[ox - 23.5, 10.4, cliffEdgeZ + 2]} rotation={[0.14, 0.08, 0.4]}>
        <planeGeometry args={[3.4, 18]} />
        <meshBasicMaterial color="#ff6b24" transparent opacity={isDark ? 0.8 : 0.48} depthWrite={false} />
      </mesh>
      <mesh position={[ox - 25.5, 7.8, cliffEdgeZ + 6]} rotation={[0.18, -0.02, -0.18]}>
        <planeGeometry args={[2.1, 12]} />
        <meshBasicMaterial color="#ffb14f" transparent opacity={isDark ? 0.48 : 0.28} depthWrite={false} />
      </mesh>
      <mesh position={[ox - 30.2, 11.8, cliffEdgeZ - 1]} rotation={[0.12, -0.04, -0.3]}>
        <planeGeometry args={[2.8, 15]} />
        <meshBasicMaterial color="#ff8c34" transparent opacity={isDark ? 0.48 : 0.26} depthWrite={false} />
      </mesh>
      {/* Crater glow */}
      <pointLight position={[ox - 27, 27, cliffEdgeZ - 10]} color="#ff5a14" intensity={isDark ? 10 : 3} distance={60} decay={1} />

      {/* ── Sky haze planes ── */}

      {/* ── Scene fill lights ── */}
      <pointLight position={[ox, 4, oz - 25]} color="#ff2200" intensity={isDark ? 8.5 : 3} distance={54} />
      <pointLight position={[ox - 10, 2, oz - 45]} color="#ff6a24" intensity={isDark ? 5.6 : 1.5} distance={42} />
      <pointLight position={[ox + 12, 3, oz - 55]} color="#ff3a14" intensity={isDark ? 5.4 : 1.5} distance={42} />
      {isDark && (
        <>
          <pointLight position={[ox, 8, emberCenterZ]} color="#ff8e42" intensity={2.6} distance={72} decay={2} />
          <pointLight position={[ox - 20, 6, cliffEdgeZ - 4]} color="#ffb36d" intensity={2.2} distance={60} decay={2} />
        </>
      )}
    </group>
  )
}
