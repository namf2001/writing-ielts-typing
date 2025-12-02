"use client"

interface VirtualKeyboardProps {
  activeKey: string
  nextKey: string
}

const keyboardRows = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"],
  ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "return"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
  ["fn", "ctrl", "⌥", "⌘", "space", "⌘", "⌥", "←", "↑↓", "→"],
]

const shiftChars: Record<string, string> = {
  "`": "~",
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  "-": "_",
  "=": "+",
  "[": "{",
  "]": "}",
  "\\": "|",
  ";": ":",
  "'": '"',
  ",": "<",
  ".": ">",
  "/": "?",
}

export function VirtualKeyboard({ activeKey, nextKey }: VirtualKeyboardProps) {
  const isKeyActive = (key: string) => {
    const lowerActiveKey = activeKey.toLowerCase()
    const lowerKey = key.toLowerCase()

    if (lowerKey === "space" && activeKey === " ") return true
    if (lowerKey === "return" && activeKey === "Enter") return true
    if (lowerKey === "delete" && activeKey === "Backspace") return true
    if (lowerKey === "shift" && activeKey === "Shift") return true

    return lowerActiveKey === lowerKey
  }

  const isNextKey = (key: string) => {
    const lowerNextKey = nextKey.toLowerCase()
    const lowerKey = key.toLowerCase()

    if (lowerKey === "space" && nextKey === " ") return true
    if (lowerKey === "return" && nextKey === "\n") return true
    if (shiftChars[lowerKey] === nextKey) return true

    return lowerNextKey === lowerKey || nextKey === key
  }

  const needsShift = Object.values(shiftChars).includes(nextKey) || (nextKey >= "A" && nextKey <= "Z")

  const getKeyWidth = (key: string) => {
    switch (key) {
      case "delete":
      case "tab":
      case "caps":
      case "return":
        return "w-12 sm:w-14 md:w-16 lg:w-20"
      case "shift":
        return "w-14 sm:w-16 md:w-20 lg:w-24"
      case "space":
        return "w-32 sm:w-40 md:w-48 lg:w-64"
      default:
        return "w-7 sm:w-8 md:w-9 lg:w-10"
    }
  }

  const getKeyDisplay = (key: string) => {
    switch (key) {
      case "space":
        return ""
      case "↑↓":
        return "↑↓"
      default:
        return key
    }
  }

  return (
    <div
      className="shrink-0 bg-[var(--keyboard-bg)]/95 backdrop-blur-md border-t border-border shadow-2xl"
      role="region"
      aria-label="Virtual keyboard"
    >
      <div className="p-2 sm:p-3 md:p-4 lg:p-5">
        <div className="flex flex-col items-center gap-0.5 sm:gap-1 md:gap-1.5 max-w-5xl mx-auto">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-0.5 sm:gap-1" role="row">
              {row.map((key, keyIndex) => {
                const active = isKeyActive(key)
                const next = isNextKey(key) || (key === "shift" && needsShift)

                return (
                  <button
                    key={keyIndex}
                    type="button"
                    role="button"
                    aria-label={key === "space" ? "Spacebar" : key}
                    aria-pressed={active}
                    tabIndex={-1}
                    className={`
                      ${getKeyWidth(key)}
                      h-6 sm:h-7 md:h-8 lg:h-10
                      flex items-center justify-center
                      rounded sm:rounded-md
                      text-[8px] sm:text-[10px] md:text-xs lg:text-sm
                      font-medium
                      transition-all duration-75
                      select-none
                      cursor-default
                      ${
                        active
                          ? "bg-primary text-primary-foreground scale-95 shadow-inner"
                          : next
                            ? "bg-primary/80 text-primary-foreground ring-2 ring-primary/50 animate-pulse"
                            : "bg-[var(--keyboard-key)] text-muted-foreground hover:bg-[var(--keyboard-key)]/80"
                      }
                    `}
                  >
                    {getKeyDisplay(key)}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
