"use client"

import { useRef, useCallback } from "react"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playKeySound = useCallback(() => {
    try {
      const audioContext = getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.05)

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.05)
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }, [getAudioContext])

  const playErrorSound = useCallback(() => {
    try {
      const audioContext = getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "square"
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime)

      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }, [getAudioContext])

  const playSpaceSound = useCallback(() => {
    try {
      const audioContext = getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.08)

      gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.08)
    } catch (e) {
      // Silently fail if audio context is not available
    }
  }, [getAudioContext])

  return { playKeySound, playErrorSound, playSpaceSound }
}
