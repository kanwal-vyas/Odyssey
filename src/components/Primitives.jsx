import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Tree ─────────────────────────────────────────────────────────────────────
export function Tree({ position, scale = 1, color = '#5a6e3a', variant = 0 }) {
  const trunkH = 1.1 + variant * 0.3
  const layers = variant === 2
    ? [[0, 1.8, 0], [0, 2.7, 0], [0, 3.35, 0], [0, 3.9, 0]]
    : [[0, 1.9, 0], [0, 2.85, 0], [0, 3.6, 0]]
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, trunkH / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.22, trunkH, 6]} />
        <meshStandardMaterial color="#3a2818" roughness={0.95} />
      </mesh>
      {layers.map((p, i) => (
        <mesh key={i} position={p}>
          <coneGeometry args={[0.68 - i * 0.13, 1.75 - i * 0.28, 7]} />
          <meshStandardMaterial color={color} flatShading roughness={0.85} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.22 * scale, 6]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ─── Rock ─────────────────────────────────────────────────────────────────────
export function Rock({ position, scale = 1, color = '#6a6058' }) {
  const rx = useMemo(() => (Math.random() - 0.5) * 0.8, [])
  const rz = useMemo(() => (Math.random() - 0.5) * 0.6, [])
  return (
    <mesh position={position} rotation={[rx, Math.random() * Math.PI, rz]} scale={scale}>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
    </mesh>
  )
}

// ─── Bush ─────────────────────────────────────────────────────────────────────
export function Bush({ position, color = '#4a6830' }) {
  return (
    <group position={position}>
      {[0, 0.2, 0.45, -0.35].map((ox, i) => (
        <mesh key={i} position={[ox, 0.22 + i * 0.05, (i % 2) * 0.15]}>
          <sphereGeometry args={[0.28 - i * 0.03, 6, 5]} />
          <meshStandardMaterial color={color} roughness={0.9} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// ─── Waterfall ────────────────────────────────────────────────────────────────
export function Waterfall({ position, height = 4, width = 1.2 }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current?.material) {
      meshRef.current.material.opacity =
        0.55 + Math.sin(clock.getElapsedTime() * 2.2) * 0.08
    }
  })
  return (
    <group position={position}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <planeGeometry args={[width, height, 1, 8]} />
        <meshStandardMaterial
          color="#a8ddf0" transparent opacity={0.58}
          roughness={0.05} metalness={0.1}
          depthWrite={false} side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.3, 0.1]} rotation={[-Math.PI / 8, 0, 0]}>
        <planeGeometry args={[width * 2.2, 1.2]} />
        <meshBasicMaterial color="#c8eef8" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0, height / 2, -0.18]}>
        <planeGeometry args={[width + 0.6, height + 0.5]} />
        <meshStandardMaterial color="#5a5040" roughness={1} />
      </mesh>
      <pointLight position={[0, height * 0.5, 0.5]} intensity={1.2} color="#88ccee" distance={8} />
    </group>
  )
}

// ─── Lake ─────────────────────────────────────────────────────────────────────
export function Lake({ position, radiusX = 6, radiusZ = 4 }) {
  const meshRef = useRef()
  useFrame(({ clock }) => {
    if (meshRef.current?.material) {
      meshRef.current.material.opacity =
        0.72 + Math.sin(clock.getElapsedTime() * 0.8) * 0.05
    }
  })
  return (
    <group position={position}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}
        scale={[1, radiusZ / radiusX, 1]}>
        <circleGeometry args={[radiusX, 24]} />
        <meshStandardMaterial
          color="#2a6888" roughness={0.02} metalness={0.85}
          transparent opacity={0.75} depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[radiusX, radiusX + 1.2, 24]} />
        <meshBasicMaterial color="#3a6040" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0.5, 0]} intensity={1.8} color="#4488aa"
        distance={radiusX * 2.5} />
    </group>
  )
}