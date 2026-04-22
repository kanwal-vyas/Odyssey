import { useEffect, useRef, useState } from 'react'

const OUTER_SIZE = 132
const MAX_THROW = 36
const DEAD_ZONE = 0.14

function clampStick(x, y) {
  const length = Math.hypot(x, y)
  if (length <= MAX_THROW) return { x, y }
  const scale = MAX_THROW / length
  return { x: x * scale, y: y * scale }
}

export default function MobileJoystick({ inputRef }) {
  const padRef = useRef(null)
  const activePointerIdRef = useRef(null)
  const [active, setActive] = useState(false)
  const [thumb, setThumb] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const controls = inputRef?.current
    return () => {
      if (controls) {
        controls.dx = 0
        controls.dz = 0
      }
    }
  }, [inputRef])

  const updateFromPointer = (event) => {
    const pad = padRef.current
    if (!pad) return

    const rect = pad.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const localX = event.clientX - centerX
    const localY = event.clientY - centerY
    const next = clampStick(localX, localY)
    const normalizedX = next.x / MAX_THROW
    const normalizedY = next.y / MAX_THROW
    const magnitude = Math.hypot(normalizedX, normalizedY)
    const dx = magnitude < DEAD_ZONE ? 0 : -normalizedX
    const dz = magnitude < DEAD_ZONE ? 0 : -normalizedY

    setThumb(next)

    if (inputRef?.current) {
      inputRef.current.dx = dx
      inputRef.current.dz = dz
    }
  }

  const resetStick = () => {
    activePointerIdRef.current = null
    setActive(false)
    setThumb({ x: 0, y: 0 })
    if (inputRef?.current) {
      inputRef.current.dx = 0
      inputRef.current.dz = 0
    }
  }

  const handlePointerDown = (event) => {
    if (activePointerIdRef.current != null) return
    activePointerIdRef.current = event.pointerId
    setActive(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event)
  }

  const handlePointerMove = (event) => {
    if (event.pointerId !== activePointerIdRef.current) return
    updateFromPointer(event)
  }

  const handlePointerEnd = (event) => {
    if (event.pointerId !== activePointerIdRef.current) return
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch { /* pointer capture may already be released */ }
    resetStick()
  }

  return (
    <div className="mobile-joystick-wrap" aria-hidden="true">
      <div
        ref={padRef}
        className={`mobile-joystick${active ? ' active' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={resetStick}
        style={{
          width: `${OUTER_SIZE}px`,
          height: `${OUTER_SIZE}px`,
          '--thumb-x': `${thumb.x}px`,
          '--thumb-y': `${thumb.y}px`,
        }}
      >
        <div className="mobile-joystick-ring mobile-joystick-ring-outer" />
        <div className="mobile-joystick-ring mobile-joystick-ring-mid" />
        <div className="mobile-joystick-core">
          <div className="mobile-joystick-thumb" />
        </div>
      </div>
    </div>
  )
}
