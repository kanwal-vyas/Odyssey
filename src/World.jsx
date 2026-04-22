import { useCallback } from 'react'
import SceneAtmosphere from './components/SceneAtmosphere'
import Ground from './components/Ground'
import BiomeCave from './components/BiomeCave'
import BiomeLabel from './components/BiomeLabel'
import BiomeGrove from './components/BiomeGrove'
import BiomeOcean from './components/BiomeOcean'
import BiomeEmber from './components/BiomeEmber'
import CameraController from './controllers/CameraController'
import FreeController from './controllers/FreeController'
import EndPortal from './components/EndPortal'

const LAST_BIOME_PORTAL_GAP = 62
const CLIFF_WALKWAY = 26

const BIOMES = [
  { name: 'The Whispering Grove', roman: 'I',   subtitle: 'Where the forest breathes',  color: '#c8e890' },
  { name: 'Crystal Caverns',      roman: 'II',  subtitle: 'Deep beneath the earth',     color: '#88c8e8' },
  { name: 'The Abyssal Deep',     roman: 'III', subtitle: 'Where light comes to die',   color: '#40c8ff' },
  { name: 'The Ember Wastes',     roman: 'IV',  subtitle: 'The world unmade by fire',   color: '#ff8040' },
]

const BIOME_Z_POSITIONS = [0, -110, -220, -330]
const CLIFF_EDGE_Z = BIOME_Z_POSITIONS[BIOME_Z_POSITIONS.length - 1] - CLIFF_WALKWAY
const END_PORTAL_Z = BIOME_Z_POSITIONS[BIOME_Z_POSITIONS.length - 1] - LAST_BIOME_PORTAL_GAP
const WORLD_DEPTH = Math.abs(CLIFF_EDGE_Z)

export { BIOMES, BIOME_Z_POSITIONS, CLIFF_EDGE_Z, END_PORTAL_Z, WORLD_DEPTH }

export default function World({
  onProgress,
  progressRef,
  charPosRef,
  charRotYRef,
  isDark,
  onBiomeChange,
  onBeginAgain,
  isJourneyComplete,
  virtualInputRef,
}) {
  const handleProgress = useCallback((offset) => {
    progressRef.current = offset
    onProgress?.(offset)
  }, [onProgress, progressRef])

  return (
    <>
      <SceneAtmosphere
        progressRef={progressRef}
        isDark={isDark}
        onBiomeChange={onBiomeChange}
        isJourneyComplete={isJourneyComplete}
      />
      <Ground isDark={isDark} totalDepth={WORLD_DEPTH} />

      <BiomeGrove
        origin={null}
        isDark={isDark}
        charPosRef={charPosRef}
      />
      <BiomeCave
        origin={{ x: 0, z: -110 }}
        isDark={isDark}
        charPosRef={charPosRef}
      />
      <BiomeOcean
        origin={{ x: 0, z: -220 }}
        isDark={isDark}
        charPosRef={charPosRef}
      />
      <BiomeEmber
        origin={{ x: 0, z: -330 }}
        isDark={isDark}
        charPosRef={charPosRef}
        cliffEdgeZ={CLIFF_EDGE_Z}
      />

      {BIOMES.map((b, i) => (
        <BiomeLabel key={i}
          title={b.name}
          subtitle={b.subtitle}
          position={[0, 6, BIOME_Z_POSITIONS[i] - 8]}
          color={b.color}
        />
      ))}

      {BIOME_Z_POSITIONS.slice(1).map((z, i) => (
        <group key={`arch-${i}`} position={[0, 0, z + 5]}>
          <mesh position={[0, 3.5, 0]}>
            <torusGeometry args={[3.5, 0.12, 8, 32]} />
            <meshStandardMaterial
              color={BIOMES[i + 1].color}
              emissive={BIOMES[i + 1].color}
              emissiveIntensity={isDark ? 1.5 : 0.5}
              roughness={0.2}
            />
          </mesh>
          <pointLight color={BIOMES[i + 1].color} intensity={isDark ? 3 : 1} distance={15} decay={2} />
        </group>
      ))}

      {/*
        Finale vista:
        a cliff lip just beyond the Ember Wastes, with a distant sun/moon
        rising on the horizon and text that returns the player to Intro.
      */}
      <EndPortal
        progressRef={progressRef}
        isDark={isDark}
        onBeginAgain={onBeginAgain}
        portalZ={END_PORTAL_Z}
        cliffEdgeZ={CLIFF_EDGE_Z}
        isJourneyComplete={isJourneyComplete}
      />

      <CameraController charPosRef={charPosRef} charRotYRef={charRotYRef} />

      <FreeController
        charPosRef={charPosRef}
        charRotYRef={charRotYRef}
        onProgress={handleProgress}
        progressRef={progressRef}
        isDark={isDark}
        totalDepth={WORLD_DEPTH}
        virtualInputRef={virtualInputRef}
      />
    </>
  )
}
