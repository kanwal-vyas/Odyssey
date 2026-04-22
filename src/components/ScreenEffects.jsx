import { useEffect, useRef } from 'react'

/* ─────────────────────────────────────────────────────────────────
   ScreenEffects
   CSS-layer effects that enhance the 3D scene atmosphere:
   • Vignette — darkens edges, strengthens in cave/void/ember biomes
   • Scanline shimmer — subtle texture in void biome
   • Heat haze indicator — ember biome reddish tint
   • Ocean depth tint — blue-green colour grade
   • Pulse flash — brief glow when entering new biome
─────────────────────────────────────────────────────────────────*/

const BIOME_EFFECTS = [
  // Grove
  { vignette: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2, 8, 4, 0.55) 100%)', tint: 'rgba(0,0,0,0)', scan: false },
  // Cave
  { vignette: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(1, 3, 8, 0.75) 100%)', tint: 'rgba(10,20,40,0.08)', scan: false },
  // Ocean
  { vignette: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0, 4, 12, 0.72) 100%)', tint: 'rgba(0,30,50,0.10)', scan: false },
  // Ember
  { vignette: 'radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(12, 2, 0, 0.80) 100%)', tint: 'rgba(40,8,0,0.10)', scan: false },
]

export default function ScreenEffects({ biomeIndex, isDark }) {
  const vignetteRef = useRef()
  const tintRef     = useRef()
  const pulseRef    = useRef()
  const prevBiome   = useRef(biomeIndex)

  // Flash on biome change
  useEffect(() => {
    if (biomeIndex === prevBiome.current) return
    prevBiome.current = biomeIndex
    const el = pulseRef.current
    if (!el) return
    el.style.opacity = '0.25'
    el.style.transition = 'none'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 1.2s ease'
      el.style.opacity = '0'
    })
  }, [biomeIndex])

  // Smooth crossfade vignette/tint on biome change
  useEffect(() => {
    const fx = BIOME_EFFECTS[biomeIndex] ?? BIOME_EFFECTS[0]
    if (vignetteRef.current) vignetteRef.current.style.background = fx.vignette
    if (tintRef.current)     tintRef.current.style.background     = fx.tint
  }, [biomeIndex])

  const fx = BIOME_EFFECTS[biomeIndex] ?? BIOME_EFFECTS[0]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {/* Vignette */}
      <div ref={vignetteRef} style={{
        position: 'absolute', inset: 0,
        background: fx.vignette,
        transition: 'background 1.5s ease',
      }} />

      {/* Color tint */}
      <div ref={tintRef} style={{
        position: 'absolute', inset: 0,
        background: fx.tint,
        transition: 'background 1.5s ease',
        mixBlendMode: 'multiply',
      }} />

      {/* Scanlines for special biomes */}
      {fx.scan && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,20,0.04) 2px, rgba(0,0,20,0.04) 4px)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Biome transition pulse flash */}
      <div ref={pulseRef} style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
        opacity: 0,
        transition: 'opacity 1.2s ease',
      }} />

      {/* Film grain — subtle noise */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: isDark ? 0.012 : 0.006,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '160px',
      }} />
    </div>
  )
}
