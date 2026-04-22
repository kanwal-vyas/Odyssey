import React, { useState, useEffect, useCallback } from 'react'
import './intro.css'

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('odyssey-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch (_) {}

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'dark'
}

function IntroMusicToggle({ musicOn, onToggle }) {
  return (
    <button
      className={`intro-music-toggle${musicOn ? ' active' : ''}`}
      onClick={onToggle}
      aria-label={musicOn ? 'Mute music' : 'Play music'}
      title={musicOn ? 'Mute music' : 'Play music'}
    >
      <span className="intro-eq-bars" aria-hidden="true">
        {[1, 0.6, 0.85].map((h, i) => (
          <span key={i} style={{
            height: musicOn ? `${h * 14}px` : '4px',
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </span>
      <span className="intro-control-label">Music</span>
    </button>
  )
}

export default function Intro({ onEnter, onSkip, onThemeChange, musicOn = false, onMusicToggle }) {
  const [theme, setTheme]     = useState(getInitialTheme)
  const [leaving, setLeaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('odyssey-theme', theme) } catch (_) {}
    onThemeChange?.(theme)
  }, [theme, onThemeChange])

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleEnter = useCallback(() => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => onEnter(), 900)
  }, [leaving, onEnter])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      handleEnter()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleEnter])

  const toggleTheme = () =>
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  const isDark = theme === 'dark'

  return (
    <div
      className={`intro-overlay ${mounted ? 'intro-mounted' : ''} ${leaving ? 'intro-leaving' : ''}`}
      aria-label="Odyssey intro screen"
    >
      <div className="intro-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="orb orb-5" />
        <div className="orb orb-6" />
      </div>

      <div className="intro-grain" aria-hidden="true" />

      <div className="intro-actions">
        <button
          className="intro-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <span className="intro-toggle-track" aria-hidden="true">
            <span className="intro-toggle-thumb" />
          </span>
          <span className="intro-control-label">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>
        <IntroMusicToggle musicOn={musicOn} onToggle={onMusicToggle} />
      </div>

      <div className="intro-center">
        <div className="intro-title-band">
          <span className="eyebrow-line" />
          <div className="intro-title-lockup">
            <h1 className="intro-title" aria-label="Odyssey">
              {'Odyssey'.split('').map((char, i) => (
                <span
                  key={i}
                  className="title-char"
                  style={{
                    '--char-index': i,
                    '--char-total': 7,
                  }}
                >
                  {char}
                </span>
              ))}
            </h1>
            <div className="intro-title-credit">
              <span>by </span>
              <a
                className="intro-title-credit-link"
                href="https://github.com/kanwal-vyas"
                target="_blank"
                rel="noreferrer"
                aria-label="Peregr1ne on GitHub"
              >
                Peregr1ne
              </a>
            </div>
          </div>
          <span className="eyebrow-line" />
        </div>

        <p className="intro-subtitle">
          An immersive world, yours to explore.
        </p>

        <button
          className="intro-cta"
          onClick={handleEnter}
          aria-label="Enter the world"
        >
          <span className="cta-text">Enter</span>
          <span className="cta-arrow" aria-hidden="true">-&gt;</span>
          <span className="cta-glow" aria-hidden="true" />
        </button>

      </div>

      <footer className="intro-footer" aria-label="Controls hint">
        <span className="footer-text">
          Use <kbd>W A S D</kbd> or arrow keys to navigate
        </span>
      </footer>
    </div>
  )
}

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.dataset.theme || 'dark')
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  return theme
}
