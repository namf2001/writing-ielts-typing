"use client"

import { RotateCcw, Timer, CheckCircle, Zap, Target } from "lucide-react"

interface StatsBarProps {
  isPaused: boolean
  progress: number
  wpm: number
  accuracy: number
  errors: number
  totalChars: number
  isCompleted?: boolean
}

export function StatsBar({ isPaused, progress, wpm, accuracy, errors, totalChars, isCompleted }: StatsBarProps) {
  return (
    <div className="flex items-center justify-between px-4 md:px-8 py-3 text-xs md:text-sm border-b-2 border-[#141414] bg-[#FAF7F0] dark:bg-[#11141B] dark:border-[#384259] select-none">
      <div className="flex items-center gap-3 md:gap-4 font-mono font-bold text-muted-foreground">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-[#141414]/30 bg-white dark:bg-[#181C26]">
          <RotateCcw className="w-3.5 h-3.5 text-[#F0573A]" />
          <span>{errors} lỗi</span>
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-[#141414]/30 bg-white dark:bg-[#181C26]">
          <Timer className="w-3.5 h-3.5 text-[#7FB2FF]" />
          <span>{totalChars} ký tự</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5 md:gap-4">
        {/* State Badge */}
        <span
          className={`px-3 py-1 rounded-full border-2 border-[#141414] font-mono text-[11px] font-black tracking-wider uppercase shadow-[2px_2px_0_#141414] ${
            isCompleted
              ? "bg-[#7CC243] text-[#141414]"
              : isPaused
                ? "bg-[#F0573A] text-white"
                : "bg-[#FFC93C] text-[#141414] animate-pulse"
          }`}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              HOÀN THÀNH
            </span>
          ) : isPaused ? (
            "TẠM DỪNG"
          ) : (
            "ĐANG GÕ"
          )}
        </span>

        {/* Progress */}
        <span className="px-2.5 py-1 rounded-xl border-2 border-[#141414] bg-white font-mono font-black text-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#181C26] dark:text-white dark:border-[#384259]">
          {progress.toFixed(0)}%
        </span>

        {/* WPM */}
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-[#141414] bg-[#FFF8EC] font-black text-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#181C26] dark:text-[#FFC93C] dark:border-[#384259]">
          <Zap className="w-3.5 h-3.5 text-[#FF9F0A]" />
          <span>{wpm}</span> <span className="font-mono text-[10px] text-muted-foreground uppercase">wpm</span>
        </span>

        {/* Accuracy */}
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 border-[#141414] bg-[#F0FDF4] font-black text-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#181C26] dark:text-[#7CC243] dark:border-[#384259]">
          <Target className="w-3.5 h-3.5 text-[#7CC243]" />
          <span>{accuracy.toFixed(0)}%</span>
        </span>
      </div>
    </div>
  )
}
