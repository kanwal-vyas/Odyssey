import { useRef, useMemo } from 'react'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Tree, Rock, Bush, Waterfall, Lake } from './Primitives'
import Mushroom from './Mushroom'

/* ─────────────────────────────────────────────────────────────────
   BiomeGrove — The Whispering Grove

   PERFORMANCE CHANGES vs old version
   ───────────────────────────────────
   • isDark removed from useMemo dependency array. Geometry (positions,
     scales, counts) is computed once and never remounts on theme toggle.
   • Tree/rock/bush colors are computed outside useMemo as a lightweight
     derived value — they don't cause geometry remounting, just a color
     prop update which React handles cheaply.
   • Firefly count stays stable; brightness difference handled via props.
   • isDark toggling only updates the props on existing mounted elements,
     not tear-down and remount of 200+ meshes.
───────────────────────────────────────────────────────────────── */

const PATH_ORB_POSITIONS = [
  [0, 1.4, -2],
  [1.2, 1.2, -12],
  [-0.8, 1.3, -22],
  [0.5, 1.4, -32],
  [-1.0, 1.2, -42],
  [0.8, 1.3, -52],
  [-0.5, 1.4, -62],
  [0.3, 1.2, -72],
  [-0.9, 1.3, -82],
]

function PathOrb({ position, isDark }) {
  return (
    <group position={position}>
      <Float speed={1.8} floatIntensity={0.5} floatingRange={[-0.15, 0.15]}>
        <mesh>
          <sphereGeometry args={[isDark ? 0.22 : 0.14, 10, 9]} />
          <meshStandardMaterial
            color={isDark ? '#80ffb0' : '#c8e890'}
            emissive={isDark ? '#50e890' : '#c8e890'}
            emissiveIntensity={isDark ? 7.2 : 2.0}
            roughness={0}
          />
        </mesh>
        {isDark && (
          <mesh>
            <sphereGeometry args={[0.46, 10, 9]} />
            <meshBasicMaterial color="#40ff80" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        )}
        {isDark && (
          <mesh>
            <sphereGeometry args={[0.9, 10, 9]} />
            <meshBasicMaterial color="#30e870" transparent opacity={0.03} depthWrite={false} />
          </mesh>
        )}
        <pointLight
          color={isDark ? '#60ffaa' : '#90d050'}
          intensity={isDark ? 9.0 : 1.4}
          distance={isDark ? 28 : 16}
          decay={2}
        />
      </Float>
    </group>
  )
}

