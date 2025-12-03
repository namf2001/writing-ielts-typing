"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Keyboard, RotateCcw, HelpCircle, Sun, Moon, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

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
  writingMode: "self" | "ai-assisted"
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
        className="w-14 md:w-16 border-r border-border flex flex-col items-center py-4 md:py-6 gap-3 md:gap-4 bg-card/50"
        role="navigation"
        aria-label="Practice controls"
      >
        {/* Nút chấm điểm - đặt ở trên cùng */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant={canScoreWithMode ? "default" : "ghost"}
                size="icon"
                className={canScoreWithMode ? "bg-primary hover:bg-primary/90" : "text-muted-foreground"}
                onClick={onScore}
                disabled={!canScoreWithMode || isScoring}
              >
                {isScoring ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="sr-only">Chấm điểm</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">
            {writingMode === "ai-assisted" 
              ? "Chấm điểm chỉ khả dụng ở chế độ Tự viết" 
              : isScoring 
                ? "Đang chấm..." 
                : "Chấm điểm"}
          </TooltipContent>
        </Tooltip>

        <div className="w-8 border-t border-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={soundEnabled ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="sr-only">{soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={showKeyboard ? "text-primary" : "text-muted-foreground hover:text-foreground"}
              onClick={onToggleKeyboard}
              aria-pressed={showKeyboard}
            >
              <Keyboard className="w-5 h-5" />
              <span className="sr-only">{showKeyboard ? "Ẩn bàn phím" : "Hiện bàn phím"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{showKeyboard ? "Ẩn bàn phím" : "Hiện bàn phím"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={onReset}
            >
              <RotateCcw className="w-5 h-5" />
              <span className="sr-only">Làm lại</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Làm lại</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-5 h-5" />
              <span className="sr-only">Trợ giúp</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Trợ giúp</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}
