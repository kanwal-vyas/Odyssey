import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────
   BiomeLoreCard
   Cinematic title card that appears when the player enters a new biome.
   Shows: Roman numeral, biome name, lore tagline, a short flavour sentence.
   Fades out after 5 seconds.
─────────────────────────────────────────────────────────────────*/

const LORE = [
  {
    roman: 'I',
    name: 'The Whispering Grove',
    tagline: 'Where the forest breathes',
    lore: 'Ancient trees remember every name spoken beneath them. Listen closely — the wind carries secrets.',
    accent: '#9acc60',
  },
  {
    roman: 'II',
    name: 'Crystal Caverns',
    tagline: 'Deep beneath the earth',
    lore: 'The crystals grew in darkness for ten thousand years, absorbing the dreams of sleeping stone.',
    accent: '#60a8d0',
  },
  {
    roman: 'III',
    name: 'The Abyssal Deep',
    tagline: 'Where light comes to die',
    lore: 'The pressure here would crush iron. Yet life persists — luminous, patient, and watching.',
    accent: '#40c8ff',
  },
  {
    roman: 'IV',
    name: 'The Ember Wastes',
    tagline: 'The world unmade by fire',
    lore: 'This place was once a garden. The volcano doesn\'t remember. Neither should you linger.',
    accent: '#ff6020',
  },
]

export default function BiomeLoreCard({ biomeIndex, triggerKey }) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading]   = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (triggerKey === null || triggerKey === undefined) return
    // Reset and show
    setFading(false)
    setVisible(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    // Start fade-out after 4.5s
    timerRef.current = setTimeout(() => {
      setFading(true)
      timerRef.current = setTimeout(() => setVisible(false), 900)
    }, 4500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [triggerKey])

  if (!visible) return null

  const lore = LORE[biomeIndex] ?? LORE[0]

  return (
    <div style={{
      position: 'fixed',
      bottom: '12vh',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      textAlign: 'center',
      pointerEvents: 'none',
      opacity: fading ? 0 : 1,
      transition: fading ? 'opacity 0.9s ease' : 'opacity 0.6s ease',
      animation: !fading ? 'loreSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' : 'none',
    }}>
      <style>{`
        @keyframes loreSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(18px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes loreLineDraw {
          from { width: 0; }
          to   { width: 100%; }
        }
        .lore-line { animation: loreLineDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both; }
      `}</style>

      {/* Roman numeral */}
      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: '0.65rem',
        fontStyle: 'italic',
        letterSpacing: '0.5em',
        color: lore.accent,
        marginBottom: '0.5rem',
        opacity: 0.8,
      }}>
        {lore.roman}
      </div>

      {/* Separator line — draws in */}
      <div className="lore-line" style={{
        height: '1px',
        background: lore.accent,
        opacity: 0.4,
        margin: '0 auto 0.8rem',
        maxWidth: '120px',
      }} />

      {/* Biome name */}
      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
        fontWeight: 300,
        color: '#f0ece4',
        letterSpacing: '0.02em',
        lineHeight: 1.1,
        marginBottom: '0.4rem',
        textShadow: `0 0 30px ${lore.accent}88, 0 2px 20px rgba(0,0,0,0.8)`,
      }}>
        {lore.name}
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        fontSize: '0.68rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: lore.accent,
        opacity: 0.9,
        marginBottom: '0.9rem',
      }}>
        {lore.tagline}
      </div>

      {/* Separator line */}
      <div className="lore-line" style={{
        height: '1px',
        background: lore.accent,
        opacity: 0.25,
        margin: '0 auto 0.8rem',
        maxWidth: '200px',
      }} />

      {/* Lore text */}
      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontStyle: 'italic',
        fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)',
        fontWeight: 300,
        color: 'rgba(240, 236, 228, 0.65)',
        maxWidth: '340px',
        lineHeight: 1.65,
        textShadow: '0 2px 12px rgba(0,0,0,0.9)',
      }}>
        {lore.lore}
      </div>
    </div>
  )
}
