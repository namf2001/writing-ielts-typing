"use client"

import { useRef, useEffect, useState, useMemo } from "react"
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  Type,
  FileText,
  Sliders,
  ChevronDown,
  RotateCcw,
  Sparkle,
  PenTool,
} from "lucide-react"
import {
  type WritingMode,
  type UserSettings,
  type FontFamilyOption,
  type NotebookPaperStyle,
  type CaretStyle,
  type LineHeightOption,
  type UntypedTextColor,
  getSettings,
  updateSettings,
} from "@/lib/storage"
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

const FONT_OPTIONS: { id: FontFamilyOption; label: string; icon: string }[] = [
  { id: "mono", label: "Typewriter", icon: "⌨️" },
  { id: "serif", label: "Academic", icon: "📖" },
  { id: "sans", label: "Modern", icon: "🔤" },
  { id: "handwriting", label: "Viết tay", icon: "✍️" },
]

const PAPER_OPTIONS: { id: NotebookPaperStyle; label: string; icon: string }[] = [
  { id: "ruled", label: "Dòng kẻ", icon: "📝" },
  { id: "grid", label: "Ô li", icon: "📐" },
  { id: "dot", label: "Chấm", icon: "⠟" },
  { id: "blank", label: "Trơn", icon: "📄" },
]

const UNTYPED_COLORS: { id: UntypedTextColor; label: string; dotClass: string }[] = [
  { id: "blue", label: "Mực xanh", dotClass: "bg-blue-600" },
  { id: "purple", label: "Mực tím", dotClass: "bg-purple-600" },
  { id: "teal", label: "Mực ngọc", dotClass: "bg-teal-600" },
  { id: "slate", label: "Xám khói", dotClass: "bg-slate-600" },
]

const UNTYPED_CLASSES: Record<UntypedTextColor, string> = {
  blue: "text-[#2563EB] dark:text-[#93C5FD] font-medium",
  purple: "text-[#7C3AED] dark:text-[#C4B5FD] font-medium",
  teal: "text-[#0D9488] dark:text-[#5EEAD4] font-medium",
  slate: "text-[#475569] dark:text-[#94A3B8] font-medium",
}

const FONT_CLASSES: Record<FontFamilyOption, string> = {
  mono: "font-typing-mono tracking-normal",
  serif: "font-typing-serif tracking-wide",
  sans: "font-typing-sans tracking-normal",
  handwriting: "font-typing-handwriting tracking-wider",
}

const FONT_STYLES: Record<FontFamilyOption, string> = {
  mono: 'var(--font-mono-jb), "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
  serif: 'var(--font-merriweather), "Merriweather", ui-serif, Georgia, Cambria, "Times New Roman", serif',
  sans: 'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  handwriting: 'var(--font-caveat), "Caveat", "Comic Sans MS", cursive, sans-serif',
}

const PAPER_CLASSES: Record<NotebookPaperStyle, string> = {
  ruled: "notebook-paper-ruled",
  grid: "notebook-paper-grid",
  dot: "notebook-paper-dot",
  blank: "notebook-paper-blank",
}

const LINE_HEIGHT_MULTIPLIERS: Record<LineHeightOption, number> = {
  compact: 2.0,
  normal: 2.35,
  relaxed: 2.7,
}

// Cấu trúc token từ để ngăn việc từ bị xé đôi giữa 2 dòng
interface CharToken {
  char: string
  index: number
}

interface TextToken {
  type: "word" | "space" | "newline"
  startIndex: number
  chars: CharToken[]
}

