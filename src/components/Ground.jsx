export default function Ground({ isDark = true, totalDepth = 480 }) {
  const groundColor = isDark ? '#050402' : '#1a1408'
  const pathColor   = isDark ? '#030201' : '#2a2010'
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
        <meshStandardMaterial color={pathColor} roughness={1} />
      </mesh>
    </group>
  )
}
