"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border-[3px] border-[#141414] bg-card text-card-foreground shadow-[5px_5px_0_#141414] transition-all duration-200 flex flex-col gap-5 p-6 hover:shadow-[8px_8px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-[#384259] dark:shadow-[5px_5px_0_#0A0D14] dark:hover:border-[#FFC93C] dark:hover:shadow-[8px_8px_0_#FFC93C]",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-lg font-black tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-sm text-muted-foreground leading-relaxed font-medium", className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("p-0 flex-1", className)}
      {...props}
    />
  )
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center pt-2 mt-auto", className)}
      {...props}
    />
  )
}

export function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("self-start justify-self-end", className)}
      {...props}
    />
  )
}
