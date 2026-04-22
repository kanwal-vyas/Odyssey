import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import './index.css'
import Intro from './Intro'
import HUD from './components/HUD'
import World, { BIOMES, BIOME_Z_POSITIONS, WORLD_DEPTH } from './World'
import ScreenEffects from './components/ScreenEffects'
import BiomeLoreCard from './components/BiomeLoreCard'
import JourneyContinueCard from './components/JourneyContinueCard'
import EndPortalOverlay from './components/EndPortalOverlay'
import MobileJoystick from './components/MobileJoystick'
import { getInitialTheme, applyTheme } from './hooks/useTheme'
import { useAmbientMusic } from './hooks/useAmbientMusic'

function useStringTune(progressRef) {
  useEffect(() => {
    let instance = null, cancelled = false, rafId = null
    const init = async () => {
      try {
        const mod = await import('@fiddle-digital/string-tune')
        if (cancelled) return
        const StringTune = mod.default ?? mod.StringTune ?? mod
        if (typeof StringTune !== 'function' && typeof StringTune !== 'object') return
        const sentinel = document.createElement('div')
        sentinel.id = 'string-tune-sentinel'
        sentinel.style.cssText = 'position:fixed;pointer-events:none;opacity:0;z-index:-1;'
        document.body.appendChild(sentinel)
        try {
          if (typeof StringTune === 'function')    instance = new StringTune({ target: sentinel })
          else if (StringTune.create) instance = StringTune.create({ target: sentinel })
          else if (StringTune.init)   instance = StringTune.init({ target: sentinel })
          if (instance && typeof instance.setProgress === 'function') {
            const tick = () => {
              if (cancelled) return
              if (progressRef?.current != null) {
                try { instance.setProgress(progressRef.current) } catch (_) {}
              }
              rafId = requestAnimationFrame(tick)
            }
            rafId = requestAnimationFrame(tick)
          }
        } catch (e) { console.warn('[StringTune] Construction error:', e) }
      } catch (e) { console.warn('[StringTune] Import error:', e) }
    }
    init()
    return () => {
      cancelled = true
      if (rafId != null) cancelAnimationFrame(rafId)
      try { instance?.destroy?.() } catch (_) {}
      document.getElementById('string-tune-sentinel')?.remove()
    }
  }, [])
}

