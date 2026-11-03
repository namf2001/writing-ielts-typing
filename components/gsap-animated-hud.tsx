"use client"

import { useRef, useEffect } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Flame, Target, Zap, Clock } from "lucide-react"

gsap.registerPlugin(useGSAP)

interface GsapAnimatedHudProps {
  wpm?: number
  accuracy?: number
  streak?: number
  totalWords?: number
  isTyping?: boolean
}

export function GsapAnimatedHud({
  wpm = 0,
  accuracy = 100,
  streak = 0,
  totalWords = 0,
  isTyping = false,
}: GsapAnimatedHudProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wpmValRef = useRef<HTMLSpanElement>(null)
  const accValRef = useRef<HTMLSpanElement>(null)
  const streakValRef = useRef<HTMLSpanElement>(null)
  const wordsValRef = useRef<HTMLSpanElement>(null)

  // Animated number count-up with GSAP
  useEffect(() => {
    if (!wpmValRef.current || !accValRef.current) return

    const targets = {
      wpm: 0,
      accuracy: 0,
      streak: 0,
      words: 0,
    }

    gsap.to(targets, {
      wpm,
      accuracy,
      streak,
      words: totalWords,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        if (wpmValRef.current) wpmValRef.current.textContent = Math.round(targets.wpm).toString()
        if (accValRef.current) accValRef.current.textContent = `${Math.round(targets.accuracy)}%`
        if (streakValRef.current) streakValRef.current.textContent = Math.round(targets.streak).toString()
        if (wordsValRef.current) wordsValRef.current.textContent = Math.round(targets.words).toLocaleString()
      },
    })
  }, [wpm, accuracy, streak, totalWords])

  // Card staggered entrance on mount
  useGSAP(
    () => {
      gsap.from(".hud-stat-card", {
        y: 15,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power3.out",
      })
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full"
    >
      {/* 01 WPM */}
      <div className="hud-stat-card group relative p-4 rounded-2xl border-[3px] border-[#141414] bg-[#FFF8EC] dark:bg-[#181C26] dark:border-[#384259] shadow-[4px_4px_0_#141414] dark:shadow-[4px_4px_0_#0A0D14] hover:shadow-[6px_6px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-center justify-between text-xs mb-1 font-bold">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="bg-[#141414] text-white px-1.5 py-0.5 rounded text-[10px]">01</span>
            Tốc độ
          </span>
          <span className="p-1 rounded-lg bg-[#FFC93C] border-1.5 border-[#141414]">
            <Zap className={`w-3.5 h-3.5 text-[#141414] ${isTyping ? "animate-bounce" : ""}`} />
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span ref={wpmValRef} className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] dark:text-[#FFC93C]">
            {wpm}
          </span>
          <span className="text-xs font-bold text-muted-foreground uppercase">wpm</span>
        </div>
      </div>

      {/* 02 Accuracy */}
      <div className="hud-stat-card group relative p-4 rounded-2xl border-[3px] border-[#141414] bg-[#F0FDF4] dark:bg-[#181C26] dark:border-[#384259] shadow-[4px_4px_0_#141414] dark:shadow-[4px_4px_0_#0A0D14] hover:shadow-[6px_6px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-center justify-between text-xs mb-1 font-bold">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="bg-[#141414] text-white px-1.5 py-0.5 rounded text-[10px]">02</span>
            Chính xác
          </span>
          <span className="p-1 rounded-lg bg-[#7CC243] border-1.5 border-[#141414]">
            <Target className="w-3.5 h-3.5 text-[#141414]" />
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span ref={accValRef} className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] dark:text-[#7CC243]">
            {accuracy}%
          </span>
        </div>
      </div>

      {/* 03 Streak */}
      <div className="hud-stat-card group relative p-4 rounded-2xl border-[3px] border-[#141414] bg-[#FFF1F2] dark:bg-[#181C26] dark:border-[#384259] shadow-[4px_4px_0_#141414] dark:shadow-[4px_4px_0_#0A0D14] hover:shadow-[6px_6px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-center justify-between text-xs mb-1 font-bold">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="bg-[#141414] text-white px-1.5 py-0.5 rounded text-[10px]">03</span>
            Chuỗi bài
          </span>
          <span className="p-1 rounded-lg bg-[#F0573A] border-1.5 border-[#141414]">
            <Flame className="w-3.5 h-3.5 text-white" />
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span ref={streakValRef} className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] dark:text-[#F0573A]">
            {streak}
          </span>
          <span className="text-xs font-bold text-muted-foreground">bài</span>
        </div>
      </div>

      {/* 04 Total Words */}
      <div className="hud-stat-card group relative p-4 rounded-2xl border-[3px] border-[#141414] bg-[#EFF6FF] dark:bg-[#181C26] dark:border-[#384259] shadow-[4px_4px_0_#141414] dark:shadow-[4px_4px_0_#0A0D14] hover:shadow-[6px_6px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150">
        <div className="flex items-center justify-between text-xs mb-1 font-bold">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="bg-[#141414] text-white px-1.5 py-0.5 rounded text-[10px]">04</span>
            Tổng từ
          </span>
          <span className="p-1 rounded-lg bg-[#7FB2FF] border-1.5 border-[#141414]">
            <Clock className="w-3.5 h-3.5 text-[#141414]" />
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <span ref={wordsValRef} className="text-2xl sm:text-3xl font-black tracking-tight text-[#141414] dark:text-[#7FB2FF]">
            {totalWords}
          </span>
          <span className="text-xs font-bold text-muted-foreground">từ</span>
        </div>
      </div>
    </div>
  )
}
