"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Keyboard, RotateCcw, ArrowLeft, Sun, Moon, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { type WritingMode } from "@/lib/storage"

interface PracticeSidebarProps {
  showKeyboard: boolean
  onToggleKeyboard: () => void
  onReset: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  // Scoring props
  canScore: boolean
  isScoring: boolean
  onScore: () => void
  writingMode: WritingMode
  onExit?: () => void
}

export function PracticeSidebar({
  showKeyboard,
  onToggleKeyboard,
  onReset,
  soundEnabled,
  onToggleSound,
  canScore,
  isScoring,
  onScore,
  writingMode,
  onExit,
}: PracticeSidebarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"

  // Chỉ cho phép chấm điểm ở chế độ tự viết
  const canScoreWithMode = canScore && writingMode === "self"

  return (
    <TooltipProvider>
      <aside
        className="w-14 md:w-16 border-r-[3px] border-[#141414] dark:border-[#384259] flex flex-col items-center py-4 md:py-6 gap-3 md:gap-4 bg-[#FAF7F0] dark:bg-[#11141B]"
        role="navigation"
        aria-label="Practice controls"
      >
        {/* Nút thoát về trang chủ */}
        {onExit && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onExit}
                  aria-label="Thoát về trang chủ"
                  className="hover:bg-rose-50 hover:text-rose-600 hover:border-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
                Thoát bài luyện (Về trang chủ)
              </TooltipContent>
            </Tooltip>

            <div className="w-8 border-t-2 border-[#141414]/20 dark:border-border" />
          </>
        )}

        {/* Nút chấm điểm */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant={canScoreWithMode ? "yellow" : "ghost"}
                size="icon"
                onClick={onScore}
                disabled={!canScoreWithMode || isScoring}
              >
                {isScoring ? (
                  <Loader2 className="w-5 h-5 animate-spin stroke-[2.5]" />
                ) : (
                  <Send className="w-5 h-5 stroke-[2.5]" />
                )}
                <span className="sr-only">Chấm điểm</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
            {writingMode === "ai-assisted" 
              ? "Chấm điểm chỉ khả dụng ở chế độ Tự viết" 
              : isScoring 
                ? "Đang chấm..." 
                : "Chấm điểm"}
          </TooltipContent>
        </Tooltip>

        <div className="w-8 border-t-2 border-[#141414]/20 dark:border-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={soundEnabled ? "yellow" : "outline"}
              size="icon"
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5 stroke-[2.5]" />}
              <span className="sr-only">{soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
            {soundEnabled ? "Tắt âm thanh gõ phím" : "Bật âm thanh gõ phím"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showKeyboard ? "yellow" : "outline"}
              size="icon"
              onClick={onToggleKeyboard}
              aria-pressed={showKeyboard}
            >
              <Keyboard className="w-5 h-5 stroke-[2.5]" />
              <span className="sr-only">{showKeyboard ? "Ẩn bàn phím ảo" : "Hiện bàn phím ảo"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
            {showKeyboard ? "Ẩn bàn phím ảo" : "Hiện bàn phím ảo"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onReset}>
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              <span className="sr-only">Gõ lại từ đầu</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
            Gõ lại từ đầu (Esc)
          </TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Đổi giao diện sáng/tối">
              {mounted && (isDark ? <Sun className="w-5 h-5 stroke-[2.5] text-[#FFC93C]" /> : <Moon className="w-5 h-5 stroke-[2.5]" />)}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-bold border-2 border-[#141414] bg-white text-[#141414]">
            Giao diện {isDark ? "Sáng" : "Tối"}
          </TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}
