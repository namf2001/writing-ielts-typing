"use client"

import { PenLine, History, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AppView } from "./writing-practice"

interface AppNavbarProps {
  currentView: AppView
  onViewChange: (view: AppView) => void
  submissionCount: number
}

export function AppNavbar({ currentView, onViewChange, submissionCount }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <PenLine className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight">WriteAI</span>
        </div>

        <nav className="flex items-center gap-1">
          <Button
            variant={currentView === "exercise" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("exercise")}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Bài tập</span>
          </Button>

          <Button
            variant={currentView === "history" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("history")}
            className="gap-2"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch sử</span>
            {submissionCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {submissionCount}
              </Badge>
            )}
          </Button>
        </nav>
      </div>
    </header>
  )
}
