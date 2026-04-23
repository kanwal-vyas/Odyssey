export default function Ground({ isDark = true, totalDepth = 480 }) {
  const groundColor = isDark ? '#050402' : '#1a1408'
  const pathColor   = isDark ? '#101214ab' : '#2a2010c2'
  const pathGlowColor = '#80ffaa6c'
  const frontPadding = 12
  const groundDepth = totalDepth + frontPadding
  const centerZ = -((totalDepth - frontPadding) / 2)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[80, groundDepth]} />
        <meshStandardMaterial color={groundColor} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, centerZ]}>
        <planeGeometry args={[2.8, groundDepth]} />
        <meshStandardMaterial
          color={pathColor}
          roughness={1}
          emissive={isDark ? pathGlowColor : '#000000'}
          emissiveIntensity={isDark ? 0.005 : 0}
        />
      </mesh>
      {isDark && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, centerZ]}>
          <planeGeometry args={[3.6, groundDepth]} />
          <meshBasicMaterial
            color={pathGlowColor}
            transparent
            opacity={0.012}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  )
}
