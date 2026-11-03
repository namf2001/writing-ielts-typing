"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-2xl border-2 border-[#141414] bg-white px-4 py-3 text-sm font-medium shadow-[3px_3px_0_#141414] transition-all duration-150 placeholder:text-muted-foreground/70 focus-visible:outline-3 focus-visible:outline-[#FFD43B] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y dark:border-[#384259] dark:bg-[#181C26] dark:shadow-[3px_3px_0_#0A0D14] dark:focus-visible:outline-[#FFC93C]",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"
