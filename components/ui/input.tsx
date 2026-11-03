"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-[#141414] bg-white px-3.5 py-2 text-sm font-medium shadow-[3px_3px_0_#141414] transition-all duration-150 file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-muted-foreground/70 focus-visible:outline-3 focus-visible:outline-[#FFD43B] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#384259] dark:bg-[#181C26] dark:shadow-[3px_3px_0_#0A0D14] dark:focus-visible:outline-[#FFC93C]",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
