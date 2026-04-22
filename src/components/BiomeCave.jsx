import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const CEILING_H = 18
const GLOW_RADIUS = 12
const FULL_RADIUS = 3.5

const _charPos = new THREE.Vector3()
const _crystPos = new THREE.Vector3()

export default function BiomeCave({ origin, isDark = true, charPosRef }) {
  const ox = origin?.x ?? 0
  const oz = origin?.z ?? -110

  const isDarkRef = useRef(isDark)
  isDarkRef.current = isDark

  const gcMatRefs = useRef([])
  const ccMatRefs = useRef([])
  const gcProx = useRef([])
  const ccProx = useRef([])

  const props = useMemo(() => {
    const palette = [
      '#4a88b0', '#78a8cc', '#88a890', '#304868',
      '#90c0e8', '#608878', '#a060c0', '#6080d0',
      '#50a0c8', '#3860a0', '#70b0d0', '#8840b0',
    ]
    const darkPalette = [
      '#1a3048', '#283848', '#283830', '#101828',
      '#304858', '#203028', '#3a2048', '#202838',
      '#1c3848', '#142038', '#283848', '#301840',
    ]

    let seed = 42
    const rng = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    // Bias most crystals toward the center walkable corridor so the added
    // density actually reads from the player camera instead of hiding at the edges.
    const groundCrystals = Array.from({ length: 128 }, () => {
      const xOffset = rng() < 0.76
        ? (rng() - 0.5) * 14
        : (rng() - 0.5) * 30
      const zOffset = rng() < 0.72
        ? 12 + rng() * 30
        : 4 + rng() * 56
      return {
        position: [ox + xOffset, 0, oz - zOffset],
        h: 0.48 + rng() * 3.6,
        r: 0.05 + rng() * 0.18,
        color: palette[Math.floor(rng() * palette.length)],
        darkColor: darkPalette[Math.floor(rng() * darkPalette.length)],
        baseEmissInt: 0.84 + rng() * 0.95,
        rx: (rng() - 0.5) * 0.45,
        rz: (rng() - 0.5) * 0.45,
      }
    })

    const ceilCrystals = Array.from({ length: 24 }, () => ({
      position: [ox + (rng() - 0.5) * 34, 0, oz - 4 - rng() * 52],
      h: 0.6 + rng() * 4.5,
      r: 0.05 + rng() * 0.2,
      color: palette[Math.floor(rng() * palette.length)],
      darkColor: darkPalette[Math.floor(rng() * darkPalette.length)],
      baseEmissInt: 0.4 + rng() * 0.5,
      rx: (rng() - 0.5) * 0.3,
      rz: (rng() - 0.5) * 0.3,
    }))

    const bgRocks = Array.from({ length: 10 }, (_, i) => ({
      x: ox + (i - 5) * 7,
      z: oz - 58 - rng() * 8,
      w: 6 + rng() * 5,
      h: 12 + rng() * 6,
    }))

    const clusterLights = [
      { pos: [ox + 8, 3, oz - 20], color: '#4a88b0' },
      { pos: [ox - 10, 2, oz - 35], color: '#88a890' },
      { pos: [ox + 5, 2, oz - 50], color: '#a060c0' },
      { pos: [ox - 6, 3, oz - 15], color: '#6080d0' },
      { pos: [ox + 12, 1.5, oz - 42], color: '#78a8cc' },
      { pos: [ox, 5, oz - 28], color: '#4a88b0' },
      { pos: [ox - 12, CEILING_H - 2.8, oz - 16], color: '#78c8ff' },
      { pos: [ox + 10, CEILING_H - 3.2, oz - 32], color: '#a080ff' },
      { pos: [ox, CEILING_H - 2.5, oz - 49], color: '#80ffd8' },
    ]

    return { groundCrystals, ceilCrystals, bgRocks, clusterLights }
  }, [ox, oz])

  useMemo(() => {
    gcProx.current = props.groundCrystals.map(() => (isDark ? 0 : 1))
    ccProx.current = props.ceilCrystals.map(() => (isDark ? 0 : 1))
  }, [props, isDark])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const dark = isDarkRef.current

    if (!charPosRef?.current) return
    _charPos.copy(charPosRef.current)

    props.groundCrystals.forEach((c, i) => {
      const mat = gcMatRefs.current[i]
      if (!mat) return

      _crystPos.set(c.position[0], c.h / 2, c.position[2])
      const dist = _charPos.distanceTo(_crystPos)
      const target = dark
        ? THREE.MathUtils.clamp(THREE.MathUtils.inverseLerp(GLOW_RADIUS, FULL_RADIUS, dist), 0.2, 1)
        : 1
      gcProx.current[i] = THREE.MathUtils.lerp(gcProx.current[i] ?? (dark ? 0 : 1), target, 0.055)
      const p = gcProx.current[i]

      if (dark) {
        mat.emissiveIntensity = p * 4.1 + Math.sin(t * 1.8 + c.position[0] * 3.7) * 0.28 * p
        mat.opacity = THREE.MathUtils.lerp(0.12, 0.98, p)
      } else {
        mat.emissiveIntensity = c.baseEmissInt * 1.15
        mat.opacity = 0.92
      }
    })

    props.ceilCrystals.forEach((c, i) => {
      const mat = ccMatRefs.current[i]
      if (!mat) return

      _crystPos.set(c.position[0], CEILING_H - c.h / 2, c.position[2])
      const dist = _charPos.distanceTo(_crystPos)
      const target = dark
        ? THREE.MathUtils.clamp(THREE.MathUtils.inverseLerp(GLOW_RADIUS, FULL_RADIUS, dist), 0, 1)
        : 1
      ccProx.current[i] = THREE.MathUtils.lerp(ccProx.current[i] ?? (dark ? 0 : 1), target, 0.055)
      const p = ccProx.current[i]

      if (dark) {
        mat.emissiveIntensity = p * 3.8 + Math.sin(t * 1.8 + c.position[0] * 3.7) * 0.24 * p
        mat.opacity = THREE.MathUtils.lerp(0.22, 0.94, p)
      } else {
        mat.emissiveIntensity = c.baseEmissInt * 1.08
        mat.opacity = 0.84
      }
    })
  })

  return (
    <group>
      {props.groundCrystals.map((c, i) => (
        <mesh
          key={`gc-${i}`}
          position={[c.position[0], c.h / 2, c.position[2]]}
          rotation={[c.rx, 0, c.rz]}
        >
          <coneGeometry args={[c.r, c.h, 6]} />
          <meshStandardMaterial
            ref={(el) => { gcMatRefs.current[i] = el }}
            color={isDark ? c.darkColor : c.color}
            emissive={isDark ? c.darkColor : c.color}
            emissiveIntensity={isDark ? 1.5 : c.baseEmissInt * 1.15}
            roughness={0.05}
            metalness={0.5}
            transparent
            opacity={isDark ? 0.12 : 0.92}
          />
        </mesh>
      ))}

      {props.ceilCrystals.map((c, i) => (
        <mesh
          key={`cc-${i}`}
          position={[c.position[0], CEILING_H - c.h / 2, c.position[2]]}
          rotation={[Math.PI + c.rx, 0, c.rz]}
        >
          <coneGeometry args={[c.r * 0.7, c.h, 6]} />
          <meshStandardMaterial
            ref={(el) => { ccMatRefs.current[i] = el }}
            color={isDark ? c.darkColor : c.color}
            emissive={isDark ? c.darkColor : c.color}
            emissiveIntensity={isDark ? 0.7 : c.baseEmissInt * 1.08}
            roughness={0.05}
            metalness={0.5}
            transparent
            opacity={isDark ? 0.22 : 0.84}
          />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[ox, CEILING_H, oz - 30]}>
        <planeGeometry args={[48, 68]} />
        <meshStandardMaterial
          color={isDark ? '#071326' : '#081426'}
          roughness={1}
          emissive={isDark ? '#081a30' : '#000000'}
          emissiveIntensity={isDark ? 0.45 : 0}
        />
      </mesh>

      {props.bgRocks.map((_, i) => {
        const bx = ox + ((i * 73 + 17) % 100 - 50) * 0.36
        const bz = oz - 5 - ((i * 37 + 11) % 100) * 0.6
        const br = 1.8 + ((i * 53 + 7) % 100) * 0.025
        return (
          <mesh key={`cm-${i}`} position={[bx, CEILING_H - 0.8, bz]}>
            <sphereGeometry args={[br, 6, 5]} />
            <meshStandardMaterial
              color={isDark ? '#07101d' : '#04080e'}
              roughness={0.98}
              emissive={isDark ? '#061528' : '#000000'}
              emissiveIntensity={isDark ? 0.25 : 0}
            />
          </mesh>
        )
      })}

      {Array.from({ length: 12 }, (_, i) => {
        const idx = i + 10
        const bx = ox + ((idx * 73 + 17) % 100 - 50) * 0.36
        const bz = oz - 5 - ((idx * 37 + 11) % 100) * 0.6
        const br = 1.8 + ((idx * 53 + 7) % 100) * 0.025
        return (
          <mesh key={`cm2-${i}`} position={[bx, CEILING_H - 0.8, bz]}>
            <sphereGeometry args={[br, 6, 5]} />
            <meshStandardMaterial
              color={isDark ? '#07101d' : '#04080e'}
              roughness={0.98}
              emissive={isDark ? '#061528' : '#000000'}
              emissiveIntensity={isDark ? 0.25 : 0}
            />
          </mesh>
        )
      })}

      <mesh position={[ox - 19, CEILING_H / 2, oz - 30]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[3, CEILING_H, 72]} />
        <meshStandardMaterial color="#060c14" roughness={1} />
      </mesh>
      <mesh position={[ox + 19, CEILING_H / 2, oz - 30]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[3, CEILING_H, 72]} />
        <meshStandardMaterial color="#060c14" roughness={1} />
      </mesh>

      {props.bgRocks
        .filter((r) => Math.abs(r.x - ox) > 12)
        .map((r, i) => (
          <mesh
            key={`br-${i}`}
            position={[
              r.x + Math.sign(r.x - ox) * 4,
              r.h / 2 - 1,
              r.z,
            ]}
          >
            <boxGeometry args={[Math.max(4, r.w - 2.5), r.h, 2]} />
            <meshStandardMaterial color="#04080e" roughness={1} />
          </mesh>
        ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox, 0.05, oz - 28]} scale={[1, 4 / 6.5, 1]}>
        <circleGeometry args={[6.5, 24]} />
        <meshStandardMaterial color="#0e2040" roughness={0} metalness={0.95} transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ox + 8, 0.05, oz - 50]} scale={[1, 2.5 / 3.5, 1]}>
        <circleGeometry args={[3.5, 18]} />
        <meshStandardMaterial color="#1a1040" roughness={0} metalness={0.9} transparent opacity={0.8} />
      </mesh>

      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`mist-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[ox + (i - 2) * 6, 0.15, oz - 20 - i * 8]}
        >
          <planeGeometry args={[14, 12]} />
          <meshBasicMaterial color="#1a3050" transparent opacity={0.06} depthWrite={false} />
        </mesh>
      ))}

      {props.clusterLights.map((l, i) => (
        <pointLight
          key={`cl-${i}`}
          position={l.pos}
          intensity={isDark ? 2.6 : 4}
          color={l.color}
          distance={32}
        />
      ))}
      <pointLight
        position={[ox, 6, oz - 30]}
        intensity={isDark ? 4.8 : 8}
        color="#3a6888"
        distance={55}
      />

      <Sparkles
        count={isDark ? 60 : 150}
        scale={[34, CEILING_H * 0.7, 60]}
        position={[ox, CEILING_H * 0.4, oz - 30]}
        size={3.5}
        speed={0.06}
        color="#60a8d0"
        opacity={isDark ? 0.52 : 0.9}
      />
      <Sparkles
        count={isDark ? 25 : 60}
        scale={[20, 4, 50]}
        position={[ox, 1, oz - 30]}
        size={2}
        speed={0.12}
        color="#a060c0"
        opacity={isDark ? 0.42 : 0.7}
      />
    </group>
  )
}