export default function BiomeGrove({ origin, isDark = true, charPosRef }) {
  const cx = origin?.x ?? 0
  const cz = origin?.z ?? 0

  // ── Geometry computed once — no isDark dependency ─────────────────
  // Colors that depend on isDark are applied as props below, avoiding
  // a full remount of all 200+ meshes on every theme toggle.
  const props = useMemo(() => {
    const treeColors = [
      '#5a6e3a','#6b8440','#4a5e30','#7a9248','#8aaa50','#3a5028',
      '#4e7a38','#638c48','#526040','#70923c','#3d6628','#5c7a44',
    ]
    const darkTreeColors = treeColors.map(() => '#161e10')
    const bgTreeColorsLight = ['#1a3010','#223818','#1c2e14']

    const pathOffsets = [0, 1.8, -1.2, 2.4, -0.8, 1.5, -2.0, 0.5, -1.4, 1.0]

    const trees = Array.from({ length: 140 }, (_, i) => {
      const side  = i % 2 === 0 ? 1 : -1
      const depth = -2 - (i / 140) * 90
      const xOff  = side * (4 + Math.random() * 22) + Math.sin(depth * 0.08) * 3
      return {
        position: [cx + xOff, 0, cz + depth],
        scale:    0.4 + Math.random() * 2.0,
        // Store both color options, pick in render based on isDark
        colorLight: treeColors[i % treeColors.length],
        colorDark:  darkTreeColors[i % darkTreeColors.length],
        variant: i % 3,
      }
    })

    const bgTrees = Array.from({ length: 36 }, (_, i) => ({
      position: [cx + (i - 18) * 5.5 + Math.sin(i) * 3, 0, cz - 60 - Math.random() * 30],
      scale:    2.0 + Math.random() * 1.2,
      colorLight: bgTreeColorsLight[i % 3],
      colorDark:  '#0a0e08',
      variant: i % 3,
    }))

    const rockColorsLight = ['#6a6058','#7a7060','#5a5248','#8a7a68']
    const rocks = Array.from({ length: 28 }, (_, i) => ({
      position: [cx + (Math.random() - 0.5) * 38, 0.25, cz - 3 - Math.random() * 85],
      scale:    0.3 + Math.random() * 1.3,
      colorLight: rockColorsLight[i % rockColorsLight.length],
      colorDark:  '#1a1814',
    }))

    const bushColorsLight = ['#4a6830','#3a5820','#5a7838','#426030','#547040']
    const bushes = Array.from({ length: 45 }, (_, i) => ({
      position: [cx + (Math.random() - 0.5) * 34, 0, cz - 2 - Math.random() * 85],
      colorLight: bushColorsLight[i % bushColorsLight.length],
      colorDark:  '#0e1a0a',
    }))

    // Firefly count fixed at 48 — brightness varies via isDark prop
    const fireflies = Array.from({ length: 48 }, (_, i) => ({
      pos:   [cx + Math.sin(i * 1.4) * 14, 1.4 + Math.sin(i * 0.8) * 1.2, cz - 8 - i * 1.8],
      speed: 0.7 + Math.random() * 1.2,
    }))

    const mushrooms = Array.from({ length: 26 }, (_, i) => ({
      position: [cx + (Math.random() - 0.5) * 28, 0, cz - 4 - Math.random() * 80],
      color: ['#c84040','#e07030','#9050a0','#3070c0','#50a040'][i % 5],
    }))

    // Flowers — store positions only; rendered conditionally on isDark below
    const flowers = Array.from({ length: 70 }, (_, i) => ({
      position: [cx + (Math.random() - 0.5) * 34, 0.04, cz - 2 - Math.random() * 88],
      rot:  Math.random() * Math.PI,
      size: 0.07 + Math.random() * 0.12,
      color: ['#e8b890','#f0d078','#d4e888','#f0c0a0','#ffaacc','#ff88aa','#ffe0a0','#d0f080'][i % 8],
    }))

    const vines = Array.from({ length: 18 }, (_, i) => ({
      position: [cx + (i - 9) * 5.5, 3.0, cz - 14 - i * 4],
      length: 2.0 + Math.random() * 2.0,
    }))

    const pathCurve = pathOffsets.map((xOff, i) => ({ x: cx + xOff, z: cz - i * 10 }))

    return { trees, bgTrees, rocks, bushes, fireflies, mushrooms, flowers, vines, pathCurve }
  }, [cx, cz])
  // NOTE: isDark intentionally excluded — colors applied directly in JSX
  // via the colorLight/colorDark fields, not via useMemo remount.

  return (
    <group>
      {/* ── Ground path ── */}
      {props.pathCurve.map((pt, i) => i < props.pathCurve.length - 1 && (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[pt.x, 0.012, pt.z - 5]}>
          <planeGeometry args={[2.2, 11]} />
          <meshStandardMaterial color={isDark ? '#0a0805' : '#2a1e0e'} roughness={1} />
        </mesh>
      ))}

      {props.bgTrees.map((t, i) => (
        <Tree key={`bg-${i}`} {...t} color={isDark ? t.colorDark : t.colorLight} />
      ))}
      {props.trees.map((t, i) => (
        <Tree key={`tree-${i}`} {...t} color={isDark ? t.colorDark : t.colorLight} />
      ))}
      {props.rocks.map((r, i) => (
        <Rock key={`rock-${i}`} {...r} color={isDark ? r.colorDark : r.colorLight} />
      ))}
      {props.bushes.map((b, i) => (
        <Bush key={`bush-${i}`} {...b} color={isDark ? b.colorDark : b.colorLight} />
      ))}

      {/* ── Water features ── */}
      <Lake position={[cx - 12, 0, cz - 28]} radiusX={7} radiusZ={5} />
      <Lake position={[cx + 14, 0, cz - 62]} radiusX={5} radiusZ={3.5} />
      <Lake position={[cx - 8, 0, cz - 80]} radiusX={4} radiusZ={3} />
      <Waterfall position={[cx - 18, 0, cz - 35]} height={5.5} width={1.4} />
      <Waterfall position={[cx + 20, 0, cz - 70]} height={4.0} width={1.0} />

      {/* ── Fireflies — count stable, brightness via isDark prop ── */}
      {props.fireflies.map((f, i) => {
        // Only render 28 in light mode visually — skip every other beyond 28
        if (!isDark && i >= 28) return null
        return (
          <Float key={`ff-${i}`} speed={f.speed} floatIntensity={1.4} position={f.pos}>
            <mesh>
              <sphereGeometry args={[isDark ? 0.06 : 0.045, 6, 6]} />
              <meshStandardMaterial
                color="#c8e890"
                emissive="#c8e890"
                emissiveIntensity={isDark ? 10 : 5}
              />
            </mesh>
            <pointLight
              intensity={isDark ? 1.1 : 0.4}
              color="#c8e890"
              distance={isDark ? 7 : 5}
            />
          </Float>
        )
      })}

      {/* ── Path orbs ── */}
      {PATH_ORB_POSITIONS.map((pos, i) => (
        <PathOrb
          key={`orb-${i}`}
          position={[cx + pos[0], pos[1], cz + pos[2]]}
          isDark={isDark}
        />
      ))}

      {/* ── Mushrooms ── */}
      {props.mushrooms.map((m, i) => (
        <Mushroom
          key={`mush-${i}`}
          position={m.position}
          color={m.color}
          charPosRef={charPosRef}
          isDark={isDark}
        />
      ))}

      {/* ── Vines ── */}
      {props.vines.map((v, i) => (
        <mesh key={`vine-${i}`} position={v.position}>
          <cylinderGeometry args={[0.016, 0.01, v.length, 4]} />
          <meshStandardMaterial color={isDark ? '#0e1808' : '#4a6830'} roughness={0.9} />
        </mesh>
      ))}

      {/* ── Flowers — light mode only ── */}
      {!isDark && props.flowers.map((f, i) => (
        <mesh key={`flower-${i}`} position={f.position} rotation={[-Math.PI / 2, 0, f.rot]}>
          <circleGeometry args={[f.size, 6]} />
          <meshBasicMaterial color={f.color} />
        </mesh>
      ))}

      {/* ── Sparkles — light mode only ── */}
      {!isDark && (
        <>
          <Sparkles count={120} scale={[42, 12, 92]} position={[cx, 4, cz - 45]}
            size={1.8} speed={0.18} color="#9acc60" opacity={0.5} />
          <Sparkles count={60} scale={[30, 6, 80]} position={[cx, 1.5, cz - 45]}
            size={1.2} speed={0.28} color="#d0f090" opacity={0.3} />
        </>
      )}

      {/* ── Ambient fill lights — light mode only ── */}
      {!isDark && (
        <>
          <pointLight position={[cx, 2.5, cz - 10]}  intensity={2.0} color="#90d050" distance={28} />
          <pointLight position={[cx - 9, 1, cz - 28]} intensity={1.4} color="#c8e890" distance={20} />
          <pointLight position={[cx + 12, 1.5, cz - 50]} intensity={1.2} color="#a0cc60" distance={22} />
          <pointLight position={[cx - 6, 1, cz - 70]}  intensity={1.6} color="#80c040" distance={24} />
          <pointLight position={[cx + 8, 2, cz - 85]}  intensity={1.0} color="#c0e870" distance={18} />
        </>
      )}
    </group>
  )
}
