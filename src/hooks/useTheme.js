import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark'
  )

  useEffect(() => {
    // Sync immediately in case it changed before mount
    setTheme(document.documentElement.dataset.theme || 'dark')

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

/** Toggle helper — call from anywhere */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try { localStorage.setItem('odyssey-theme', theme) } catch (_) {}
}

export function getInitialTheme() {
  try {
    const stored = localStorage.getItem('odyssey-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch (_) {}
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'dark'
}