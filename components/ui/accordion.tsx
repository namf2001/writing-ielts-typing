"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextType {
  openItems: Set<string>
  toggleItem: (id: string) => void
}

const AccordionContext = React.createContext<AccordionContextType>({
  openItems: new Set(),
  toggleItem: () => {},
})

export function Accordion({
  type = "single",
  defaultValue,
  collapsible = true,
  className,
  children,
  ...props
}: {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  collapsible?: boolean
  className?: string
  children: React.ReactNode
}) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
  })

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(type === "single" ? [] : prev)
      if (prev.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("divide-y divide-border/60", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <div className={cn("border-b border-border/60 py-1", className)} {...props} data-value={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ itemValue?: string }>, {
            itemValue: value,
          })
        }
        return child
      })}
    </div>
  )
}

export function AccordionTrigger({
  itemValue = "",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { itemValue?: string }) {
  const { openItems, toggleItem } = React.useContext(AccordionContext)
  const isOpen = openItems.has(itemValue)

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={() => toggleItem(itemValue)}
      className={cn(
        "flex w-full items-center justify-between py-3 font-medium text-sm transition-all duration-150 hover:text-primary cursor-pointer select-none text-left",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180 text-primary"
        )}
      />
    </button>
  )
}

export function AccordionContent({
  itemValue = "",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { itemValue?: string }) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.has(itemValue)

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "pb-3 text-sm text-muted-foreground animate-in fade-in-50 duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
