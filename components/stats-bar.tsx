"use client"

import { RotateCcw, Timer, CheckCircle } from "lucide-react"

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
    <div className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 text-xs md:text-sm border-b border-border/50">
      <div className="flex items-center gap-3 md:gap-4 text-muted-foreground">
        <span className="flex items-center gap-1 md:gap-2">
          <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
          {errors}
        </span>
        <span className="flex items-center gap-1 md:gap-2">
          <Timer className="w-3 h-3 md:w-4 md:h-4" />
          {totalChars}
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <span
          className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-medium ${
            isCompleted
              ? "bg-accent/20 text-accent"
              : isPaused
                ? "bg-destructive/20 text-destructive"
                : "bg-primary/20 text-primary"
          }`}
        >
          {isCompleted ? (
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              HOÀN THÀNH
            </span>
          ) : isPaused ? (
            "TẠM DỪNG"
          ) : (
            "ĐANG GÕ"
          )}
        </span>

        <span className="text-muted-foreground">
          <span className="text-primary font-medium">{progress.toFixed(1)}%</span>
        </span>

        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">{wpm}</span> wpm
        </span>

        <span className="text-muted-foreground">
          <span
            className={`font-medium ${accuracy >= 90 ? "text-accent" : accuracy >= 70 ? "text-primary" : "text-destructive"}`}
          >
            {accuracy.toFixed(1)}%
          </span>{" "}
          acc
        </span>
      </div>
    </div>
  )
}
