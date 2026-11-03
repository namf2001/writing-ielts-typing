"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextType {
  value: string
  onValueChange: (val: string) => void
  name?: string
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({
  value: "",
  onValueChange: () => {},
})

export function RadioGroup({
  value: controlledValue,
  defaultValue = "",
  onValueChange: controlledOnChange,
  name,
  className,
  children,
  ...props
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  name?: string
  className?: string
  children: React.ReactNode
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const onValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next)
      controlledOnChange?.(next)
    },
    [isControlled, controlledOnChange]
  )

  return (
    <RadioGroupContext.Provider value={{ value: value || "", onValueChange, name }}>
      <div role="radiogroup" className={cn("grid gap-2", className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({
  value,
  id,
  className,
  disabled = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { value: string }) {
  const { value: activeValue, onValueChange, name } = React.useContext(RadioGroupContext)
  const isChecked = activeValue === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      disabled={disabled}
      id={id}
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex size-4.5 shrink-0 items-center justify-center rounded-full border border-primary/50 text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        isChecked ? "border-primary bg-primary" : "bg-background hover:border-primary",
        className
      )}
      {...(props as any)}
    >
      {isChecked && <span className="size-2 rounded-full bg-primary-foreground" />}
    </button>
  )
}
