import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PORTAL_X = 8
const DEFAULT_PORTAL_Z = -450
const DEFAULT_CLIFF_EDGE_Z = -356

const DAY = {
  bodyColor: '#ff6f3c',
  coreColor: '#fff2df',
  emissiveColor: '#ff9252',
  shellColorA: '#ffb16a',
  shellColorB: '#ffd28a',
  glowColor: '#ffe08c',
  horizonColor: '#ffb470',
  horizonMist: '#ffd9ad',
  cliffColor: '#1e1207',
  cliffRim: '#6d4320',
}

const NIGHT = {
  bodyColor: '#ffffff',
  coreColor: '#ffffff',
  emissiveColor: '#eef5ff',
  shellColorA: '#f8fbff',
  shellColorB: '#ffffff',
  glowColor: '#f3f6ff',
  horizonColor: '#c8d0e0',
  horizonMist: '#eef2ff',
  cliffColor: '#09070d',
  cliffRim: '#28335a',
}

const _bodyScale = new THREE.Vector3()
const _shellScaleA = new THREE.Vector3()
const _shellScaleB = new THREE.Vector3()
const _coronaScale = new THREE.Vector3()

const LIGHT_BODY_BASE = 2.55
const LIGHT_BODY_GROWTH = 1.75
const LIGHT_SHELL_A_BASE = 1.55
const LIGHT_SHELL_A_GROWTH = 1.05
const LIGHT_SHELL_B_BASE = 2.7
const LIGHT_SHELL_B_GROWTH = 2.1
const LIGHT_CORONA_BASE = 11.8
const LIGHT_CORONA_RISE = 4.4
const LIGHT_CORONA_GROWTH = 7.4

