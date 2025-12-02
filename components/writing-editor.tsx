"use client"

import { useState, useEffect } from "react"
import { Send, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { WritingMode, WritingPrompt } from "./writing-practice"

interface WritingEditorProps {
  prompt: WritingPrompt | null
  mode: WritingMode
  bandTarget: number
  onSubmit: (essay: string) => void
  isScoring: boolean
}

export function WritingEditor({ prompt, mode, bandTarget, onSubmit, isScoring }: WritingEditorProps) {
  const [essay, setEssay] = useState("")
  const [isGeneratingAssist, setIsGeneratingAssist] = useState(false)
  const wordCount = essay.split(/\s+/).filter(Boolean).length
  const minWords = prompt?.type === "task1" ? 150 : 250

  useEffect(() => {
    setEssay("")
  }, [prompt])

  const handleGenerateAssist = async () => {
    if (!prompt) return

    setIsGeneratingAssist(true)
    try {
      const response = await fetch("/api/generate-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.prompt,
          bandTarget,
          taskType: prompt.type,
          currentEssay: essay,
        }),
      })
      const result = await response.json()
      setEssay(result.suggestion)
    } catch (error) {
      console.error("Failed to generate assist:", error)
    } finally {
      setIsGeneratingAssist(false)
    }
  }

  const handleSubmit = () => {
    if (wordCount >= minWords && prompt) {
      onSubmit(essay)
    }
  }

  if (!prompt) {
    return (
      <Card className="flex min-h-[500px] flex-col items-center justify-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground text-center">Chọn chủ đề và tạo đề bài để bắt đầu viết</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="uppercase text-xs">
                {prompt.type === "task1" ? "Task 1" : "Task 2"}
              </Badge>
              <Badge variant="secondary" className="capitalize text-xs">
                {prompt.topic}
              </Badge>
              {mode === "ai-assisted" && (
                <Badge className="bg-primary/10 text-primary text-xs">Target: Band {bandTarget}</Badge>
              )}
            </div>
            <CardTitle className="text-base font-medium leading-relaxed">{prompt.prompt}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 p-4">
        {mode === "ai-assisted" && (
          <Alert className="bg-primary/5 border-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              Chế độ AI hỗ trợ: Bạn có thể yêu cầu AI gợi ý nội dung hoặc tự viết bài của mình.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative flex-1">
          <Textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder={`Viết bài của bạn ở đây... (tối thiểu ${minWords} từ)`}
            className="min-h-[350px] resize-none font-serif text-base leading-relaxed scrollbar-thin"
            disabled={isScoring}
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${wordCount < minWords ? "text-destructive" : "text-success"}`}>
              {wordCount} / {minWords} từ
            </span>
            {wordCount < minWords && (
              <span className="text-xs text-muted-foreground">(còn thiếu {minWords - wordCount} từ)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === "ai-assisted" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAssist}
                disabled={isGeneratingAssist || isScoring}
                className="gap-2 bg-transparent"
              >
                {isGeneratingAssist ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI gợi ý
              </Button>
            )}

            <Button onClick={handleSubmit} disabled={wordCount < minWords || isScoring} className="gap-2">
              {isScoring ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang chấm...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Nộp bài
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
