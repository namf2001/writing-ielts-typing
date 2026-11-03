"use client"

import { useRef, useCallback, useEffect } from "react"
import { getSettings } from "@/lib/storage"

export type SoundTheme = "clicky" | "tactile" | "soft" | "typewriter"

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx()
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch(() => {})
    }
    return audioContextRef.current
  }, [])

  const getSettingsSound = useCallback(() => {
    if (typeof window === "undefined") {
      return { enabled: true, volume: 0.15, theme: "clicky" as SoundTheme }
    }
    const s = getSettings()
    return {
      enabled: s.soundEnabled,
      volume: s.soundVolume ?? 0.15,
      theme: (s.soundTheme || "clicky") as SoundTheme,
    }
  }, [])

  const playKeySound = useCallback(
    (customTheme?: SoundTheme) => {
      const { enabled, volume, theme } = getSettingsSound()
      if (!enabled || volume <= 0) return

      try {
        const ctx = getAudioContext()
        if (!ctx) return
        const now = ctx.currentTime
        const activeTheme = customTheme || theme

        if (activeTheme === "clicky") {
          // Sharp mechanical blue switch click
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.type = "sine"
          osc.frequency.setValueAtTime(1400, now)
          osc.frequency.exponentialRampToValueAtTime(500, now + 0.035)

          gain.gain.setValueAtTime(volume * 0.9, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

          osc.start(now)
          osc.stop(now + 0.035)
        } else if (activeTheme === "tactile") {
          // Deeper tactile thock (Brown switch)
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.type = "triangle"
          osc.frequency.setValueAtTime(550, now)
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.05)

          gain.gain.setValueAtTime(volume * 1.1, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

          osc.start(now)
          osc.stop(now + 0.05)
        } else if (activeTheme === "typewriter") {
          // Vintage metallic typewriter click
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.type = "sawtooth"
          osc.frequency.setValueAtTime(2200, now)
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.04)

          gain.gain.setValueAtTime(volume * 0.7, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

          osc.start(now)
          osc.stop(now + 0.04)
        } else {
          // Soft linear red switch
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)

          osc.type = "sine"
          osc.frequency.setValueAtTime(420, now)
          osc.frequency.exponentialRampToValueAtTime(240, now + 0.04)

          gain.gain.setValueAtTime(volume * 0.7, now)
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

          osc.start(now)
          osc.stop(now + 0.04)
        }
      } catch {
        // Silently catch audio context errors
      }
    },
    [getAudioContext, getSettingsSound]
  )

  const playSpaceSound = useCallback(() => {
    const { enabled, volume } = getSettingsSound()
    if (!enabled || volume <= 0) return

    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "sine"
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.07)

      gain.gain.setValueAtTime(volume * 1.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

      osc.start(now)
      osc.stop(now + 0.07)
    } catch {}
  }, [getAudioContext, getSettingsSound])

  const playErrorSound = useCallback(() => {
    const { enabled, volume } = getSettingsSound()
    if (!enabled || volume <= 0) return

    try {
      const ctx = getAudioContext()
      if (!ctx) return
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = "square"
      osc.frequency.setValueAtTime(160, now)
      osc.frequency.setValueAtTime(120, now + 0.04)

      gain.gain.setValueAtTime(volume * 0.8, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {}
  }, [getAudioContext, getSettingsSound])

  return { playKeySound, playErrorSound, playSpaceSound }
}
