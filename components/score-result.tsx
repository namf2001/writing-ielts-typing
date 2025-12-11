"use client"

import { useState, useEffect } from "react"
import { X, RotateCcw, CheckCircle2, Lightbulb, FileText, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AnnotatedEssay, type Annotation } from "@/components/annotated-essay"
import type { ScoreData } from "./typing-practice"

interface ScoreResultProps {
  result: ScoreData
  essay?: string
  prompt?: string
  taskType?: string
  onClose: () => void
  onRetry: () => void
}

const CRITERIA = [
  { key: "taskResponse", label: "Task Response", icon: "TR" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion", icon: "CC" },
  { key: "lexicalResource", label: "Lexical Resource", icon: "LR" },
  { key: "grammaticalRange", label: "Grammatical Range", icon: "GR" },
] as const

function getScoreColor(score: number): string {
  if (score >= 7) return "text-accent"
  if (score >= 5.5) return "text-primary"
  return "text-destructive"
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-accent/20"
  if (score >= 5.5) return "bg-primary/20"
  return "bg-destructive/20"
}

export function ScoreResult({ result, essay, prompt, taskType, onClose, onRetry }: ScoreResultProps) {
  const { overallScore, feedback } = result
  const [activeTab, setActiveTab] = useState<"score" | "analysis">("score")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false)

  // Fetch annotations khi người dùng chuyển sang tab phân tích
  useEffect(() => {
    if (activeTab === "analysis" && essay && prompt && taskType && annotations.length === 0) {
      fetchAnnotations()
    }
  }, [activeTab, essay, prompt, taskType])

  const fetchAnnotations = async () => {
    if (!essay || !prompt || !taskType) return
    
    setIsLoadingAnnotations(true)
    try {
      const response = await fetch('/api/annotate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay, prompt, taskType })
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch annotations')
      }
      
      const data = await response.json()
      setAnnotations(data.annotations || [])
    } catch (error) {
      console.error('Error fetching annotations:', error)
      alert('Không thể tải phân tích chi tiết. Vui lòng thử lại.')
    } finally {
      setIsLoadingAnnotations(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-lg md:text-xl font-bold text-foreground">Kết quả chấm điểm</h2>
            
            {/* Tab Buttons */}
            {essay && prompt && taskType && (
              <div className="flex gap-2">
                <Button
                  variant={activeTab === "score" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("score")}
                  className="gap-2"
                >
                  <Target className="w-4 h-4" />
                  Điểm số
                </Button>
                <Button
                  variant={activeTab === "analysis" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("analysis")}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Phân tích chi tiết
                </Button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "score" ? (
            <div className="p-4 md:p-6 space-y-6">
              {/* Overall Score */}
              <div className={`p-6 rounded-xl ${getScoreBg(overallScore)} text-center`}>
                <p className="text-sm font-medium text-muted-foreground mb-2">Điểm tổng</p>
                <p className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</p>
              </div>

              {/* Criteria Scores */}
              <div className="grid gap-4 sm:grid-cols-2">
                {CRITERIA.map(({ key, label, icon }) => {
                  const criterion = feedback[key]
                  return (
                    <div key={key} className="p-4 rounded-lg bg-secondary/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded bg-muted text-xs font-bold">
                            {icon}
                          </span>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <span className={`text-lg font-bold ${getScoreColor(criterion.score)}`}>{criterion.score}</span>
                      </div>
                      <Progress value={(criterion.score / 9) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{criterion.feedback}</p>
                    </div>
                  )
                })}
              </div>

              {/* Overall Feedback */}
              <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <h4 className="font-medium">Nhận xét chung</h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feedback.overall}</p>
              </div>

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Gợi ý cải thiện</h4>
                  </div>
                  <ul className="space-y-2">
                    {feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="leading-relaxed">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 md:p-6">
              {isLoadingAnnotations ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Đang phân tích bài viết chi tiết...</p>
                </div>
              ) : annotations.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Phân tích chi tiết từng đoạn văn</h3>
                    <p className="text-sm text-muted-foreground">
                      Di chuột (hover) qua các đoạn được đánh dấu để xem gợi ý cải thiện cụ thể
                    </p>
                  </div>
                  <AnnotatedEssay essay={essay || ""} annotations={annotations} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Không có dữ liệu phân tích</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="p-4 md:p-6 border-t border-border bg-card">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={onClose}>
              Đóng
            </Button>
            <Button className="flex-1 gap-2" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" />
              Làm bài mới
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
