import { useEffect, useState } from 'react'

function getDeviceProfile() {
  if (typeof window === 'undefined') {
    return { quality: 'medium', isTouch: false, prefersReducedMotion: false }
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  const isTouch = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
  const width = window.innerWidth || 1280
  const memory = navigator.deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8

  let quality = 'high'

  if (
    prefersReducedMotion ||
    width < 768 ||
    memory <= 4 ||
    cores <= 4
  ) {
    quality = 'low'
  } else if (
    width < 1200 ||
    memory <= 8 ||
    cores <= 8 ||
    isTouch
  ) {
    quality = 'medium'
  }

  return { quality, isTouch, prefersReducedMotion }
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState(getDeviceProfile)

  useEffect(() => {
    const updateProfile = () => setProfile(getDeviceProfile())
    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')

    window.addEventListener('resize', updateProfile)
    motionQuery?.addEventListener?.('change', updateProfile)

    return () => {
      window.removeEventListener('resize', updateProfile)
      motionQuery?.removeEventListener?.('change', updateProfile)
    }
  }, [])

  return profile
}
