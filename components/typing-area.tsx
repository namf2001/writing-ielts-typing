"use client"

import { useRef, useEffect, useState } from "react"
import { CheckCircle2, Trophy, Sparkles } from "lucide-react"
import { type WritingMode } from "@/lib/storage"
import { useTextSelection } from "@/hooks/use-text-selection"
import { TranslationPopup } from "./translation-popup"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TypingAreaProps {
  text: string
  typedText: string
  currentIndex: number
  hasKeyboard: boolean
  prompt?: string
  writingMode?: WritingMode
  isCompleted?: boolean
  wpm?: number
  accuracy?: number
  onSubmit?: () => void
  isScoring?: boolean
  canScore?: boolean
}

export function TypingArea({ 
  text, 
  typedText, 
  currentIndex, 
  hasKeyboard, 
  prompt, 
  writingMode = "ai-assisted",
  isCompleted = false,
  wpm = 0,
  accuracy = 100,
  onSubmit,
  isScoring = false,
  canScore = false
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCharRef = useRef<HTMLSpanElement>(null)
  const textareaRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Hook để xử lý text selection cho translation
  const { selection, handleMouseUp, clearSelection } = useTextSelection()

  useEffect(() => {
    if (isCompleted && writingMode === "ai-assisted") {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, writingMode])

  useEffect(() => {
    if (writingMode === "ai-assisted") {
      currentCharRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    } else {
      // Chế độ tự viết: scroll xuống cuối
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight
      }
    }
  }, [currentIndex, writingMode])

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

  // Hiệu ứng hoàn thành cho chế độ gõ theo mẫu
  if (isCompleted && writingMode === "ai-assisted") {
    return (
      <div className="flex flex-col flex-1 min-h-0 relative">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                <Sparkles className="w-4 h-4 text-primary opacity-70" />
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Trophy icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            {/* Congratulations text */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                🎉 Hoàn thành xuất sắc!
              </h2>
              <p className="text-muted-foreground">
                Bạn đã gõ xong toàn bộ bài viết
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{wpm}</p>
                <p className="text-xs text-muted-foreground">WPM</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{accuracy.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Độ chính xác</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{text.split(/\s+/).length}</p>
                <p className="text-xs text-muted-foreground">Từ</p>
              </div>
            </div>

            {/* Check icon */}
            <div className="flex justify-center">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Chế độ tự viết: hiển thị textarea ảo
  if (writingMode === "self") {
    const wordCount = typedText.split(/\s+/).filter(Boolean).length

    return (
      <div className="flex flex-col flex-1 min-h-0 relative">
        {/* Đề bài */}
        {prompt && (
          <div className="px-4 sm:px-6 md:px-8 lg:px-16 py-3 md:py-4 border-b border-border/50 bg-secondary/30 shrink-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Đề bài:</p>
            <div className="text-sm md:text-base text-foreground/80 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Vùng gõ tự do */}
        <div
          ref={textareaRef}
          className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4 md:py-6 pb-20 scrollbar-thin"
          role="region"
          aria-label="Free typing area"
        >
          <div className="max-w-4xl mx-auto">
            <div className="leading-loose tracking-wide min-h-[200px]">
              <span className="font-mono text-base sm:text-lg md:text-xl lg:text-2xl text-foreground whitespace-pre-wrap">
                {typedText}
              </span>
              <span className="font-mono text-base sm:text-lg md:text-xl lg:text-2xl bg-primary/40 rounded animate-pulse">
                &nbsp;
              </span>
            </div>
          </div>
        </div>

        {/* Footer với word count - fixed tại bottom */}
        <div className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm py-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-muted-foreground text-[10px] sm:text-xs md:text-sm">
            <span className="font-medium">{wordCount} từ</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              Nhấn{" "}
              <kbd className="px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 bg-secondary rounded text-[8px] sm:text-[10px] md:text-xs font-mono border border-border">
                Esc
              </kbd>{" "}
              để tạm dừng
            </span>
          </div>

          <Button 
            onClick={onSubmit} 
            disabled={!canScore || isScoring} 
            className="gap-2 h-8 text-xs sm:text-sm"
            size="sm"
          >
            {isScoring ? (
              <>
                <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang chấm...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                Nộp bài
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Chế độ gõ theo mẫu: hiển thị text để gõ theo
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {prompt && prompt !== text && (
        <div className="px-4 sm:px-6 md:px-8 lg:px-16 py-3 md:py-4 border-b border-border/50 bg-secondary/30 shrink-0">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Đề bài:</p>
          <div className="text-sm md:text-base text-foreground/80 prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 lg:px-16 py-4 md:py-6 pb-20 scrollbar-thin"
        role="region"
        aria-label="Typing practice text"
        aria-live="polite"
        tabIndex={0}
        onMouseUp={handleMouseUp}
      >
        <div className="max-w-4xl mx-auto">
          <div className="leading-loose select-text tracking-wide">{text.split("").map(renderChar)}</div>
        </div>
      </div>

      {/* Footer - fixed tại bottom, không che nội dung */}
      <div className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-sm py-2 px-4">
        <p className="text-center text-muted-foreground text-[10px] sm:text-xs md:text-sm">
          Nhấn phím bất kỳ để bắt đầu. Nhấn{" "}
          <kbd className="px-1 sm:px-1.5 md:px-2 py-0.5 md:py-1 bg-secondary rounded text-[8px] sm:text-[10px] md:text-xs font-mono border border-border">
            Esc
          </kbd>{" "}
          để tạm dừng. <span className="text-primary">Bôi đen từ để tra cứu.</span>
        </p>
      </div>

      {/* Translation Popup */}
      {selection && (
        <TranslationPopup
          selectedText={selection.text}
          position={selection.position}
          onClose={clearSelection}
        />
      )}
    </div>
  )
}
