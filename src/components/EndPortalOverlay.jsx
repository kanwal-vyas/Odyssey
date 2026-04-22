/**
 * EndPortalOverlay.jsx
 *
 * A full-screen DOM overlay that plays the light-expansion transition
 * when the user clicks the EndPortal sun/moon.
 *
 * Rendered OUTSIDE the <Canvas> in App.jsx alongside other DOM layers
 * (ScreenEffects, HUD, etc.).
 *
 * Usage in App.jsx:
 *
 *   import EndPortalOverlay from './components/EndPortalOverlay'
 *   ...
 *   <EndPortalOverlay isFlashing={portalFlashing} isDark={isDark} />
 *
 * Props:
 *   isFlashing  — boolean, controlled by App state
 *   isDark      — boolean, warm vs cool flash palette
 */

import { useEffect, useRef } from 'react'
import './EndPortalOverlay.css'

export default function EndPortalOverlay({ isFlashing, isDark }) {
  const ref = useRef(null)

  /*
    Re-trigger the CSS animation each time isFlashing flips true.
    We do this by removing then re-adding the element's active class
    after a 1-frame gap, which forces the browser to restart the keyframe.
  */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!isFlashing) {
      el.classList.remove('portal-flash--active')
      return
    }
    // flush then restart
    el.classList.remove('portal-flash--active')
    void el.offsetWidth                         // reflow
    el.classList.add('portal-flash--active')
  }, [isFlashing])

  return (
    <div
      ref={ref}
      className="portal-flash"
      data-dark={String(isDark)}
      aria-hidden="true"
    />
  )
}