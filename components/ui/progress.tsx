"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  value?: number
  max?: number
  indicatorClassName?: string
}) {
  const percentage = Math.min(100, Math.max(0, ((value ?? 0) / (max || 100)) * 100))

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-300 ease-out rounded-full",
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  )
}
