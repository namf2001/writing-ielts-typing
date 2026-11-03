"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TidArrowCtaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  arrowBg?: string
  arrowColor?: string
  bg?: string
  textColor?: string
}

export function TidArrowCta({
  children,
  arrowBg = "bg-[#FF9F0A]",
  arrowColor = "text-[#141414]",
  bg = "bg-[#141414]",
  textColor = "text-white",
  className,
  ...props
}: TidArrowCtaProps) {
  return (
    <div
      className={cn(
        "h24-cta group/cta inline-flex items-stretch rounded-xl border-2 border-[#141414] overflow-hidden cursor-pointer select-none dark:border-[#434D66]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid w-10 place-items-center font-black text-lg transition-transform duration-200 group-hover/cta:translate-x-0.5 border-r-2 border-[#141414] dark:border-[#434D66]",
          arrowBg,
          arrowColor
        )}
      >
        →
      </span>
      <span
        className={cn(
          "whitespace-nowrap px-4 py-2 text-sm font-extrabold flex items-center transition-colors",
          bg,
          textColor
        )}
      >
        {children}
      </span>
    </div>
  )
}
