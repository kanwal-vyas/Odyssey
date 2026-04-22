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
function ObsidianSpire({ position, height, twist }) {
  return (
    <group position={position} rotation={[0, twist, 0]}>
      <mesh position={[0, height / 2, 0]} rotation={[0, 0, (Math.random() - 0.5) * 0.3]}>
        <coneGeometry args={[0.15 + height * 0.06, height, 5]} />
        <meshStandardMaterial color="#0a0508" roughness={0.05} metalness={0.9} flatShading />
      </mesh>
      {/* Dark emissive base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 0.4, 5]} />
        <meshStandardMaterial color="#150808" roughness={0.3} emissive="#300808" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Lava river segment
function LavaRiver({ position, width, length, rotation = 0 }) {
  const matRef = useRef()
  const phase  = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (matRef.current) {
      const t = clock.getElapsedTime()
      matRef.current.emissiveIntensity = 1.4 + Math.sin(t * 0.8 + phase.current) * 0.4
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, rotation]} position={position}>
      <planeGeometry args={[width, length, 4, 8]} />
      <meshStandardMaterial
        ref={matRef}
        color="#ff2200"
        emissive="#ff4400"
        emissiveIntensity={1.4}
        roughness={0.0}
        metalness={0.3}
      />
    </mesh>
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
    let target = dark ? 0 : 1

    if (dark && charPosRef?.current) {
      _charPos.copy(charPosRef.current)
      _objPos.set(...position)
      const dist = _charPos.distanceTo(_objPos)
      target = THREE.MathUtils.clamp(
        THREE.MathUtils.inverseLerp(EMBER_REVEAL_RADIUS, EMBER_FULL_RADIUS, dist), 0, 1)
    }

    proxRef.current = THREE.MathUtils.lerp(proxRef.current, target, 0.05)
    const p = proxRef.current
    const pulse = 0.82 + Math.sin(t * 2.6 + position[2] * 0.09) * 0.18

    if (matRef.current) matRef.current.opacity = dark ? THREE.MathUtils.lerp(0.04, 0.8, p) * pulse : 0.45
    if (haloRef.current) haloRef.current.opacity = dark ? p * 0.12 * pulse : 0.04
    if (lightRef.current) lightRef.current.intensity = dark ? p * 4.8 * pulse : 1.0
  })

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      <mesh>
        <planeGeometry args={[0.16, 3.2]} />
        <meshBasicMaterial ref={matRef} color="#ff4a10" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.4, 4.8]} />
        <meshBasicMaterial ref={haloRef} color="#ff2200" transparent opacity={0} depthWrite={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 1.1]} color="#ff3a10" intensity={0} distance={15} decay={2} />
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

    const emberVeins = Array.from({ length: 10 }, (_, i) => ({
      position: [ox + Math.sin(i * 1.4) * 1.1, 0.075, oz - 4 - i * 6.4],
      rotation: Math.sin(i * 2.1) * 0.16,
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
      mat.emissiveIntensity = 0.1 + Math.sin(t * 0.5 + i * 0.7) * 0.08
    })
  })

  return (
    <group>
      {/* ── Scorched ground ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0, emberCenterZ]}>
        <planeGeometry args={[80, emberDepth]} />
        <meshStandardMaterial color={isDark ? '#0a0402' : '#140804'} roughness={1} />
      </mesh>

      {/* ── Cracked ground pattern ── */}
      {Array.from({ length: 18 }, (_, i) => ({
        index: i,
        z: oz - 15 - i * 3.5,
      }))
        .filter((crack) => crack.z >= cliffEdgeZ + 2)
        .map((crack) => (
          <mesh key={`crack-${crack.index}`} rotation={[-Math.PI / 2, crack.index * 0.5, 0]}
            position={[ox + (crack.index - 9) * 4.5, 0.02, crack.z]}>
            <planeGeometry args={[0.08, 6 + Math.sin(crack.index) * 2]} />
            <meshBasicMaterial color="#ff2200" transparent opacity={0.4} depthWrite={false} />
          </mesh>
        ))}

      {/* ── Lava rivers ── */}
      {props.lavaRivers.map((r, i) => (
        <LavaRiver key={`lava-${i}`} {...r} />
      ))}

      {/* ── Lava glow from rivers ── */}
      {props.emberVeins.map((v, i) => (
        (!isLowQuality || i < 6) && (
        <EmberVein
          key={`ember-vein-${i}`}
          position={v.position}
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
        <ObsidianSpire key={`spire-${i}`} {...s} />
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
              <meshBasicMaterial color="#402020" transparent opacity={0.3} depthWrite={false} />
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
            color="#150808"
            roughness={0.85}
            emissive="#ff1100"
            emissiveIntensity={0.1}
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
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`haze-${i}`} rotation={[-Math.PI / 2, 0, 0]}
          position={[ox + (i - 2) * 8, 0.12, oz - 18 - i * 10]}>
          <planeGeometry args={[16, 14]} />
          <meshBasicMaterial color="#300808" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      ))}

      {/* ── Scene fill lights ── */}
      <pointLight position={[ox, 4, oz - 25]} color="#ff2200" intensity={isDark ? 6.2 : 3} distance={45} />
      <pointLight position={[ox - 10, 2, oz - 45]} color="#ff4400" intensity={isDark ? 4 : 1.5} distance={35} />
      <pointLight position={[ox + 12, 3, oz - 55]} color="#ff1100" intensity={isDark ? 4 : 1.5} distance={35} />
    </group>
  )
}
