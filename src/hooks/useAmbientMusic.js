/**
 * useAmbientMusic — Procedural generative ambient music via Web Audio API
 *
 * Each biome has its own scale, tempo, timbre, and reverb profile.
 * Music crossfades as the player moves between biomes.
 * No external files — 100% synthesized.
 */

import { useRef, useEffect, useCallback } from 'react'

// ── Biome music profiles ────────────────────────────────────────────
const BIOME_PROFILES = [
  {
    // 0 — Whispering Grove
    name: 'grove',
    // C major pentatonic — bright, open, natural
    scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
    padWave: 'sine',
    arpWave: 'triangle',
    padGain: 0.08,
    arpGain: 0.045,
    reverbTime: 2.8,
    reverbDecay: 1.9,
    tempo: 0.38,
    arpDensity: 0.42,
    subBass: false,
    shimmer: false,
    droneMult: 1,
    droneGain: 0.06,
    chordCycle: [[0, 2, 4], [0, 3, 5], [1, 3, 6], [0, 2, 5]],
  },
  {
    // 1 — Crystal Caverns
    name: 'cave',
    // C# minor — dark, resonant, deep
    scale: [138.59, 155.56, 185.00, 207.65, 233.08, 277.18, 311.13, 369.99],
    padWave: 'sine',
    arpWave: 'sine',
    padGain: 0.07,
    arpGain: 0.035,
    reverbTime: 5.5,
    reverbDecay: 1.6,
    tempo: 0.22,
    arpDensity: 0.28,
    subBass: true,
    shimmer: true,
    droneMult: 0.5,
    droneGain: 0.10,
    chordCycle: [[0, 2, 4], [0, 1, 5], [2, 4, 6], [0, 3, 5]],
  },
  {
    // 2 — Abyssal Ocean
    name: 'ocean',
    // F Lydian — expansive, floating, luminous
    scale: [174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00],
    padWave: 'sine',
    arpWave: 'sine',
    padGain: 0.09,
    arpGain: 0.03,
    reverbTime: 6.0,
    reverbDecay: 1.5,
    tempo: 0.18,
    arpDensity: 0.22,
    subBass: true,
    shimmer: false,
    droneMult: 0.5,
    droneGain: 0.12,
    chordCycle: [[0, 2, 4], [0, 2, 5], [1, 3, 5], [0, 3, 6]],
  },
  {
    // 3 — Ember Wastes
    name: 'ember',
    // Bb diminished — tense, smoldering, harsh
    scale: [233.08, 261.63, 277.18, 329.63, 349.23, 415.30, 466.16, 523.25],
    padWave: 'sawtooth',
    arpWave: 'square',
    padGain: 0.06,
    arpGain: 0.04,
    reverbTime: 1.8,
    reverbDecay: 2.2,
    tempo: 0.55,
    arpDensity: 0.45,
    subBass: true,
    shimmer: false,
    droneMult: 1,
    droneGain: 0.08,
    chordCycle: [[0, 2, 5], [1, 3, 6], [0, 3, 5], [2, 4, 7]],
  },
  {
    // 4 — Cosmos
    name: 'cosmos',
    // A major — vast, meditative, celestial
    scale: [220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 554.37],
    padWave: 'sine',
    arpWave: 'sine',
    padGain: 0.07,
    arpGain: 0.025,
    reverbTime: 7.0,
    reverbDecay: 1.4,
    tempo: 0.15,
    arpDensity: 0.18,
    subBass: true,
    shimmer: true,
    droneMult: 0.5,
    droneGain: 0.08,
    chordCycle: [[0, 2, 5], [0, 3, 6], [1, 4, 6], [0, 2, 4]],
  },
]

// ── Helper: convolution reverb from shaped impulse noise ────────────
function makeReverb(ctx, time = 2.5, decay = 2.0) {
  const sr  = ctx.sampleRate
  const len = Math.floor(sr * time)
  const buf = ctx.createBuffer(2, len, sr)
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c)
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  const conv = ctx.createConvolver()
  conv.buffer = buf
  return conv
}

