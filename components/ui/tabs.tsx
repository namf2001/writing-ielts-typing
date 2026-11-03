"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextType>({
  value: "",
  onValueChange: () => {},
})

export function Tabs({
  value: controlledValue,
  defaultValue = "",
  onValueChange: controlledOnValueChange,
  className,
  children,
  ...props
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const onValueChange = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next)
      }
      controlledOnValueChange?.(next)
    },
    [isControlled, controlledOnValueChange]
  )

  return (
    <TabsContext.Provider value={{ value: value || "", onValueChange }}>
      <div className={cn("flex flex-col gap-5 w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-12 items-center justify-start rounded-2xl border-2 border-[#141414] bg-[#FFF2D9] p-1 text-foreground shadow-[3px_3px_0_#141414] gap-1.5 dark:border-[#384259] dark:bg-[#181C26] dark:shadow-[3px_3px_0_#0A0D14]",
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-[#FFD43B] select-none",
        isActive
          ? "bg-[#141414] text-white border-2 border-[#141414] shadow-[2px_2px_0_#141414] -translate-y-0.5 dark:bg-[#FFC93C] dark:text-[#141414] dark:border-[#FFC93C]"
          : "text-muted-foreground hover:text-foreground hover:bg-white/70 dark:hover:bg-[#232938]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const { value: activeValue } = React.useContext(TabsContext)
  if (activeValue !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn(
        "outline-none animate-in fade-in-50 duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
