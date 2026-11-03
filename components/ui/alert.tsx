"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Alert({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive" | "info" | "success" | "warning"
}) {
  const variants: Record<string, string> = {
    default: "bg-muted/60 text-foreground border-border/80",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  }

  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-2xl border p-4.5 text-sm shadow-2xs backdrop-blur-xs flex gap-3.5 items-start",
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("font-semibold leading-none tracking-tight mb-1", className)}
      {...props}
    />
  )
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-xs sm:text-sm leading-relaxed opacity-90", className)}
      {...props}
    />
  )
}
