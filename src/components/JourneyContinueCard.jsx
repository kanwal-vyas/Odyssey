import { useEffect, useState } from 'react'

export default function JourneyContinueCard({ triggerKey, isDark, active }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (triggerKey === null || triggerKey === undefined) return
    setVisible(true)
  }, [triggerKey])

  useEffect(() => {
    if (!active) setVisible(false)
  }, [active])

  if (!visible) return null

  const accent = isDark ? '#8eb0ff' : '#ffbf6b'
  const glow = isDark ? '#8eb0ff66' : '#ff9f4d66'

  return (
    <div style={{
      position: 'fixed',
      bottom: '12vh',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      textAlign: 'center',
      pointerEvents: 'none',
      opacity: 1,
      animation: 'journeyCardSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <style>{`
        @keyframes journeyCardSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(18px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes journeyCardLine {
          from { width: 0; }
          to   { width: 100%; }
        }
        .journey-card-line {
          animation: journeyCardLine 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
        }
      `}</style>

      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: '0.65rem',
        fontStyle: 'italic',
        letterSpacing: '0.5em',
        color: accent,
        marginBottom: '0.5rem',
        opacity: 0.8,
      }}>
        V
      </div>

      <div className="journey-card-line" style={{
        height: '1px',
        background: accent,
        opacity: 0.42,
        margin: '0 auto 0.8rem',
        maxWidth: '120px',
      }} />

      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontSize: 'clamp(1.45rem, 3vw, 2.3rem)',
        fontWeight: 300,
        color: '#f0ece4',
        letterSpacing: '0.02em',
        lineHeight: 1.1,
        marginBottom: '0.5rem',
        textShadow: `0 0 30px ${glow}, 0 2px 20px rgba(0,0,0,0.82)`,
      }}>
        The journey is not over yet
      </div>

      <div style={{
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        fontSize: '0.68rem',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: accent,
        opacity: 0.92,
        marginBottom: '0.9rem',
      }}>
        The horizon still calls
      </div>

      <div className="journey-card-line" style={{
        height: '1px',
        background: accent,
        opacity: 0.25,
        margin: '0 auto 0.8rem',
        maxWidth: '220px',
      }} />

      <div style={{
        fontFamily: 'var(--font-serif, Georgia, serif)',
        fontStyle: 'italic',
        fontSize: 'clamp(0.72rem, 1.2vw, 0.82rem)',
        fontWeight: 300,
        color: 'rgba(240, 236, 228, 0.68)',
        maxWidth: '380px',
        lineHeight: 1.65,
        textShadow: '0 2px 12px rgba(0,0,0,0.9)',
      }}>
        Touch the rising light to begin again.
      </div>
    </div>
  )
}
