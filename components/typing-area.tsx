"use client"

import { useRef, useEffect, useState } from "react"

interface TypingAreaProps {
  text: string
  typedText: string
  currentIndex: number
  hasKeyboard: boolean
  prompt?: string
}

export function TypingArea({ text, typedText, currentIndex, hasKeyboard, prompt }: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCharRef = useRef<HTMLSpanElement>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const updateKeyboardHeight = () => {
      if (hasKeyboard) {
        const width = window.innerWidth
        if (width < 640) setKeyboardHeight(160)
        else if (width < 768) setKeyboardHeight(180)
        else if (width < 1024) setKeyboardHeight(200)
        else setKeyboardHeight(220)
      } else {
        setKeyboardHeight(0)
      }
    }

    updateKeyboardHeight()
    window.addEventListener("resize", updateKeyboardHeight)
    return () => window.removeEventListener("resize", updateKeyboardHeight)
  }, [hasKeyboard])

  useEffect(() => {
    currentCharRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }, [currentIndex])

  const renderChar = (char: string, index: number) => {
    const isTyped = index < currentIndex
    const isCurrent = index === currentIndex
    const typedChar = typedText[index]
    const isCorrect = typedChar === char
    const isNewline = char === "\n"

    let className =
      "font-mono text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed transition-colors duration-75 "

    if (isTyped) {
      className += isCorrect ? "text-primary" : "text-destructive bg-destructive/20 rounded"
    } else if (isCurrent) {
      className += "text-foreground bg-primary/40 rounded animate-pulse"
    } else {
      className += "text-muted-foreground"
    }

    if (isNewline) {
      return (
        <span key={index}>
          <span ref={isCurrent ? currentCharRef : null} className={className} aria-label="newline">
            ↵
          </span>
          <br />
        </span>
      )
    }

    return (
      <span
        key={index}
        ref={isCurrent ? currentCharRef : null}
        className={className}
        aria-current={isCurrent ? "true" : undefined}
      >
        {char}
      </span>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 relative" style={{ paddingBottom: keyboardHeight }}>
      {prompt && prompt !== text && (
        <div className="px-4 sm:px-6 md:px-8 lg:px-16 py-3 md:py-4 border-b border-border/50 bg-secondary/30">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Đề bài:</p>
          <p className="text-sm md:text-base text-foreground/80 italic">{prompt}</p>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4 md:py-6 scrollbar-thin"
        role="region"
        aria-label="Typing practice text"
        aria-live="polite"
        tabIndex={0}
      >
        <div className="max-w-4xl mx-auto">
          <div className="leading-loose select-none tracking-wide">{text.split("").map(renderChar)}</div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 md:pt-8 pb-3 md:pb-4"
        style={{ bottom: keyboardHeight }}
      >
        <p className="text-center text-muted-foreground text-[10px] sm:text-xs md:text-sm">
          Nhấn phím bất kỳ để bắt đầu. Nhấn{" "}
          <kbd className="px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 bg-secondary rounded text-[8px] sm:text-[10px] md:text-xs font-mono border border-border">
            Esc
          </kbd>{" "}
          để tạm dừng.
        </p>
      </div>
    </div>
  )
}
