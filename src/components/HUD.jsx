import { useEffect, useRef, useState } from 'react'
import { BIOMES } from '../World'
import { applyTheme } from '../hooks/useTheme'
import MiniMap from './MiniMap'

function ThemeTogglePill({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      className="hud-theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" style={{
          transform: isDark ? 'translate(14px, -50%)' : 'translate(0, -50%)',
        }} />
      </span>
      <span className="hud-theme-label">
        {isDark ? 'Night' : 'Day'}
      </span>
    </button>
  )
}

function MusicToggle({ musicOn, onToggle }) {
  return (
    <button
      className="hud-music-toggle"
      onClick={onToggle}
      aria-label={musicOn ? 'Mute music' : 'Play music'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: musicOn ? 'rgba(60,180,110,0.15)' : 'var(--btn-bg)',
        border: `1px solid ${musicOn ? 'rgba(60,180,110,0.5)' : 'var(--btn-border)'}`,
        borderRadius: '6px',
        padding: '0.35rem 0.7rem 0.35rem 0.5rem',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        boxShadow: musicOn ? '0 0 14px rgba(60,180,110,0.3)' : 'none',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '14px' }}>
        {[1, 0.6, 0.85, 0.4, 0.7].map((h, i) => (
          <span key={i} style={{
            width: '3px',
            height: musicOn ? `${h * 14}px` : '4px',
            background: musicOn ? 'var(--accent)' : 'var(--text-muted)',
            borderRadius: '1px',
            transition: `height ${0.2 + i * 0.08}s ease`,
            animation: musicOn ? `eq-bar ${0.5 + i * 0.12}s ease-in-out ${i * 0.1}s infinite alternate` : 'none',
          }} />
        ))}
      </span>
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '0.58rem',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: musicOn ? 'var(--accent)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        transition: 'color 0.3s ease',
      }}>
        Music
      </span>
      <style>{`
        @keyframes eq-bar {
          from { height: 4px; }
          to   { height: 14px; }
        }
      `}</style>
    </button>
  )
}

function BiomeCompass({ activeBiome, compact = false }) {
  const biome = BIOMES[activeBiome]
  if (!biome) return null

  return (
    <div className="hud-biome-compass">
      {compact ? biome.name : `${biome.roman} - ${biome.name}`}
    </div>
  )
}

export default function HUD({
  zoneRefs,
  theme,
  setTheme,
  musicOn,
  onMusicToggle,
  activeBiome,
  onSelectBiome,
  progressRef,
  charPosRef,
}) {
  const navRef = useRef(null)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [desktopNavOpen, setDesktopNavOpen] = useState(false)
  const [desktopHoverSuppressed, setDesktopHoverSuppressed] = useState(false)

  useEffect(() => {
    const updateLayout = () => {
      const nextMobile = window.matchMedia('(max-width: 860px), (pointer: coarse)').matches
      setIsMobileLayout(nextMobile)
      if (nextMobile) {
        setDesktopNavOpen(false)
        setDesktopHoverSuppressed(false)
      } else {
        setMobileNavOpen(false)
      }
    }

    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  useEffect(() => {
    if (!isMobileLayout || !mobileNavOpen) return

    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMobileLayout, mobileNavOpen])

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  const handleZonePress = (index) => {
    if (isMobileLayout && !mobileNavOpen) {
      setMobileNavOpen(true)
      return
    }

    onSelectBiome?.(index)
    if (isMobileLayout) setMobileNavOpen(false)
    else {
      setDesktopNavOpen(false)
      setDesktopHoverSuppressed(true)
    }
  }

  return (
    <div className="hud" aria-label="Navigation">
      <div className="hud-wordmark" aria-label="Odyssey by Peregr1ne">
        <span className="hud-wordmark-title">ODYSSEY</span>
        <span className="hud-wordmark-credit">
          <span>by </span>
          <a
            className="hud-wordmark-credit-link"
            href="https://github.com/kanwal-vyas"
            target="_blank"
            rel="noreferrer"
            aria-label="Peregr1ne on GitHub"
          >
            Peregr1ne
          </a>
        </span>
      </div>

      <div className="hud-actions">
        <ThemeTogglePill theme={theme} onToggle={handleThemeToggle} />
        <MusicToggle musicOn={musicOn} onToggle={onMusicToggle} />
        <MiniMap
          activeBiome={activeBiome}
          progressRef={progressRef}
          charPosRef={charPosRef}
        />
      </div>

      <aside
        ref={navRef}
        className={`hud-biome-panel${mobileNavOpen || desktopNavOpen ? ' open' : ''}${isMobileLayout ? ' mobile' : ''}${desktopHoverSuppressed ? ' hover-suppressed' : ''}`}
        onPointerEnter={() => {
          if (!isMobileLayout && !desktopHoverSuppressed) setDesktopNavOpen(true)
        }}
        onPointerLeave={() => {
          if (!isMobileLayout) {
            setDesktopNavOpen(false)
            setDesktopHoverSuppressed(false)
          }
        }}
      >
        <nav className="hud-biome-list" aria-label="World zones">
          {BIOMES.map((biome, index) => (
            <button
              key={index}
              type="button"
              className={`hud-zone${index === activeBiome ? ' active' : ''}`}
              data-index={index}
              onClick={() => handleZonePress(index)}
              ref={el => { zoneRefs.current[index] = el }}
            >
              <span className="hud-zone-name">{biome.name}</span>
              <span className="hud-zone-roman">{biome.roman}</span>
              <span className="hud-zone-dot" aria-hidden="true" />
            </button>
          ))}
        </nav>
      </aside>

      <div className={`hud-footer${isMobileLayout ? ' mobile-layout' : ''}`}>
        <BiomeCompass activeBiome={activeBiome} compact={isMobileLayout} />

        {!isMobileLayout && (
          <div className="movement-hint-label">
            Explore 4 worlds
          </div>
        )}
      </div>
    </div>
  )
}
