import { useEffect, useRef, useState } from 'react'

const LORE = [
  {
    roman: 'I',
    name: 'The Whispering Grove',
    tagline: 'Where the forest breathes',
    lore: 'Ancient trees remember every name spoken beneath them. Listen closely - the wind carries secrets.',
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
    lore: 'The pressure here would crush iron. Yet life persists - luminous, patient, and watching.',
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
  const [fading, setFading] = useState(false)
  const [animationSeed, setAnimationSeed] = useState(0)
  const fadeTimerRef = useRef(null)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    if (triggerKey === null || triggerKey === undefined) return

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)

    setFading(false)
    setVisible(true)
    setAnimationSeed(prev => prev + 1)

    fadeTimerRef.current = setTimeout(() => {
      setFading(true)
      hideTimerRef.current = setTimeout(() => setVisible(false), 900)
    }, 4500)

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [triggerKey])

  if (!visible) return null

  const lore = LORE[biomeIndex] ?? LORE[0]

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        textAlign: 'center',
        pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        willChange: 'opacity',
        contain: 'layout paint',
        transition: fading ? 'opacity 0.9s ease' : 'opacity 0.2s linear',
      }}
    >
      <style>{`
        @keyframes loreSlideUp {
          from { opacity: 0; transform: translate3d(0, 18px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes loreLineDraw {
          from { width: 0; }
          to   { width: 100%; }
        }
        .lore-line {
          animation: loreLineDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
      `}</style>

      <div
        key={animationSeed}
        style={{
          animation: 'loreSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: '0.65rem',
            fontStyle: 'italic',
            letterSpacing: '0.5em',
            color: lore.accent,
            marginBottom: '0.5rem',
            opacity: 0.8,
          }}
        >
          {lore.roman}
        </div>

        <div
          className="lore-line"
          style={{
            height: '1px',
            background: lore.accent,
            opacity: 0.4,
            margin: '0 auto 0.8rem',
            maxWidth: '120px',
          }}
        />

        <div
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            fontWeight: 300,
            color: '#f0ece4',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            marginBottom: '0.4rem',
            textShadow: `0 0 30px ${lore.accent}88, 0 2px 20px rgba(0,0,0,0.8)`,
          }}
        >
          {lore.name}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-sans, system-ui, sans-serif)',
            fontSize: '0.68rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: lore.accent,
            opacity: 0.9,
            marginBottom: '0.9rem',
          }}
        >
          {lore.tagline}
        </div>

        <div
          className="lore-line"
          style={{
            height: '1px',
            background: lore.accent,
            opacity: 0.25,
            margin: '0 auto 0.8rem',
            maxWidth: '200px',
          }}
        />

        <div
          style={{
            fontFamily: 'var(--font-serif, Georgia, serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)',
            fontWeight: 300,
            color: 'rgba(240, 236, 228, 0.65)',
            maxWidth: '340px',
            lineHeight: 1.65,
            textShadow: '0 2px 12px rgba(0,0,0,0.9)',
          }}
        >
          {lore.lore}
        </div>
      </div>
    </div>
  )
}