export default function EndPortal({
  isDark,
  onBeginAgain,
  portalZ = DEFAULT_PORTAL_Z,
  cliffEdgeZ = DEFAULT_CLIFF_EDGE_Z,
  isJourneyComplete = false,
}) {
  const tokens = isDark ? NIGHT : DAY

  const horizonGroupRef = useRef()

  const bodyRef = useRef()
  const bodyMatRef = useRef()

  // Dark mode uses a grove-orb style emissive core instead of fading the
  // body color up from near-black while it rises.
  const darkBodyRef = useRef()
  const darkBodyMatRef = useRef()

  const shellARef = useRef()
  const shellBRef = useRef()
  const shellAMatRef = useRef()
  const shellBMatRef = useRef()

  const darkGlowInnerRef = useRef()
  const darkGlowMidRef = useRef()
  const darkGlowOuterRef = useRef()
  const darkGlowMatInnerRef = useRef()
  const darkGlowMatMidRef = useRef()
  const darkGlowMatOuterRef = useRef()
  const darkDriftRef = useRef(0)

  const horizonLightRef = useRef()
  const sunCoronaRef = useRef()

  const hovered = useRef(false)
  const isActive = useRef(false)
  const clickFired = useRef(false)

  const opacityA = useRef(0)
  const riseA = useRef(0)
  const scaleA = useRef(0)
  const glowA = useRef(0)
  const bloomA = useRef(0)

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const revealTarget = isJourneyComplete ? 1 : 0

    if (!isJourneyComplete) clickFired.current = false
    isActive.current = isJourneyComplete

    bloomA.current = THREE.MathUtils.lerp(bloomA.current, revealTarget, dt * 0.34)
    opacityA.current = THREE.MathUtils.lerp(opacityA.current, revealTarget, dt * 0.24)
    riseA.current = THREE.MathUtils.lerp(riseA.current, bloomA.current, dt * 0.55)

    const growthTarget = revealTarget === 0
      ? 0
      : THREE.MathUtils.smoothstep(riseA.current, 0.9, 0.995)
    scaleA.current = THREE.MathUtils.lerp(scaleA.current, growthTarget, dt * 0.16)

    glowA.current = THREE.MathUtils.lerp(
      glowA.current,
      hovered.current && isActive.current ? 1.45 : 0.95 + revealTarget * 0.9,
      dt * 2.4,
    )

    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 0.45) * 0.03
    const y = -11.2 + riseA.current * 20.8
    const opacity = opacityA.current

    if (horizonGroupRef.current) {
      if (!isDark) {
        horizonGroupRef.current.position.set(PORTAL_X, y, portalZ)
      } else {
        horizonGroupRef.current.position.x = PORTAL_X
        horizonGroupRef.current.position.z = portalZ
      }
    }

    if (bodyRef.current) {
      _bodyScale.setScalar((LIGHT_BODY_BASE + scaleA.current * LIGHT_BODY_GROWTH) * pulse)
      bodyRef.current.scale.copy(_bodyScale)
      bodyRef.current.renderOrder = 8
      bodyRef.current.visible = !isDark && opacity > 0.01
      if (bodyMatRef.current) {
        bodyMatRef.current.opacity = 1
        bodyMatRef.current.emissiveIntensity = 8 + riseA.current * 5 + scaleA.current * 6
      }
    }

    if (darkBodyRef.current) {
      darkBodyRef.current.scale.setScalar((3.2 + scaleA.current * 2.2) * pulse)
      darkBodyRef.current.renderOrder = 8
      darkBodyRef.current.visible = isDark && opacity > 0.01
      if (darkBodyMatRef.current) {
        darkBodyMatRef.current.color.set('#ffffff')
        darkBodyMatRef.current.emissive.set('#eef5ff')
        darkBodyMatRef.current.emissiveIntensity =
          6.6 + opacity * 2.4 + scaleA.current * 2.2 + Math.sin(t * 1.1) * 0.4
      }
    }

    if (shellARef.current) {
      _shellScaleA.setScalar(
        (isDark ? 6.7 + scaleA.current * 4.6 : LIGHT_SHELL_A_BASE + scaleA.current * LIGHT_SHELL_A_GROWTH) * pulse,
      )
      shellARef.current.scale.copy(_shellScaleA)
      shellARef.current.renderOrder = 3
      shellARef.current.visible = opacity > 0.01
      if (shellAMatRef.current) {
        shellAMatRef.current.opacity =
          opacity * (isDark ? 0.08 : 0.1) * (0.95 + glowA.current * 0.2)
      }
    }

    if (shellBRef.current) {
      _shellScaleB.setScalar(
        (isDark ? 13.1 + scaleA.current * 8.8 : LIGHT_SHELL_B_BASE + scaleA.current * LIGHT_SHELL_B_GROWTH) * pulse,
      )
      shellBRef.current.scale.copy(_shellScaleB)
      shellBRef.current.renderOrder = 2
      shellBRef.current.visible = opacity > 0.01
      if (shellBMatRef.current) {
        shellBMatRef.current.opacity =
          opacity * (isDark ? 0.03 : 0.04) * (0.95 + glowA.current * 0.18)
      }
    }

    if (darkGlowInnerRef.current) {
      darkGlowInnerRef.current.scale.setScalar((4.8 + scaleA.current * 3.0) * pulse)
      darkGlowInnerRef.current.visible = isDark && opacity > 0.01
      if (darkGlowMatInnerRef.current) {
        darkGlowMatInnerRef.current.opacity =
          opacity * 0.06 * (0.85 + Math.sin(t * 0.9) * 0.15)
      }
    }
    if (darkGlowMidRef.current) {
      darkGlowMidRef.current.scale.setScalar((8.8 + scaleA.current * 5.2) * pulse)
      darkGlowMidRef.current.visible = isDark && opacity > 0.01
      if (darkGlowMatMidRef.current) {
        darkGlowMatMidRef.current.opacity =
          opacity * 0.026 * (0.80 + Math.sin(t * 0.7) * 0.20)
      }
    }
    if (darkGlowOuterRef.current) {
      darkGlowOuterRef.current.scale.setScalar((13.8 + scaleA.current * 7.2) * pulse)
      darkGlowOuterRef.current.visible = isDark && opacity > 0.01
      if (darkGlowMatOuterRef.current) {
        darkGlowMatOuterRef.current.opacity =
          opacity * 0.012 * (0.75 + Math.sin(t * 0.5 + 1.0) * 0.25)
      }
    }

    if (sunCoronaRef.current) {
      sunCoronaRef.current.visible = !isDark
      _coronaScale.setScalar(
        (LIGHT_CORONA_BASE + riseA.current * LIGHT_CORONA_RISE + scaleA.current * LIGHT_CORONA_GROWTH) *
        (1 + Math.sin(t * 0.28) * 0.03),
      )
      sunCoronaRef.current.scale.copy(_coronaScale)
      sunCoronaRef.current.rotation.z = t * 0.04
      sunCoronaRef.current.children.forEach((child, i) => {
        if (child.material) {
          child.material.opacity = opacity * (i === 0 ? 1 : i === 1 ? 0.62 : 0.5)
        }
      })
    }

    if (horizonLightRef.current) {
      if (isDark) {
        horizonLightRef.current.color.set('#eef5ff')
        horizonLightRef.current.intensity = opacity * 14 * (1 + Math.sin(t * 0.8) * 0.12)
        horizonLightRef.current.distance = 48
      } else {
        horizonLightRef.current.intensity = opacity * 12 * (1 + glowA.current * 0.7)
        horizonLightRef.current.distance = 34
      }
    }

    if (isDark && horizonGroupRef.current) {
      darkDriftRef.current = Math.sin(t * 0.55) * 0.18
      horizonGroupRef.current.position.y = y + darkDriftRef.current
    }
  })

  const onOver = useCallback((e) => {
    if (!isActive.current) return
    e.stopPropagation()
    hovered.current = true
    document.body.style.cursor = 'pointer'
  }, [])

  const onOut = useCallback(() => {
    hovered.current = false
    document.body.style.cursor = 'auto'
  }, [])

  const onClick = useCallback((e) => {
    if (!isActive.current || clickFired.current) return
    e.stopPropagation()
    clickFired.current = true
    document.body.style.cursor = 'auto'
    onBeginAgain?.()
  }, [onBeginAgain])

  return (
    <>
      <group position={[0, -0.1, cliffEdgeZ]}>
        <mesh position={[0, -12, -5]}>
          <boxGeometry args={[32, 24, 10]} />
          <meshStandardMaterial color={tokens.cliffColor} roughness={1} />
        </mesh>
      </group>

      <mesh position={[0, -20, cliffEdgeZ - 54]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[190, 140]} />
        <meshBasicMaterial
          color={isDark ? '#04050a' : '#29150c'}
          transparent
          opacity={0.7}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[6, 9.6, portalZ - 20]}>
        <planeGeometry args={[82, 38]} />
        <meshBasicMaterial
          color={tokens.horizonMist}
          transparent
          opacity={isDark ? 0.15 : 0.22}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[6, 4.8, portalZ - 12]}>
        <planeGeometry args={[64, 10]} />
        <meshBasicMaterial
          color={tokens.horizonColor}
          transparent
          opacity={isDark ? 0.28 : 0.42}
          depthWrite={false}
        />
      </mesh>

      <group ref={horizonGroupRef} position={[PORTAL_X, -4.8, portalZ]}>
        <pointLight
          ref={horizonLightRef}
          color={isDark ? '#eef5ff' : tokens.bodyColor}
          intensity={0}
          distance={34}
          decay={2}
        />

        <mesh ref={shellARef}>
          <sphereGeometry args={[1, 18, 16]} />
          <meshBasicMaterial
            ref={shellAMatRef}
            color={isDark ? '#f8fbff' : tokens.shellColorA}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </mesh>

        <mesh ref={shellBRef}>
          <sphereGeometry args={[1, 18, 16]} />
          <meshBasicMaterial
            ref={shellBMatRef}
            color={isDark ? '#ffffff' : tokens.shellColorB}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
          />
        </mesh>

        <mesh ref={darkGlowInnerRef} visible={false}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshBasicMaterial
            ref={darkGlowMatInnerRef}
            color="#f4f8ff"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh ref={darkGlowMidRef} visible={false}>
          <sphereGeometry args={[1, 14, 12]} />
          <meshBasicMaterial
            ref={darkGlowMatMidRef}
            color="#dfe8ff"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh ref={darkGlowOuterRef} visible={false}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial
            ref={darkGlowMatOuterRef}
            color="#c8d6ff"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <group ref={sunCoronaRef}>
          <mesh>
            <ringGeometry args={[1.12, 1.42, 40]} />
            <meshBasicMaterial
              color="#ffd56b"
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <ringGeometry args={[1.5, 1.9, 48]} />
            <meshBasicMaterial
              color="#ffb347"
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.65, 3.5]} />
            <meshBasicMaterial color="#ffc24a" transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <planeGeometry args={[0.65, 3.5]} />
            <meshBasicMaterial color="#ffc24a" transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        <mesh ref={bodyRef} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshStandardMaterial
            ref={bodyMatRef}
            color={tokens.bodyColor}
            emissive={tokens.emissiveColor}
            emissiveIntensity={0}
            depthWrite={false}
            roughness={0.05}
            metalness={0.02}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={darkBodyRef} visible={false} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <sphereGeometry args={[1, 28, 20]} />
          <meshStandardMaterial
            ref={darkBodyMatRef}
            color="#ffffff"
            emissive="#eef5ff"
            emissiveIntensity={7.2}
            depthWrite={false}
            roughness={0}
            toneMapped={false}
          />
        </mesh>

        <mesh position={[0, -0.4, 0]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
          <planeGeometry args={[20, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </>
  )
}
