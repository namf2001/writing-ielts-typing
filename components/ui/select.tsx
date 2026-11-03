"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectContextType {
  value: string
  onValueChange: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  activeLabel: React.ReactNode | null
}

const SelectContext = React.createContext<SelectContextType>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  activeLabel: null,
})

// Helper to recursively find the label of the selected item from React children
function findItemLabel(
  children: React.ReactNode,
  targetValue: string | number | undefined
): React.ReactNode | null {
  if (targetValue === undefined || targetValue === null || targetValue === "") return null

  let found: React.ReactNode | null = null

  const search = (nodes: React.ReactNode) => {
    React.Children.forEach(nodes, (node) => {
      if (found !== null || !React.isValidElement(node)) return

      const props = node.props as { value?: string | number; children?: React.ReactNode }
      if (props) {
        if (props.value !== undefined && String(props.value) === String(targetValue)) {
          found = props.children
          return
        }
        if (props.children) {
          search(props.children)
        }
      }
    })
  }

  search(children)
  return found
}

export function Select({
  value: controlledValue,
  defaultValue = "",
  onValueChange: controlledOnChange,
  className,
  children,
}: {
  value?: string | number
  defaultValue?: string | number
  onValueChange?: (val: string) => void
  className?: string
  children: React.ReactNode
}) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ? String(defaultValue) : "")
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? String(controlledValue) : uncontrolledValue

  const onValueChange = React.useCallback(
    (nextVal: string) => {
      if (!isControlled) setUncontrolledValue(nextVal)
      controlledOnChange?.(nextVal)
      setOpen(false)
    },
    [isControlled, controlledOnChange]
  )

  // Find the selected label synchronously from children tree
  const activeLabel = React.useMemo(() => {
    return findItemLabel(children, value)
  }, [children, value])

  // Handle outside click to close dropdown
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <SelectContext.Provider
      value={{
        value: value || "",
        onValueChange,
        open,
        setOpen,
        activeLabel,
      }}
    >
      <div ref={containerRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen } = React.useContext(SelectContext)

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border-2 border-[#141414] bg-white px-3.5 py-1.5 text-xs sm:text-sm font-bold shadow-[3px_3px_0_#141414] transition-all duration-150 hover:bg-[#FAF7F0] focus-visible:outline-3 focus-visible:outline-[#FFD43B] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer dark:border-[#384259] dark:bg-[#181C26] dark:shadow-[3px_3px_0_#0A0D14]",
        className
      )}
      {...props}
    >
      <div className="truncate flex-1 text-left mr-2">{children}</div>
      <ChevronDown
        className={cn(
          "h-4 w-4 stroke-[2.5] shrink-0 transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

export function SelectValue({
  placeholder = "Chọn...",
}: {
  placeholder?: string
}) {
  const { activeLabel } = React.useContext(SelectContext)
  return <span className="truncate">{activeLabel || placeholder}</span>
}

export function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = React.useContext(SelectContext)
  if (!open) return null

  return (
    <div
      role="listbox"
      className={cn(
        "absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[9rem] overflow-hidden rounded-xl border-2 border-[#141414] bg-white p-1 text-foreground shadow-[5px_5px_0_#141414] animate-in fade-in-50 zoom-in-95 duration-150 max-h-60 overflow-y-auto dark:border-[#384259] dark:bg-[#181C26] dark:shadow-[5px_5px_0_#0A0D14]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectItem({
  value,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string | number }) {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = String(selectedValue) === String(value)

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onValueChange(String(value))}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-8 text-xs sm:text-sm font-semibold outline-none transition-colors duration-100 hover:bg-[#FFF2D9] dark:hover:bg-[#232938]",
        isSelected && "bg-[#FFC93C]/25 text-[#141414] font-bold dark:bg-[#FFC93C]/20 dark:text-[#FFC93C]",
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {isSelected && (
        <span className="absolute right-2.5 flex h-4 w-4 items-center justify-center text-[#141414] dark:text-[#FFC93C]">
          <Check className="h-4 w-4 stroke-[3]" />
        </span>
      )}
    </div>
  )
}

export function SelectGroup({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

export function SelectLabel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-0.5 bg-[#141414]/15 dark:bg-border/60", className)}
      {...props}
    />
  )
}
