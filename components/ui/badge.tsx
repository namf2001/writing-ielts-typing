"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "glow"
    | "yellow"
    | "green"
    | "coral"
    | "blue"
    | "purple"
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259] dark:shadow-[2px_2px_0_#0A0D14]"

  const variants: Record<string, string> = {
    default:
      "bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414]",
    secondary:
      "bg-[#FFF2D9] text-[#141414] dark:bg-[#232938] dark:text-[#F6F7F9]",
    destructive:
      "bg-[#F0573A] text-white",
    outline:
      "bg-white dark:bg-[#181C26] text-foreground",
    success:
      "bg-[#7CC243] text-[#141414]",
    warning:
      "bg-[#FF9F0A] text-[#141414]",
    info:
      "bg-[#7FB2FF] text-[#141414]",
    yellow:
      "bg-[#FFC93C] text-[#141414]",
    green:
      "bg-[#7CC243] text-[#141414]",
    coral:
      "bg-[#F0573A] text-white",
    blue:
      "bg-[#7FB2FF] text-[#141414]",
    purple:
      "bg-[#9B5DE5] text-white",
    glow:
      "bg-[#FFC93C] text-[#141414] shadow-[2px_2px_0_#FF9F0A]",
  }

  return (
    <div
      className={cn(base, variants[variant] || variants.default, className)}
      {...props}
    />
  )
}
