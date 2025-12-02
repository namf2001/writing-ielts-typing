"use client"

import { X, Sparkles, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WritingMode, TaskType } from "./typing-practice"

interface ExercisePanelProps {
  topic: string
  setTopic: (topic: string) => void
  taskType: TaskType
  setTaskType: (type: TaskType) => void
  writingMode: WritingMode
  setWritingMode: (mode: WritingMode) => void
  bandTarget: number
  setBandTarget: (band: number) => void
  prompt: string
  sampleEssay: string | null
  onGeneratePrompt: () => void
  onGenerateEssay: () => void
  onStartPractice: () => void
  onClose: () => void
  isGeneratingPrompt: boolean
  isGeneratingEssay: boolean
}

const topics = [
  { value: "random", label: "Ngẫu nhiên" },
  { value: "education", label: "Giáo dục" },
  { value: "technology", label: "Công nghệ" },
  { value: "environment", label: "Môi trường" },
  { value: "health", label: "Sức khỏe" },
  { value: "society", label: "Xã hội" },
  { value: "work", label: "Công việc" },
  { value: "culture", label: "Văn hóa" },
]

export function ExercisePanel({
  topic,
  setTopic,
  taskType,
  setTaskType,
  writingMode,
  setWritingMode,
  bandTarget,
  setBandTarget,
  prompt,
  sampleEssay,
  onGeneratePrompt,
  onGenerateEssay,
  onStartPractice,
  onClose,
  isGeneratingPrompt,
  isGeneratingEssay,
}: ExercisePanelProps) {
  const canStart = writingMode === "self" ? prompt.length > 0 : sampleEssay !== null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h2 className="text-lg md:text-xl font-bold text-foreground">Chọn bài tập</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Topic & Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chủ đề</Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Loại bài</Label>
              <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task1">Task 1 (150+ từ)</SelectItem>
                  <SelectItem value="task2">Task 2 (250+ từ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Writing Mode */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Chế độ luyện tập</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={writingMode === "self" ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => setWritingMode("self")}
              >
                <span className="font-medium">Tự viết</span>
                <span className="text-xs text-muted-foreground">Gõ theo đề bài</span>
              </Button>
              <Button
                variant={writingMode === "ai-assisted" ? "default" : "outline"}
                className="h-auto py-3 flex-col gap-1"
                onClick={() => setWritingMode("ai-assisted")}
              >
                <span className="font-medium">AI hỗ trợ</span>
                <span className="text-xs text-muted-foreground">Gõ theo bài mẫu</span>
              </Button>
            </div>
          </div>

          {/* Band Target (for AI-assisted mode) */}
          {writingMode === "ai-assisted" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Band mục tiêu</Label>
              <Select value={bandTarget.toString()} onValueChange={(v) => setBandTarget(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((band) => (
                    <SelectItem key={band} value={band.toString()}>
                      Band {band}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Generate Prompt Button */}
          <Button
            variant="outline"
            className="w-full gap-2 bg-transparent"
            onClick={onGeneratePrompt}
            disabled={isGeneratingPrompt}
          >
            {isGeneratingPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGeneratingPrompt ? "Đang tạo đề..." : "Tạo đề bài mới"}
          </Button>

          {/* Prompt Display */}
          {prompt && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Đề bài</Label>
              <div className="p-3 md:p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{prompt}</p>
              </div>
            </div>
          )}

          {/* Generate Essay Button (AI-assisted mode) */}
          {writingMode === "ai-assisted" && prompt && (
            <Button
              variant="outline"
              className="w-full gap-2 bg-transparent"
              onClick={onGenerateEssay}
              disabled={isGeneratingEssay}
            >
              {isGeneratingEssay ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGeneratingEssay ? "Đang tạo bài mẫu..." : `Tạo bài mẫu Band ${bandTarget}`}
            </Button>
          )}

          {/* Sample Essay Display */}
          {writingMode === "ai-assisted" && sampleEssay && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bài mẫu ({sampleEssay.split(/\s+/).length} từ)</Label>
              <div className="p-3 md:p-4 bg-accent/10 rounded-lg border border-accent/30 max-h-48 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">{sampleEssay}</p>
              </div>
            </div>
          )}

          {/* Start Practice Button */}
          <Button className="w-full gap-2 h-12" onClick={onStartPractice} disabled={!canStart}>
            <Play className="w-5 h-5" />
            Bắt đầu luyện tập
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {writingMode === "self"
              ? "Bạn sẽ gõ theo đề bài để luyện tập"
              : "Bạn sẽ gõ theo bài mẫu AI để học cách viết"}
          </p>
        </div>
      </div>
    </div>
  )
}
