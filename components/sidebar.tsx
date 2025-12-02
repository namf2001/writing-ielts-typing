"use client"

import { useState, useEffect } from "react"
import { Volume2, VolumeX, Keyboard, RotateCcw, HelpCircle, ChevronLeft, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"

interface SidebarProps {
  showKeyboard: boolean
  onToggleKeyboard: () => void
  onReset: () => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export function Sidebar({ showKeyboard, onToggleKeyboard, onReset, soundEnabled, onToggleSound }: SidebarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"

  return (
    <TooltipProvider>
      <aside
        className="w-14 md:w-16 border-r border-border flex flex-col items-center py-4 md:py-8 gap-4 md:gap-6"
        role="navigation"
        aria-label="Sidebar controls"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              <span className="sr-only">Previous Chapter</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Previous Chapter</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

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
                <span className="sr-only">{soundEnabled ? "Disable sound" : "Enable sound"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}</TooltipContent>
          </Tooltip>

          {mounted && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="sr-only">{isDark ? "Chế độ sáng" : "Chế độ tối"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{isDark ? "Chế độ sáng" : "Chế độ tối"}</TooltipContent>
            </Tooltip>
          )}

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
