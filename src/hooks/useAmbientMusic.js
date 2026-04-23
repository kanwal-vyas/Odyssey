/**
 * useAmbientMusic - Procedural generative ambient music via Web Audio API
 *
 * Each biome has its own scale, tempo, timbre, and reverb profile.
 * Music crossfades as the player moves between biomes.
 * No external files - 100% synthesized.
 */

import { useRef, useEffect, useCallback } from 'react'

const BIOME_PROFILES = [
  {
    name: 'grove',
    scale: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25],
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
    name: 'cave',
    scale: [138.59, 155.56, 185.0, 207.65, 233.08, 277.18, 311.13, 369.99],
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
    droneGain: 0.1,
    chordCycle: [[0, 2, 4], [0, 1, 5], [2, 4, 6], [0, 3, 5]],
  },
  {
    name: 'ocean',
    scale: [174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0, 440.0],
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
    name: 'ember',
    scale: [233.08, 261.63, 277.18, 329.63, 349.23, 415.3, 466.16, 523.25],
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
    name: 'cosmos',
    scale: [220.0, 246.94, 277.18, 329.63, 369.99, 440.0, 493.88, 554.37],
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

function makeReverb(ctx, time = 2.5, decay = 2.0) {
  const sr = ctx.sampleRate
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

function playNote(ctx, dest, freq, wave, gain, duration, startTime, detuneCents = 0) {
  const playLayer = (layerFreq, layerGain, layerDetune) => {
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const env = ctx.createGain()

    osc.type = wave
    osc.frequency.setValueAtTime(layerFreq, startTime)
    osc.detune.setValueAtTime(layerDetune + (Math.random() - 0.5) * 4, startTime)

    filter.type = 'lowpass'
    filter.frequency.value = 3200
    filter.Q.value = 0.4

    const attack = Math.min(duration * 0.25, 1.4)
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

  playLayer(freq, gain, detuneCents)
  playLayer(freq * 2, gain * 0.3, -detuneCents)
}

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

function playWind(ctx, dest, startTime) {
  const osc = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const env = ctx.createGain()

  filter.type = 'bandpass'
  filter.frequency.value = 600 + Math.random() * 1400
  filter.Q.value = 0.25

  osc.type = 'sawtooth'
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
  const ctxRef = useRef(null)
  const reverbRef = useRef(null)
  const masterRef = useRef(null)
  const dryRef = useRef(null)
  const wetRef = useRef(null)
  const timerRef = useRef(null)
  const profileRef = useRef(BIOME_PROFILES[0])
  const enabledRef = useRef(false)
  const stepRef = useRef(0)

  const clearScheduledLoop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const initAudio = useCallback(() => {
    if (ctxRef.current) return

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return

    const ctx = new AudioContextCtor()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.connect(ctx.destination)
    masterRef.current = master

    const dry = ctx.createGain()
    dry.gain.setValueAtTime(0.55, ctx.currentTime)
    dry.connect(master)
    dryRef.current = dry

    const reverb = makeReverb(ctx, BIOME_PROFILES[0].reverbTime, BIOME_PROFILES[0].reverbDecay)
    reverb.connect(master)
    reverbRef.current = reverb

    const wet = ctx.createGain()
    wet.gain.setValueAtTime(0.45, ctx.currentTime)
    wet.connect(reverb)
    wetRef.current = wet
  }, [])

  const updateReverb = useCallback((profile) => {
    const ctx = ctxRef.current
    if (!ctx || !wetRef.current || !masterRef.current) return

    const newReverb = makeReverb(ctx, profile.reverbTime, profile.reverbDecay)
    newReverb.connect(masterRef.current)
    wetRef.current.disconnect()
    wetRef.current.connect(newReverb)
    reverbRef.current = newReverb
  }, [])

  const scheduleNext = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || !enabledRef.current || document.hidden) return

    const profile = profileRef.current
    const now = ctx.currentTime
    const scale = profile.scale
    const step = stepRef.current
    const barDur = 7 / profile.tempo

    if (profile.subBass && (step === 0 || step % 8 === 0)) {
      const droneFreq = scale[0] * profile.droneMult
      playNote(ctx, dryRef.current, droneFreq, 'sine', profile.droneGain, barDur * 2.2, now, -3)
      playNote(ctx, wetRef.current, droneFreq, 'sine', profile.droneGain * 0.5, barDur * 2.2, now, 3)
    }

    if (step % 2 === 0) {
      const chordIndex = Math.floor(step / 2) % profile.chordCycle.length
      const chord = profile.chordCycle[chordIndex]
      chord.forEach((idx, voiceIndex) => {
        const octaveShift = idx >= scale.length ? 2 : 1
        const freq = scale[idx % scale.length] * octaveShift
        const detune = (voiceIndex - 1) * 5
        playNote(
          ctx,
          wetRef.current,
          freq,
          profile.padWave,
          profile.padGain - voiceIndex * 0.012,
          barDur,
          now + voiceIndex * 0.18,
          detune,
        )
      })
    }

    if (Math.random() < profile.arpDensity) {
      const noteCount = 2 + Math.floor(Math.random() * 5)
      const octaveMult = Math.random() > 0.4 ? 2 : 1
      for (let n = 0; n < noteCount; n++) {
        const idx = Math.floor(Math.random() * scale.length)
        const freq = scale[idx] * octaveMult
        const time = now + (n / noteCount) * (3.5 / profile.tempo)
        const duration = 0.9 + Math.random() * 0.8
        playNote(ctx, wetRef.current, freq, profile.arpWave, profile.arpGain, duration, time, (Math.random() - 0.5) * 6)
        if (profile.shimmer && Math.random() > 0.5) {
          playChime(ctx, wetRef.current, freq, time + 0.05)
        }
      }
    }

    if (Math.random() < 0.22) {
      playWind(ctx, wetRef.current, now)
    }

    stepRef.current += 1

    const nextMs = barDur * 1000 * (0.75 + Math.random() * 0.5)
    clearScheduledLoop()
    timerRef.current = setTimeout(scheduleNext, nextMs)
  }, [clearScheduledLoop])

  const pausePlayback = useCallback(() => {
    const ctx = ctxRef.current
    const master = masterRef.current

    clearScheduledLoop()
    if (!ctx || !master || ctx.state === 'closed') return

    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setValueAtTime(0, ctx.currentTime)

    if (ctx.state === 'running') {
      void ctx.suspend().catch(() => {})
    }
  }, [clearScheduledLoop])

  const resumePlayback = useCallback(() => {
    if (!enabledRef.current || document.hidden) return

    initAudio()

    const ctx = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master || ctx.state === 'closed') return

    const resumePromise = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve()

    void resumePromise.then(() => {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
      master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 1.2)

      if (!timerRef.current) {
        stepRef.current = 0
        scheduleNext()
      }
    }).catch(() => {})
  }, [initAudio, scheduleNext])

  const setBiome = useCallback((index) => {
    const profile = BIOME_PROFILES[Math.min(index, BIOME_PROFILES.length - 1)]
    if (profile === profileRef.current) return

    profileRef.current = profile
    stepRef.current = 0
    updateReverb(profile)
  }, [updateReverb])

  const toggleMusic = useCallback((on) => {
    enabledRef.current = on

    if (on) {
      resumePlayback()
      return
    }

    pausePlayback()
  }, [pausePlayback, resumePlayback])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausePlayback()
        return
      }

      if (enabledRef.current) {
        resumePlayback()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', pausePlayback)
    window.addEventListener('beforeunload', pausePlayback)
    window.addEventListener('pageshow', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', pausePlayback)
      window.removeEventListener('beforeunload', pausePlayback)
      window.removeEventListener('pageshow', handleVisibilityChange)
      pausePlayback()
      void ctxRef.current?.close?.()
    }
  }, [pausePlayback, resumePlayback])

  return { toggleMusic, setBiome, profiles: BIOME_PROFILES }
}
