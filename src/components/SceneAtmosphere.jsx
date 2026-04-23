import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

/* ─────────────────────────────────────────────────────────────────
   SceneAtmosphere — now supports 5 biomes
   Fog, background, ambient, and directional light all crossfade
   as the player moves through the world.
─────────────────────────────────────────────────────────────────*/

const BIOMES = [
  {
    name: 'The Whispering Grove', roman: 'I',
    light: { bg: '#1a2e10', fog: '#243d18', fogNear: 22, fogFar: 75,  ambColor: '#a0c070', ambInt: 1.2 },
    dark:  { bg: '#04080a', fog: '#060c0a', fogNear: 14, fogFar: 55,  ambColor: '#0a1810', ambInt: 0.08 },
  },
  {
    name: 'Crystal Caverns', roman: 'II',
    light: { bg: '#07101e', fog: '#04080f', fogNear: 8,  fogFar: 38,  ambColor: '#1a3a5c', ambInt: 0.5 },
    dark:  { bg: '#020408', fog: '#020306', fogNear: 6,  fogFar: 34,  ambColor: '#10233c', ambInt: 0.16 },
  },
  {
    name: 'The Abyssal Deep', roman: 'III',
    light: { bg: '#021020', fog: '#010810', fogNear: 6,  fogFar: 35,  ambColor: '#0a2840', ambInt: 0.4 },
    dark:  { bg: '#010408', fog: '#000306', fogNear: 5,  fogFar: 28,  ambColor: '#020810', ambInt: 0.03 },
  },
  {
    name: 'The Ember Wastes', roman: 'IV',
    light: { bg: '#1a0802', fog: '#100401', fogNear: 12, fogFar: 45,  ambColor: '#3a1808', ambInt: 0.6 },
    dark:  { bg: '#110301', fog: '#180502', fogNear: 10, fogFar: 42,  ambColor: '#5a2310', ambInt: 0.18 },
  },
]

export { BIOMES }

const _c1 = new THREE.Color()
const _c2 = new THREE.Color()

export default function SceneAtmosphere({
  progressRef,
  isDark,
  quality = 'medium',
  onBiomeChange,
  isJourneyComplete = false,
}) {
  const { scene } = useThree()
  const ambRef = useRef()
  const lastBiomeRef = useRef(-1)
  const journeyA = useRef(0)

  useEffect(() => {
    const b = isDark ? BIOMES[0].dark : BIOMES[0].light
    scene.background = new THREE.Color(b.bg)
    scene.fog = new THREE.Fog(b.fog, b.fogNear, b.fogFar)
  }, [scene, isDark])

  useFrame(() => {
    const t = (progressRef?.current ?? 0) * (BIOMES.length - 1)  // [0, 4]
    journeyA.current = THREE.MathUtils.lerp(journeyA.current, isJourneyComplete ? 1 : 0, 0.022)

    // FIX 2a: Separate blend index (for lerp) from trigger index (for lore card).
    //
    // OLD: const idx = Math.min(Math.floor(t), BIOMES.length - 2)
    //   — clamped to 3, so biome 4 (Ember Wastes) could NEVER fire onBiomeChange.
    //   — Math.floor triggered on the first frame of crossing a boundary (no hysteresis).
    //
    // blendIdx: still clamped to BIOMES.length - 2 (= 3) so the A/B lerp pair
    //           always has a valid [idx+1] neighbour. Range: [0, 3].
    //
    // biomeIdx: uses Math.round so it fires at the midpoint between biomes (~0.5 units
    //           of natural hysteresis) and can reach BIOMES.length - 1 (= 4),
    //           allowing biome 4 to trigger. Range: [0, 4].

    const blendIdx = Math.min(Math.floor(t), BIOMES.length - 2)          // [0..3] for lerp
    const biomeIdx = Math.min(Math.round(t), BIOMES.length - 1)          // [0..4] for trigger

    // FIX 2b: Use biomeIdx for the change detection so biome 4 is reachable.
    if (biomeIdx !== lastBiomeRef.current) {
      lastBiomeRef.current = biomeIdx
      onBiomeChange?.(biomeIdx)
    }

    const a = THREE.MathUtils.smoothstep(t - blendIdx, 0, 1)

    // FIX 2c: Use blendIdx (not biomeIdx) for lerp — blendIdx+1 is always valid.
    const A = isDark ? BIOMES[blendIdx].dark   : BIOMES[blendIdx].light
    const B = isDark ? BIOMES[blendIdx+1].dark : BIOMES[blendIdx+1].light
    const journey = journeyA.current

    if (scene.background) {
      _c1.set(A.bg); _c2.set(B.bg)
      scene.background.copy(_c1.lerp(_c2, a))
      scene.background.lerp(new THREE.Color(isDark ? '#06070a' : '#160a18'), journey)
    }
    if (scene.fog) {
      _c1.set(A.fog); _c2.set(B.fog)
      scene.fog.color.copy(_c1.lerp(_c2, a))
      scene.fog.color.lerp(new THREE.Color(isDark ? '#0b0d12' : '#281126'), journey)
      scene.fog.near = THREE.MathUtils.lerp(THREE.MathUtils.lerp(A.fogNear, B.fogNear, a), isDark ? 8 : 10, journey)
      scene.fog.far  = THREE.MathUtils.lerp(THREE.MathUtils.lerp(A.fogFar,  B.fogFar,  a), isDark ? 62 : 72, journey)
    }
    if (ambRef.current) {
      _c1.set(A.ambColor); _c2.set(B.ambColor)
      ambRef.current.color.copy(_c1.lerp(_c2, a))
      ambRef.current.color.lerp(new THREE.Color(isDark ? '#d7ddf0' : '#9f5a8f'), journey * 0.32)
      ambRef.current.intensity = THREE.MathUtils.lerp(THREE.MathUtils.lerp(A.ambInt, B.ambInt, a), isDark ? 0.16 : 0.22, journey)
    }
  })

  const init = isDark ? BIOMES[0].dark : BIOMES[0].light
  const starCount = quality === 'low'
    ? (isDark ? 1100 : 350)
    : quality === 'medium'
      ? (isDark ? 1800 : 650)
      : (isDark ? 2600 : 900)
  const starFactor = quality === 'low'
    ? (isDark ? 4.2 : 2.2)
    : quality === 'medium'
      ? (isDark ? 5 : 2.6)
      : (isDark ? 6 : 3)

  return (
    <>
      <ambientLight ref={ambRef} intensity={init.ambInt} color={init.ambColor} />

      {!isDark ? (
        <>
          <directionalLight position={[0, 10, 10]}  intensity={4}   color="#ffffff" />
          <directionalLight position={[10, 18, 5]} intensity={1.6} />
        </>
      ) : (
        <directionalLight position={[20, 30, 10]} intensity={0.12} color="#8090c0" />
      )}

      <Stars
        radius={180}
        depth={80}
        count={starCount}
        factor={starFactor}
        saturation={0}
        fade
        speed={quality === 'low' ? (isDark ? 0.16 : 0.08) : (isDark ? 0.22 : 0.12)}
      />
    </>
  )
}