export default function App() {
  const progressBarRef  = useRef(null)
  const zoneRefs        = useRef([])
  const progressRef     = useRef(0)
  const charPosRef      = useRef(new THREE.Vector3(0, 0, 8))
  const charRotYRef     = useRef(Math.PI)
  const virtualInputRef = useRef({ dx: 0, dz: 0 })

  const [showIntro, setShowIntro]           = useState(true)
  const [introUnmounted, setIntroUnmounted] = useState(false)

  // ── Theme ──────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(getInitialTheme)
  const isDark = theme === 'dark'
  useEffect(() => { applyTheme(theme) }, [theme])
  const handleThemeChange = useCallback((t) => setTheme(t), [])

  // ── Biome tracking ─────────────────────────────────────────────────
  const [activeBiome, setActiveBiome] = useState(0)
  const [loreKey, setLoreKey]         = useState(null)
  const [journeyComplete, setJourneyComplete] = useState(false)
  const [journeyCardKey, setJourneyCardKey] = useState(null)
  const journeyReachedRef = useRef(false)

  // ── Music ──────────────────────────────────────────────────────────
  const [musicOn, setMusicOn] = useState(false)
  const { toggleMusic, setBiome: setMusicBiome } = useAmbientMusic()

  const handleMusicToggle = useCallback(() => {
    const next = !musicOn
    setMusicOn(next)
    toggleMusic(next)
  }, [musicOn, toggleMusic])

  const handleBiomeChange = useCallback((index) => {
    setActiveBiome(index)
    setLoreKey(prev => (prev ?? 0) + 1)
    if (musicOn) setMusicBiome(index)
  }, [musicOn, setMusicBiome])

  // ── Intro ──────────────────────────────────────────────────────────
  const handleIntroEnter = useCallback(() => {
    setTimeout(() => setIntroUnmounted(true), 920)
    setShowIntro(false)
    setTimeout(() => {
      setMusicOn(true)
      toggleMusic(true)
    }, 1000)
  }, [toggleMusic])

  // ── End Portal — begin again ───────────────────────────────────────
  const [portalFlashing, setPortalFlashing] = useState(false)

  const handleBeginAgain = useCallback(() => {
    setPortalFlashing(true)
    setTimeout(() => {
      progressRef.current = 0
      charPosRef.current.set(0, 0, 8)
      charRotYRef.current = Math.PI
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%'
      }
      setActiveBiome(0)
      setLoreKey(null)
      setJourneyComplete(false)
      setJourneyCardKey(null)
      journeyReachedRef.current = false
      if (musicOn) setMusicBiome(0)
      setIntroUnmounted(false)
      setShowIntro(true)
      setTimeout(() => setPortalFlashing(false), 80)
    }, 900)
  }, [musicOn, setMusicBiome])

  // ── Progress & zone tracking ───────────────────────────────────────
  const handleProgress = useCallback((offset) => {
    progressRef.current = offset
    const reachedEnd = offset >= 0.999
    setJourneyComplete(reachedEnd)
    if (reachedEnd && !journeyReachedRef.current) {
      journeyReachedRef.current = true
      setJourneyCardKey(prev => (prev ?? 0) + 1)
    } else if (!reachedEnd && journeyReachedRef.current) {
      journeyReachedRef.current = false
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${offset * 100}%`
    }
    const n = BIOMES.length
    zoneRefs.current.forEach((el, i) => {
      if (!el) return
      const min = i / n
      const max = i < n - 1 ? (i + 1) / n : 1.01
      el.classList.toggle('active', offset >= min && offset < max)
    })
  }, [])

  const handleSelectBiome = useCallback((index) => {
    const targetZ = (BIOME_Z_POSITIONS[index] ?? 0) + 8
    charPosRef.current.set(0, 0, targetZ)
    charRotYRef.current = Math.PI
    setJourneyComplete(false)
    journeyReachedRef.current = false
    const p = THREE.MathUtils.clamp(
      THREE.MathUtils.inverseLerp(8, -WORLD_DEPTH, targetZ), 0, 1
    )
    handleProgress(p)
    handleBiomeChange(index)
  }, [handleBiomeChange, handleProgress])

  useStringTune(progressRef)

  return (
    <>
      {!introUnmounted && (
        <Intro
          onEnter={handleIntroEnter}
          onSkip={handleIntroEnter}
          onThemeChange={handleThemeChange}
          musicOn={musicOn}
          onMusicToggle={handleMusicToggle}
        />
      )}

      <ScreenEffects biomeIndex={activeBiome} isDark={isDark} />
      <EndPortalOverlay isFlashing={portalFlashing} isDark={isDark} />

      {!showIntro && (
        <BiomeLoreCard biomeIndex={activeBiome} triggerKey={loreKey} />
      )}

      {!showIntro && (
        <JourneyContinueCard
          triggerKey={journeyCardKey}
          isDark={isDark}
          active={journeyComplete}
        />
      )}

      <div className="progress-track" aria-hidden="true">
        <div className="progress-bar" ref={progressBarRef}
          style={{ width: '0%', transition: 'none' }} />
      </div>

      <HUD
        zoneRefs={zoneRefs}
        theme={theme}
        setTheme={setTheme}
        musicOn={musicOn}
        onMusicToggle={handleMusicToggle}
        activeBiome={activeBiome}
        onSelectBiome={handleSelectBiome}
      />

      {!showIntro && (
        <MobileJoystick inputRef={virtualInputRef} />
      )}

      <div className="canvas-wrapper">
        <Canvas
          dpr={[0.85, 1.15]}
          frameloop="always"
          camera={{ position: [0, 4.5, 18], fov: 55, near: 0.1, far: 800 }}
          gl={{
            antialias: false,
            alpha: false,
            powerPreference: 'high-performance',
            // ── CRITICAL: disable tone mapping so meshBasicMaterial
            //    colors render at full brightness without ACESFilmic
            //    compression crushing the green orb glow to black ──
            toneMapping: THREE.NoToneMapping,
          }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.15))
          }}
        >
          {/* key={theme} REMOVED — it was destroying/remounting the entire
              3D scene on every theme toggle, resetting all animation state.
              isDark is passed as a prop instead and handled reactively. */}
          <World
            onProgress={handleProgress}
            progressRef={progressRef}
            charPosRef={charPosRef}
            charRotYRef={charRotYRef}
            isDark={isDark}
            onBiomeChange={handleBiomeChange}
            onBeginAgain={handleBeginAgain}
            isJourneyComplete={journeyComplete}
            virtualInputRef={virtualInputRef}
          />
        </Canvas>
      </div>
    </>
  )
}
