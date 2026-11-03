"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

interface TooltipContextType {
  open: boolean
  setOpen: (o: boolean) => void
}

const TooltipContext = React.createContext<TooltipContextType>({
  open: false,
  setOpen: () => {},
})

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex items-center group"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({
  children,
  asChild,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return children
  }
  return (
    <span className={className} {...props}>
      {children}
    </span>
  )
}

export function TooltipContent({
  side = "top",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right"
}) {
  const { open } = React.useContext(TooltipContext)
  if (!open) return null

  const positions: Record<string, string> = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 whitespace-nowrap rounded-lg border border-border/80 bg-popover/95 px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-lg backdrop-blur-md animate-in fade-in-50 zoom-in-95 duration-100 pointer-events-none",
        positions[side] || positions.top,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
