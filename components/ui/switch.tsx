"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
  name?: string
}

export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange: controlledOnChange,
  disabled = false,
  className,
  id,
  name,
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked)
  const isControlled = controlledChecked !== undefined
  const checked = isControlled ? controlledChecked : uncontrolledChecked

  const toggle = () => {
    if (disabled) return
    const next = !checked
    if (!isControlled) setUncontrolledChecked(next)
    controlledOnChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      name={name}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-[#141414] shadow-[2px_2px_0_#141414] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#FFD43B] disabled:cursor-not-allowed disabled:opacity-50 select-none p-0.5 dark:border-[#384259] dark:shadow-[2px_2px_0_#0A0D14]",
        checked ? "bg-[#7CC243]" : "bg-[#FFF2D9] dark:bg-[#232938]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white border-2 border-[#141414] transition-transform duration-150 ease-out",
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-white/90"
        )}
      />
    </button>
  )
}
