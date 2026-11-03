"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  id?: string
}

export function Slider({
  value,
  defaultValue = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
  id,
}: SliderProps) {
  const currentValue = value?.[0] ?? defaultValue[0] ?? 0

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <input
        type="range"
        id={id}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        value={currentValue}
        onChange={(e) => onValueChange?.([parseFloat(e.target.value)])}
        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