// ── Helper: play a shaped pad / arp note with layered harmonics ─────
//   Plays the fundamental + a soft octave-up copy for warmth.
//   A gentle low-pass filter removes any digital harshness.
function playNote(ctx, dest, freq, wave, gain, duration, startTime, detuneCents = 0) {
  const playLayer = (layerFreq, layerGain, layerDetune) => {
    const osc    = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const env    = ctx.createGain()

    osc.type = wave
    osc.frequency.setValueAtTime(layerFreq, startTime)
    osc.detune.setValueAtTime(layerDetune + (Math.random() - 0.5) * 4, startTime)

    filter.type            = 'lowpass'
    filter.frequency.value = 3200
    filter.Q.value         = 0.4

    // Proportional attack/release — long notes breathe, short ones bite
    const attack  = Math.min(duration * 0.25, 1.4)
    const release = Math.min(duration * 0.35, 1.8)

    env.gain.setValueAtTime(0, startTime)
    env.gain.linearRampToValueAtTime(layerGain, startTime + attack)
    env.gain.setValueAtTime(layerGain, startTime + duration - release)
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    osc.connect(filter)
    filter.connect(env)
    env.connect(dest)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
  }

  // Fundamental
  playLayer(freq, gain, detuneCents)
  // Octave-up harmonic at 30% gain for body
  playLayer(freq * 2, gain * 0.3, -detuneCents)
}

// ── Helper: shimmer chime (high sine, fast decay) ───────────────────
function playChime(ctx, dest, freq, startTime) {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq * 4, startTime)
  env.gain.setValueAtTime(0, startTime)
  env.gain.linearRampToValueAtTime(0.022, startTime + 0.04)
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.8)
  osc.connect(env)
  env.connect(dest)
  osc.start(startTime)
  osc.stop(startTime + 3)
}

// ── Helper: wind / texture noise burst ─────────────────────────────
function playWind(ctx, dest, startTime) {
  const osc    = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const env    = ctx.createGain()

  filter.type            = 'bandpass'
  filter.frequency.value = 600 + Math.random() * 1400
  filter.Q.value         = 0.25

  osc.type            = 'sawtooth'
  osc.frequency.value = 30 + Math.random() * 50

  env.gain.setValueAtTime(0, startTime)
  env.gain.linearRampToValueAtTime(0.012, startTime + 1.2)
  env.gain.linearRampToValueAtTime(0, startTime + 4.5)

  osc.connect(filter)
  filter.connect(env)
  env.connect(dest)
  osc.start(startTime)
  osc.stop(startTime + 5)
}

