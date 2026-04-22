import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeys } from '../hooks/useKeys'
import Character from '../components/Character'
// FIX 4: Removed `import { invalidate } from '@react-three/fiber'` — the static
// import is a no-op in demand mode; you must call the invalidate returned by useThree().

const SPEED = 6.5

function CharacterGlow({ isDark }) {
  if (!isDark) return null

  return (
    <>
      <pointLight
        position={[0, 1.15, 0.4]}
        color="#b8ffd4"
        intensity={4.5}
        distance={15}
        decay={2}
      />
      <pointLight
        position={[0, 2.1, 1.2]}
        color="#fff4d0"
        intensity={1.8}
        distance={8}
        decay={2}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <ringGeometry args={[0.45, 3.2, 36]} />
        <meshBasicMaterial color="#80ffaa" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </>
  )
}

export default function FreeController({
  charPosRef,
  charRotYRef,
  onProgress,
  progressRef,
  isDark = true,
  totalDepth = 465,
  virtualInputRef,
}) {
  const { camera } = useThree()
  const keys = useKeys()
  const [isMoving, setIsMoving] = useState(false)
  const charRef     = useRef()
  const movingState = useRef(false)
  const _camDir   = useRef(new THREE.Vector3())
  const _camRight = useRef(new THREE.Vector3())
  const _move     = useRef(new THREE.Vector3())
  const _faceMove = useRef(new THREE.Vector3())
  const _up       = useRef(new THREE.Vector3(0, 1, 0))

  useFrame((_, delta) => {
    const k = keys.current
    const keyboardDx = (k['KeyA'] || k['ArrowLeft']  ? 1 : 0) - (k['KeyD'] || k['ArrowRight'] ? 1 : 0)
    const keyboardDz = (k['KeyW'] || k['ArrowUp']    ? 1 : 0) - (k['KeyS'] || k['ArrowDown']  ? 1 : 0)
    const touchDx = virtualInputRef?.current?.dx ?? 0
    const touchDz = virtualInputRef?.current?.dz ?? 0
    const dx = THREE.MathUtils.clamp(keyboardDx + touchDx, -1, 1)
    const dz = THREE.MathUtils.clamp(keyboardDz + touchDz, -1, 1)
    const moving = Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01
    if (movingState.current !== moving) {
      movingState.current = moving
      setIsMoving(moving)
    }

    if (moving) {
      camera.getWorldDirection(_camDir.current)
      _camDir.current.y = 0
      _camDir.current.normalize()
      _camRight.current.crossVectors(_up.current, _camDir.current).normalize()
      _move.current.set(0, 0, 0)
      _move.current.addScaledVector(_camDir.current, dz * SPEED)
      _move.current.addScaledVector(_camRight.current, dx * SPEED)
      charPosRef.current.addScaledVector(_move.current, delta)

      // Clamp to world bounds
      charPosRef.current.z = Math.max(-totalDepth, Math.min(12, charPosRef.current.z))
      charPosRef.current.x = Math.max(-30, Math.min(30, charPosRef.current.x))

      if (_move.current.lengthSq() > 0.001) {
        const targetAngle = Math.atan2(_move.current.x, _move.current.z)
        let delta = targetAngle - charRotYRef.current
        while (delta > Math.PI)  delta -= Math.PI * 2
        while (delta < -Math.PI) delta += Math.PI * 2
        charRotYRef.current += delta * 0.15
      }
    }

    if (charRef.current) {
      charRef.current.position.copy(charPosRef.current)
      charRef.current.rotation.y = charRotYRef.current
    }

    const p = THREE.MathUtils.clamp(
      THREE.MathUtils.inverseLerp(8, -totalDepth, charPosRef.current.z), 0, 1
    )
    if (progressRef) progressRef.current = p
    onProgress(p)

  })

  return (
    <group ref={charRef} position={[0, 0, 8]}>
      <CharacterGlow isDark={isDark} />
      <Character isMoving={isMoving} />
    </group>
  )
}
