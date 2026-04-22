import { Billboard, Text } from '@react-three/drei'

export default function BiomeLabel({ title, subtitle, position, color = '#f5f0e8' }) {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.52}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.016}
        outlineColor="rgba(0,0,0,0.6)"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          fontSize={0.2}
          color={color}
          anchorX="center"
          anchorY="middle"
          position={[0, -0.62, 0]}
          outlineWidth={0.01}
          outlineColor="rgba(0,0,0,0.4)"
          fillOpacity={0.65}
        >
          {subtitle}
        </Text>
      )}
    </Billboard>
  )
}