export function useAmbientMusic() {
  const ctxRef     = useRef(null)
  const reverbRef  = useRef(null)
  const masterRef  = useRef(null)
  const dryRef     = useRef(null)
  const wetRef     = useRef(null)
  const timerRef   = useRef(null)
  const profileRef = useRef(BIOME_PROFILES[0])
  const enabledRef = useRef(false)
  const stepRef    = useRef(0)

  // ── Bootstrap audio context (call on first user gesture) ──────────
  const initAudio = useCallback(() => {
    if (ctxRef.current) return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)
    masterRef.current = master

    // Dry bus — direct signal
    const dry = ctx.createGain()
    dry.gain.setValueAtTime(0.55, ctx.currentTime)
    dry.connect(master)
    dryRef.current = dry

    // Wet bus — through convolution reverb
    const reverb = makeReverb(ctx, BIOME_PROFILES[0].reverbTime, BIOME_PROFILES[0].reverbDecay)
    reverb.connect(master)
    reverbRef.current = reverb

    const wet = ctx.createGain()
    wet.gain.setValueAtTime(0.45, ctx.currentTime)
    wet.connect(reverb)
    wetRef.current = wet
  }, [])

  // ── Rebuild reverb when biome changes ─────────────────────────────
  const updateReverb = useCallback((p) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const newReverb = makeReverb(ctx, p.reverbTime, p.reverbDecay)
    newReverb.connect(masterRef.current)
    wetRef.current.disconnect()
    wetRef.current.connect(newReverb)
    reverbRef.current = newReverb
  }, [])

  // ── Schedule the next musical event ────────────────────────────────
  const scheduleNext = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !enabledRef.current) return

    const p     = profileRef.current
    const now   = ctx.currentTime
    const scale = p.scale
    const step  = stepRef.current
    const barDur = 7 / p.tempo   // seconds per logical bar

    // ── Sub-bass drone (root, very slow reset) ─────────────────────
    if (p.subBass && (step === 0 || step % 8 === 0)) {
      const droneFreq = scale[0] * p.droneMult
      playNote(ctx, dryRef.current, droneFreq, 'sine', p.droneGain,       barDur * 2.2, now, -3)
      playNote(ctx, wetRef.current, droneFreq, 'sine', p.droneGain * 0.5, barDur * 2.2, now,  3)
    }

    // ── Pad chord (3 voices, slight stagger) ──────────────────────
    if (step % 2 === 0) {
      const ci    = Math.floor(step / 2) % p.chordCycle.length
      const chord = p.chordCycle[ci]
      chord.forEach((idx, vi) => {
        const octaveShift = idx >= scale.length ? 2 : 1
        const freq        = scale[idx % scale.length] * octaveShift
        // Each voice slightly detuned for ensemble width
        const detune = (vi - 1) * 5
        playNote(ctx, wetRef.current, freq, p.padWave, p.padGain - vi * 0.012, barDur, now + vi * 0.18, detune)
      })
    }

    // ── Arpeggio / melodic movement ───────────────────────────────
    if (Math.random() < p.arpDensity) {
      const noteCount  = 2 + Math.floor(Math.random() * 5)
      const octaveMult = Math.random() > 0.4 ? 2 : 1
      for (let n = 0; n < noteCount; n++) {
        const idx  = Math.floor(Math.random() * scale.length)
        const freq = scale[idx] * octaveMult
        const t    = now + (n / noteCount) * (3.5 / p.tempo)
        const dur  = 0.9 + Math.random() * 0.8
        playNote(ctx, wetRef.current, freq, p.arpWave, p.arpGain, dur, t, (Math.random() - 0.5) * 6)
        if (p.shimmer && Math.random() > 0.5) playChime(ctx, wetRef.current, freq, t + 0.05)
      }
    }

    // ── Occasional wind texture ───────────────────────────────────
    if (Math.random() < 0.22) {
      playWind(ctx, wetRef.current, now)
    }

    stepRef.current++

    // Jitter the interval slightly so events never feel mechanical
    const nextMs = (barDur * 1000) * (0.75 + Math.random() * 0.5)
    timerRef.current = setTimeout(scheduleNext, nextMs)
  }, [])

  // ── Public: switch biome (0 – 4) ──────────────────────────────────
  const setBiome = useCallback((index) => {
    const p = BIOME_PROFILES[Math.min(index, BIOME_PROFILES.length - 1)]
    if (p === profileRef.current) return
    profileRef.current = p
    stepRef.current    = 0
    updateReverb(p)
  }, [updateReverb])

  // ── Public: toggle music on / off with graceful fade ──────────────
  const toggleMusic = useCallback((on) => {
    initAudio()
    enabledRef.current = on
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return

    if (on) {
      if (ctx.state === 'suspended') ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.8)
      stepRef.current = 0
      scheduleNext()
    } else {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [initAudio, scheduleNext])

  // ── Cleanup ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      ctxRef.current?.close()
    }
  }, [])

  return { toggleMusic, setBiome, profiles: BIOME_PROFILES }
}