"use client"

import { BookOpen, BarChart3, PenTool, RotateCcw, Loader2, History, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ViewMode } from "./typing-practice"

interface HeaderProps {
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode) => void
  onOpenExercise: () => void
  onReset: () => void
  onScore: () => void
  canScore: boolean
  isScoring: boolean
  submissionCount: number
}

export function Header({
  viewMode,
  onChangeViewMode,
  onOpenExercise,
  onReset,
  onScore,
  canScore,
  isScoring,
  submissionCount,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-primary/10">
          <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-medium">
            IELTS Writing
          </span>
          <span className="text-sm md:text-base font-bold text-foreground tracking-wide">TypeMaster</span>
        </div>
      </div>

      <nav className="hidden sm:flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
        <Button
          variant={viewMode === "practice" ? "secondary" : "ghost"}
          size="sm"
          className="gap-2 h-8"
          onClick={() => onChangeViewMode("practice")}
        >
          <FileText className="w-4 h-4" />
          <span>Luyện tập</span>
        </Button>
        <Button
          variant={viewMode === "history" ? "secondary" : "ghost"}
          size="sm"
          className="gap-2 h-8"
          onClick={() => onChangeViewMode("history")}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử</span>
          {submissionCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
              {submissionCount}
            </span>
          )}
        </Button>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Mobile navigation */}
        <div className="flex sm:hidden items-center gap-1">
          <Button
            variant={viewMode === "practice" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => onChangeViewMode("practice")}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "history" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 relative"
            onClick={() => onChangeViewMode("history")}
          >
            <History className="w-4 h-4" />
            {submissionCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {submissionCount > 9 ? "9+" : submissionCount}
              </span>
            )}
          </Button>
        </div>

        {viewMode === "practice" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
              onClick={onOpenExercise}
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden md:inline">Bài tập</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
              onClick={onReset}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              className="gap-1.5 h-8 bg-primary hover:bg-primary/90"
              onClick={onScore}
              disabled={!canScore}
            >
              {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              <span className="hidden md:inline">{isScoring ? "Đang chấm..." : "Chấm điểm"}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