function tokenizeText(rawText: string): TextToken[] {
  const tokens: TextToken[] = []
  let i = 0

  while (i < rawText.length) {
    const ch = rawText[i]

    if (ch === "\n") {
      tokens.push({
        type: "newline",
        startIndex: i,
        chars: [{ char: "\n", index: i }],
      })
      i++
    } else if (ch === " ") {
      // Dấu cách độc lập để trình duyệt ngắt dòng tự nhiên giữa các từ
      tokens.push({
        type: "space",
        startIndex: i,
        chars: [{ char: " ", index: i }],
      })
      i++
    } else {
      // Thu thập toàn bộ các ký tự thuộc 1 từ (chữ, số, dấu câu)
      const start = i
      const chars: CharToken[] = []

      while (i < rawText.length && rawText[i] !== " " && rawText[i] !== "\n") {
        chars.push({ char: rawText[i], index: i })
        i++
      }

      tokens.push({
        type: "word",
        startIndex: start,
        chars,
      })
    }
  }

  return tokens
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
  canScore = false,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const currentCharRef = useRef<HTMLSpanElement>(null)
  const textareaRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Local settings for instant real-time customization
  const [settings, setSettings] = useState<UserSettings>(() => getSettings())

  // Hook xử lý bôi đen tra cứu từ điển
  const { selection, handleMouseUp, clearSelection } = useTextSelection()

  useEffect(() => {
    setSettings(getSettings())
  }, [])

  const handleUpdate = (updates: Partial<UserSettings>) => {
    const updated = updateSettings(updates)
    setSettings(updated)
  }

  const fontSize = settings.fontSize || 18
  const fontFamily: FontFamilyOption = settings.fontFamily || "mono"
  const notebookPaperStyle: NotebookPaperStyle = settings.notebookPaperStyle || "ruled"
  const caretStyle: CaretStyle = settings.caretStyle || "bar"
  const lineHeight: LineHeightOption = settings.lineHeight || "normal"
  const textAnimation = settings.textAnimation ?? true
  const untypedTextColor: UntypedTextColor = settings.untypedTextColor || "blue"

  const computedLineHeight = useMemo(() => {
    return Math.round(fontSize * (LINE_HEIGHT_MULTIPLIERS[lineHeight] || 2.35))
  }, [fontSize, lineHeight])

  // Phân tách văn bản thành các Word Tokens để giữ nguyên vẹn từng từ, không bị gãy đôi
  const tokens = useMemo(() => tokenizeText(text), [text])

  // Confetti khi hoàn thành
  useEffect(() => {
    if (isCompleted && writingMode === "ai-assisted") {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, writingMode])

  // Smooth scroll theo ký tự đang gõ
  useEffect(() => {
    if (writingMode === "ai-assisted") {
      currentCharRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    } else {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight
      }
    }
  }, [currentIndex, writingMode])

  // Ngày hiện tại cho bìa vở
  const currentDateStr = useMemo(() => {
    const now = new Date()
    return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`
  }, [])

  // Render từng ký tự trong chế độ gõ theo bài mẫu
  const renderChar = (char: string, index: number) => {
    const isTyped = index < currentIndex
    const isCurrent = index === currentIndex
    const typedChar = typedText[index]
    const isCorrect = typedChar === char
    const isNewline = char === "\n"
    const isJustTyped = index === currentIndex - 1

    // Khi gặp ký tự xuống dòng
    if (isNewline) {
      if (isCurrent) {
        return (
          <span key={index} className="inline-block relative my-0.5">
            <span
              ref={currentCharRef}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-mono font-black text-[#141414] bg-[#FFC93C] border-2 border-[#141414] shadow-[1.5px_1.5px_0_#141414] animate-pulse"
              title="Nhấn Enter để xuống dòng"
            >
              ↵ Enter
            </span>
            <br />
          </span>
        )
      }
      return (
        <span key={index}>
          <span
            ref={isCurrent ? currentCharRef : null}
            className="text-stone-300 dark:text-stone-700 text-xs select-none"
          >
            ↵
          </span>
          <br />
        </span>
      )
    }

    // Ký tự đã gõ xong
    if (isTyped) {
      if (isCorrect) {
        return (
          <span
            key={index}
            className={`text-[#141414] dark:text-[#F8F9FA] font-bold transition-colors duration-75 ${
              isJustTyped && textAnimation ? "animate-ink-pop" : ""
            }`}
          >
            {char}
          </span>
        )
      }

      // Ký tự gõ sai (Mực đỏ chấm sửa bài của giáo viên)
      return (
        <span
          key={index}
          className={`text-[#E03131] dark:text-[#FF6B6B] bg-rose-500/20 border-b-2 border-[#E03131] font-bold rounded-xs px-[1px] ${
            isJustTyped && textAnimation ? "animate-error-shake" : ""
          }`}
          title={`Gõ: "${typedChar}" - Đúng là: "${char}"`}
        >
          {typedChar === " " ? "␣" : typedChar || char}
        </span>
      )
    }

    // Ký tự hiện tại (con trỏ đang chờ)
    if (isCurrent) {
      return (
        <span
          key={index}
          ref={currentCharRef}
          className="relative inline-block"
          aria-current="true"
        >
          {caretStyle === "bar" && (
            <span
              className="absolute -left-[2.5px] top-[12%] bottom-[12%] w-[3px] bg-[#FF9F0A] dark:bg-[#FFC93C] rounded-full animate-cursor-pulse shadow-[0_0_8px_rgba(255,159,10,0.8)] z-10 pointer-events-none"
              aria-hidden="true"
            />
          )}

          {caretStyle === "block" && (
            <span
              className="absolute inset-0 bg-[#FFC93C]/40 dark:bg-[#FFC93C]/30 border-b-2 border-[#141414] dark:border-[#FFC93C] rounded-xs animate-pulse pointer-events-none"
              aria-hidden="true"
            />
          )}

          {caretStyle === "underline" && (
            <span
              className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF9F0A] dark:bg-[#FFC93C] animate-pulse pointer-events-none"
              aria-hidden="true"
            />
          )}

          <span className="text-[#FF9F0A] dark:text-[#FFC93C] font-black underline decoration-[#FF9F0A] decoration-2">
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      )
    }

    // Ký tự chưa gõ (Màu chữ mẫu chuẩn bị gõ - Sắc nét, tương phản cao, dễ phân biệt)
    return (
      <span
        key={index}
        className={`${UNTYPED_CLASSES[untypedTextColor] || UNTYPED_CLASSES.blue} select-none transition-colors duration-75`}
      >
        {char}
      </span>
    )
  }

  // Màn hình chúc mừng khi hoàn thành
  if (isCompleted && writingMode === "ai-assisted") {
    return (
      <div className="flex flex-col flex-1 min-h-0 relative">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {[...Array(24)].map((_, i) => (
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
                <Sparkles className="w-5 h-5 text-[#FF9F0A] opacity-80" />
              </div>
            ))}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 rounded-3xl border-[3px] border-[#141414] bg-white shadow-[6px_6px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[6px_6px_0_#0A0D14] text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FFC93C]/40 rounded-full blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFC93C] text-[#141414] border-2 border-[#141414] shadow-[3px_3px_0_#141414]">
                  <Trophy className="h-10 w-10 text-[#141414] stroke-[2.2]" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-[#141414] dark:text-white uppercase tracking-tight">
                Hoàn thành bài viết xuất sắc! 🎉
              </h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Bạn đã hoàn thành trọn vẹn từng câu trong bài mẫu IELTS chuẩn 8.5+
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF7F0] border-2 border-[#141414] dark:bg-[#11141B] dark:border-[#384259]">
              <div>
                <p className="text-2xl font-black text-[#141414] dark:text-white font-mono">{wpm}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Tốc độ WPM</p>
              </div>
              <div className="border-x-2 border-[#141414]/20 dark:border-[#384259]">
                <p className="text-2xl font-black text-[#7CC243] font-mono">{accuracy.toFixed(1)}%</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Chính xác</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#FF9F0A] font-mono">{text.split(/\s+/).filter(Boolean).length}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">Tổng số từ</p>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="yellow"
                size="lg"
                className="w-full font-black text-sm gap-2"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                Luyện tập bài khác
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Header thanh công cụ Notebook Toolbar nằm ngay mép trên cuốn vở
  const renderNotebookToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-2.5 border-b-2 border-[#141414]/20 dark:border-[#384259] bg-[#FAF7F0] dark:bg-[#11141B] text-xs font-bold shrink-0">
      {/* Left: Notebook Stamp Info */}
      <div className="flex items-center gap-2 text-muted-foreground select-none">
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-black px-2 py-0.5 rounded bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414]">
          NOTEBOOK NO. {currentDateStr}
        </span>
        <span className="hidden md:inline font-mono text-[11px]">
          {writingMode === "self" ? "• FREE WRITING ESSAY" : "• GUIDED IELTS TRANSCRIPTION"}
        </span>
      </div>

      {/* Right: Quick Notebook Settings Pills */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {/* Font Family Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#181C26] p-1 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259]">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleUpdate({ fontFamily: f.id })}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                fontFamily === f.id
                  ? "bg-[#FFC93C] text-[#141414] font-black shadow-[1px_1px_0_#141414]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontFamily: FONT_STYLES[f.id] }}
              title={`Kiểu chữ: ${f.label}`}
            >
              <span>{f.icon}</span>
              <span className="hidden sm:inline ml-1 text-[11px]">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Paper Style Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#181C26] p-1 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259]">
          {PAPER_OPTIONS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleUpdate({ notebookPaperStyle: p.id })}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                notebookPaperStyle === p.id
                  ? "bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414] font-black"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={`Giấy: ${p.label}`}
            >
              <span>{p.icon}</span>
            </button>
          ))}
        </div>

        {/* Untyped Text Color Switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#181C26] p-1 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259]">
          {UNTYPED_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleUpdate({ untypedTextColor: c.id })}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                untypedTextColor === c.id
                  ? "ring-2 ring-[#141414] dark:ring-[#FFC93C] scale-110"
                  : "opacity-50 hover:opacity-100"
              }`}
              title={`Màu chữ mẫu: ${c.label}`}
            >
              <span className={`w-3 h-3 rounded-full ${c.dotClass}`} />
            </button>
          ))}
        </div>

        {/* Font Size Stepper */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#181C26] px-2 py-1 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259]">
          <button
            type="button"
            onClick={() => handleUpdate({ fontSize: Math.max(14, fontSize - 1) })}
            className="w-5 h-5 flex items-center justify-center font-black hover:bg-[#FAF7F0] rounded cursor-pointer"
            title="Giảm cỡ chữ"
          >
            -
          </button>
          <span className="font-mono text-xs font-black min-w-[28px] text-center">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => handleUpdate({ fontSize: Math.min(24, fontSize + 1) })}
            className="w-5 h-5 flex items-center justify-center font-black hover:bg-[#FAF7F0] rounded cursor-pointer"
            title="Tăng cỡ chữ"
          >
            +
          </button>
        </div>

        {/* Ink Pop Animation Toggle */}
        <button
          type="button"
          onClick={() => handleUpdate({ textAnimation: !textAnimation })}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] text-xs font-black transition-all cursor-pointer dark:border-[#384259] ${
            textAnimation
              ? "bg-[#7CC243] text-[#141414]"
              : "bg-white text-muted-foreground dark:bg-[#181C26]"
          }`}
          title="Bật/Tắt hiệu ứng chữ nảy (Ink Pop)"
        >
          <Sparkle className={`w-3.5 h-3.5 ${textAnimation ? "fill-[#141414]" : ""}`} />
          <span className="hidden md:inline">Hiệu ứng</span>
        </button>
      </div>
    </div>
  )

  // 1. Chế độ Tự Viết (Self Writing Mode)
  if (writingMode === "self") {
    const wordCount = typedText.split(/\s+/).filter(Boolean).length

    return (
      <div className="flex flex-col flex-1 min-h-0 relative bg-[#FAF7F0] dark:bg-[#11141B] p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Main Notebook Container with Spiral Rings */}
        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col rounded-3xl border-[3px] border-[#141414] bg-white shadow-[6px_6px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[6px_6px_0_#0A0D14] overflow-hidden">
          {/* Notebook Top Toolbar */}
          {renderNotebookToolbar()}

          {/* Notebook Paper Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Spiral Binder Ring Rail */}
            <div className="w-9 sm:w-12 bg-[#F2ECE1] dark:bg-[#141722] border-r-2 border-dashed border-[#141414]/30 dark:border-white/10 flex flex-col justify-around py-4 items-center shrink-0 select-none">
              {[...Array(14)].map((_, i) => (
                <div key={i} className="relative flex items-center justify-center my-1">
                  <div className="w-3 h-3 rounded-full bg-[#141414]/25 dark:bg-[#0A0D14] border border-[#141414]/50 dark:border-[#384259] shadow-inner" />
                  <div className="absolute -left-2 w-5 h-2 rounded-full border-2 border-[#141414] bg-gradient-to-r from-stone-200 via-white to-stone-300 dark:from-stone-600 dark:to-stone-400 shadow-xs -rotate-12 pointer-events-none" />
                </div>
              ))}
            </div>

            {/* Ruled / Styled Paper Page */}
            <div
              className={`flex-1 flex flex-col min-h-0 relative ${PAPER_CLASSES[notebookPaperStyle]}`}
              style={{
                ["--paper-line-height" as any]: `${computedLineHeight}px`,
              }}
            >
              {/* Đề bài IELTS Sticky Memo Note */}
              {prompt && (
                <div className="mx-6 sm:mx-10 mt-4 mb-2 p-3.5 sm:p-4 rounded-xl border-2 border-[#141414] bg-[#FFF8EC] dark:bg-[#1E2330] shadow-[3px_3px_0_#141414] dark:border-[#384259] dark:shadow-[3px_3px_0_#0A0D14] relative shrink-0">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-16 bg-[#FFC93C]/60 border border-[#141414]/20 rounded-xs shadow-xs -rotate-1 pointer-events-none" />
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414]">
                      ĐỀ BÀI IELTS TASK
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground font-mono">
                      Target: 250+ từ
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#141414] dark:text-foreground/90 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Freeform Typing Writing Area */}
              <div
                ref={textareaRef}
                className="flex-1 overflow-y-auto pl-14 sm:pl-16 pr-6 sm:pr-10 py-4 scrollbar-thin outline-none"
                role="region"
                aria-label="Free notebook typing area"
              >
                <div
                  className={`min-h-[280px] whitespace-pre-wrap select-text ${FONT_CLASSES[fontFamily]}`}
                  style={{
                    fontFamily: FONT_STYLES[fontFamily],
                    fontSize: `${fontSize}px`,
                    lineHeight: `${computedLineHeight}px`,
                  }}
                >
                  <span className="text-[#141414] dark:text-[#F0F3F8] font-medium">
                    {typedText}
                  </span>
                  {/* Glowing Pen Caret */}
                  <span className="inline-block relative">
                    <span className="inline-block w-[3px] h-[1.15em] bg-[#FF9F0A] dark:bg-[#FFC93C] rounded-full align-middle animate-cursor-pulse shadow-[0_0_8px_rgba(255,159,10,0.8)] -mr-[3px]" />
                  </span>
                </div>
              </div>

              {/* Notebook Footer Bar */}
              <div className="shrink-0 border-t-2 border-[#141414]/15 dark:border-[#384259] bg-[#FAF7F0]/90 dark:bg-[#11141B]/90 backdrop-blur-xs py-2.5 px-6 flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#141414] bg-[#FFC93C] text-[#141414] font-black text-xs shadow-[2px_2px_0_#141414]">
                    ✍️ {wordCount} TỪ
                  </span>
                  <span className="hidden sm:inline text-muted-foreground text-[11px] font-mono">
                    Nhấn <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181C26] border border-[#141414] font-mono">Esc</kbd> để tạm dừng
                  </span>
                </div>

                <Button
                  onClick={onSubmit}
                  disabled={!canScore || isScoring}
                  variant="yellow"
                  size="sm"
                  className="font-black text-xs gap-1.5 shadow-[2px_2px_0_#141414]"
                >
                  {isScoring ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Đang chấm...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      Nộp bài chấm AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. Chế độ Gõ theo mẫu (AI-assisted / Guided typing)
  return (
    <div className="flex flex-col flex-1 min-h-0 relative bg-[#FAF7F0] dark:bg-[#11141B] p-2 sm:p-4 md:p-6 overflow-hidden">
      {/* Main Notebook Container with Spiral Rings */}
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col rounded-3xl border-[3px] border-[#141414] bg-white shadow-[6px_6px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[6px_6px_0_#0A0D14] overflow-hidden">
        {/* Notebook Top Toolbar */}
        {renderNotebookToolbar()}

        {/* Notebook Paper Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Spiral Binder Ring Rail */}
          <div className="w-9 sm:w-12 bg-[#F2ECE1] dark:bg-[#141722] border-r-2 border-dashed border-[#141414]/30 dark:border-white/10 flex flex-col justify-around py-4 items-center shrink-0 select-none">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="relative flex items-center justify-center my-1">
                <div className="w-3 h-3 rounded-full bg-[#141414]/25 dark:bg-[#0A0D14] border border-[#141414]/50 dark:border-[#384259] shadow-inner" />
                <div className="absolute -left-2 w-5 h-2 rounded-full border-2 border-[#141414] bg-gradient-to-r from-stone-200 via-white to-stone-300 dark:from-stone-600 dark:to-stone-400 shadow-xs -rotate-12 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Ruled / Styled Paper Page */}
          <div
            className={`flex-1 flex flex-col min-h-0 relative ${PAPER_CLASSES[notebookPaperStyle]}`}
            style={{
              ["--paper-line-height" as any]: `${computedLineHeight}px`,
            }}
          >
            {/* Đề bài IELTS Sticky Memo Note */}
            {prompt && prompt !== text && (
              <div className="mx-6 sm:mx-10 mt-4 mb-2 p-3.5 sm:p-4 rounded-xl border-2 border-[#141414] bg-[#FFF8EC] dark:bg-[#1E2330] shadow-[3px_3px_0_#141414] dark:border-[#384259] dark:shadow-[3px_3px_0_#0A0D14] relative shrink-0">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-16 bg-[#FFC93C]/60 border border-[#141414]/20 rounded-xs shadow-xs -rotate-1 pointer-events-none" />
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#FFC93C] text-[#141414] border border-[#141414]">
                    ĐỀ BÀI MẪU
                  </span>
                  <span className="text-[11px] font-bold text-muted-foreground font-mono">
                    IELTS Academic Writing
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#141414] dark:text-foreground/90 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Ruled Typing Area với cấu trúc Word Tokens chống gãy đôi và chống nhảy từ */}
            <div
              ref={containerRef}
              className="flex-1 overflow-y-auto pl-14 sm:pl-16 pr-6 sm:pr-10 py-4 scrollbar-thin outline-none"
              role="region"
              aria-label="Typing practice notebook text"
              tabIndex={0}
              onMouseUp={handleMouseUp}
            >
              <div
                className={`select-text whitespace-pre-wrap ${FONT_CLASSES[fontFamily]}`}
                style={{
                  fontFamily: FONT_STYLES[fontFamily],
                  fontSize: `${fontSize}px`,
                  lineHeight: `${computedLineHeight}px`,
                }}
              >
                {tokens.map((token) => {
                  if (token.type === "newline") {
                    return renderChar("\n", token.startIndex)
                  }

                  if (token.type === "space") {
                    return renderChar(" ", token.startIndex)
                  }

                  // Word token: Giữ toàn bộ ký tự trong 1 khối inline-block whitespace-nowrap
                  const isWordActive =
                    currentIndex >= token.startIndex &&
                    currentIndex < token.startIndex + token.chars.length

                  return (
                    <span
                      key={`w-${token.startIndex}`}
                      className={`inline-block whitespace-nowrap transition-colors duration-150 ${
                        isWordActive
                          ? "bg-[#FFC93C]/20 dark:bg-[#FFC93C]/15 rounded-sm px-[2px] -mx-[2px]"
                          : ""
                      }`}
                    >
                      {token.chars.map((c) => renderChar(c.char, c.index))}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Notebook Bottom Status Line */}
            <div className="shrink-0 border-t-2 border-[#141414]/15 dark:border-[#384259] bg-[#FAF7F0]/90 dark:bg-[#11141B]/90 backdrop-blur-xs py-2 px-6 flex items-center justify-between text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px]">
                  Tiến độ: <strong className="text-[#141414] dark:text-white">{currentIndex}</strong> / {text.length} ký tự
                </span>
                <span className="hidden sm:inline text-stone-300 dark:text-stone-700">•</span>
                <span className="hidden sm:inline text-[11px]">
                  Bôi đen từ bất kỳ để tra cứu từ điển
                </span>
              </div>

              <div className="text-[11px] font-mono font-bold">
                PAGE 1 OF 1
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Popup khi bôi đen từ */}
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
