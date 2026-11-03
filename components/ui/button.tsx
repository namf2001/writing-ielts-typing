"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "yellow"
    | "green"
    | "coral"
    | "blue"
    | "purple"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "glow"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    // TID Neo-Brutalist base button: 2px solid border, 3px hard drop shadow, tactile click
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-tight transition-all duration-150 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:outline-4 focus-visible:outline-[#FFD43B] focus-visible:outline-offset-2 shrink-0 border-2 border-[#141414] shadow-[3px_3px_0_#141414] hover:shadow-[5px_5px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[1px_1px_0_#141414] active:translate-x-0.5 active:translate-y-0.5 dark:border-[#384259] dark:shadow-[3px_3px_0_#0A0D14] dark:hover:shadow-[5px_5px_0_#FFC93C] dark:hover:border-[#FFC93C]"

    const variants: Record<string, string> = {
      default:
        "bg-[#141414] text-white hover:bg-[#252525] dark:bg-[#FFC93C] dark:text-[#141414] dark:hover:bg-[#FFD45A]",
      yellow:
        "bg-[#FFC93C] text-[#141414] hover:bg-[#FFD45A]",
      green:
        "bg-[#7CC243] text-[#141414] hover:bg-[#8BD34F]",
      coral:
        "bg-[#F0573A] text-white hover:bg-[#FF6647]",
      blue:
        "bg-[#7FB2FF] text-[#141414] hover:bg-[#96C2FF]",
      purple:
        "bg-[#9B5DE5] text-white hover:bg-[#AA6FF2]",
      destructive:
        "bg-[#F0573A] text-white hover:bg-[#FF6647]",
      outline:
        "bg-white dark:bg-[#181C26] text-foreground hover:bg-[#FAF7F0] dark:hover:bg-[#222735]",
      secondary:
        "bg-[#FFF2D9] dark:bg-[#232938] text-foreground hover:bg-[#FFE8BF] dark:hover:bg-[#2D3547]",
      glow:
        "bg-[#FFC93C] text-[#141414] shadow-[4px_4px_0_#141414] hover:shadow-[6px_6px_0_#FF9F0A]",
      ghost:
        "border-transparent shadow-none hover:border-[#141414] hover:shadow-[3px_3px_0_#141414] hover:bg-white dark:hover:bg-[#181C26] dark:hover:border-[#384259] active:shadow-none",
      link:
        "border-transparent shadow-none text-primary underline-offset-4 hover:underline hover:shadow-none hover:translate-x-0 hover:translate-y-0",
    }

    const sizes: Record<string, string> = {
      default: "h-10 px-4 py-2 text-sm rounded-xl",
      sm: "h-8 px-3 text-xs rounded-lg gap-1.5 shadow-[2px_2px_0_#141414] hover:shadow-[3px_3px_0_#141414] dark:shadow-[2px_2px_0_#0A0D14]",
      lg: "h-12 px-6 text-base rounded-2xl gap-2.5 shadow-[4px_4px_0_#141414] hover:shadow-[6px_6px_0_#141414]",
      icon: "size-10 p-0 rounded-xl",
      "icon-sm": "size-8 p-0 text-xs rounded-lg shadow-[2px_2px_0_#141414] hover:shadow-[3px_3px_0_#141414] dark:shadow-[2px_2px_0_#0A0D14]",
      "icon-lg": "size-12 p-0 rounded-2xl shadow-[4px_4px_0_#141414] hover:shadow-[6px_6px_0_#141414]",
    }

    const classes = cn(
      baseStyles,
      variants[variant] || variants.default,
      sizes[size] || sizes.default,
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn((children as React.ReactElement<{ className?: string }>).props.className, classes),
        ...props,
      })
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
