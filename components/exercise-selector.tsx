"use client"

import { useState } from "react"
import { Sparkles, PenTool, Target, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WritingMode, WritingPrompt } from "./writing-practice"

const TOPICS = [
  { value: "random", label: "Ngẫu nhiên" },
  { value: "education", label: "Education" },
  { value: "technology", label: "Technology" },
  { value: "environment", label: "Environment" },
  { value: "health", label: "Health" },
  { value: "society", label: "Society" },
  { value: "work", label: "Work & Career" },
  { value: "culture", label: "Culture" },
]

const TASK_TYPES = [
  { value: "task2", label: "Task 2 - Essay" },
  { value: "task1", label: "Task 1 - Report" },
]

const BAND_SCORES = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9]

interface ExerciseSelectorProps {
  onSelectPrompt: (prompt: WritingPrompt) => void
  currentPrompt: WritingPrompt | null
  writingMode: WritingMode
  onModeChange: (mode: WritingMode) => void
  bandTarget: number
  onBandTargetChange: (band: number) => void
}

export function ExerciseSelector({
  onSelectPrompt,
  currentPrompt,
  writingMode,
  onModeChange,
  bandTarget,
  onBandTargetChange,
}: ExerciseSelectorProps) {
  const [topic, setTopic] = useState("random")
  const [taskType, setTaskType] = useState<"task1" | "task2">("task2")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGeneratePrompt = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic === "random" ? null : topic,
          taskType,
          bandTarget: writingMode === "ai-assisted" ? bandTarget : undefined,
        }),
      })

      const result = await response.json()

      onSelectPrompt({
        id: crypto.randomUUID(),
        topic: result.topic || topic,
        type: taskType,
        prompt: result.prompt,
        bandTarget: writingMode === "ai-assisted" ? bandTarget : undefined,
      })
    } catch (error) {
      console.error("Failed to generate prompt:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          Chọn bài tập
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Task Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Loại bài</Label>
          <Select value={taskType} onValueChange={(v) => setTaskType(v as "task1" | "task2")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Chủ đề</Label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    {t.value === "random" && <Shuffle className="h-3.5 w-3.5" />}
                    {t.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Writing Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Chế độ viết</Label>
          <RadioGroup
            value={writingMode}
            onValueChange={(v) => onModeChange(v as WritingMode)}
            className="grid grid-cols-2 gap-2"
          >
            <Label
              htmlFor="self-write"
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                writingMode === "self-write" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <RadioGroupItem value="self-write" id="self-write" className="sr-only" />
              <PenTool className="h-5 w-5" />
              <span className="text-xs font-medium">Tự viết</span>
            </Label>
            <Label
              htmlFor="ai-assisted"
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition-colors ${
                writingMode === "ai-assisted" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
              }`}
            >
              <RadioGroupItem value="ai-assisted" id="ai-assisted" className="sr-only" />
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-medium">AI hỗ trợ</span>
            </Label>
          </RadioGroup>
        </div>

        {/* Band Target (AI-Assisted mode only) */}
        {writingMode === "ai-assisted" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Band mục tiêu</Label>
            <Select value={bandTarget.toString()} onValueChange={(v) => onBandTargetChange(Number.parseFloat(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAND_SCORES.map((band) => (
                  <SelectItem key={band} value={band.toString()}>
                    Band {band}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button onClick={handleGeneratePrompt} disabled={isGenerating} className="w-full gap-2">
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Tạo đề bài
            </>
          )}
        </Button>

        {currentPrompt && (
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Đề bài hiện tại:</p>
            <p className="text-sm leading-relaxed line-clamp-4">{currentPrompt.prompt}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
