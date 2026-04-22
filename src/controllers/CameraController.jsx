import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CAM_HEIGHT = 4.7
const CAM_BACK_DISTANCE = 8.8
const LOOK_AHEAD_DISTANCE = 5.5
const SIDE_BIAS = 0.45

export default function CameraController({ charPosRef, charRotYRef }) {
  const { camera } = useThree()
  const _idealPos  = useRef(new THREE.Vector3())
  const _lookAt    = useRef(new THREE.Vector3())
  const _forward   = useRef(new THREE.Vector3())
  const _right     = useRef(new THREE.Vector3())

  useFrame(() => {
    const pos = charPosRef.current
    const rotY = charRotYRef?.current ?? 0

    _forward.current.set(Math.sin(rotY), 0, Math.cos(rotY)).normalize()
    _right.current.set(_forward.current.z, 0, -_forward.current.x).normalize()

    _idealPos.current
      .copy(pos)
      .addScaledVector(_forward.current, -CAM_BACK_DISTANCE)
      .addScaledVector(_right.current, SIDE_BIAS)
    _idealPos.current.y = pos.y + CAM_HEIGHT

    _lookAt.current
      .copy(pos)
      .addScaledVector(_forward.current, LOOK_AHEAD_DISTANCE)
    _lookAt.current.y = pos.y + 1.45

    camera.position.lerp(_idealPos.current, 0.06)
    camera.lookAt(_lookAt.current)
  })

  return null
}
