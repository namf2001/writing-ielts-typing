"use client"

import { useState, useEffect } from "react"
import {
  X,
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  FileText,
  Target,
  Download,
  Copy,
  Check,
  Award,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AnnotatedEssay, type Annotation } from "@/components/annotated-essay"
import { getAiHeaders } from "@/lib/storage"

export interface ScoreFeedback {
  taskResponse: { score: number; feedback: string }
  coherenceCohesion: { score: number; feedback: string }
  lexicalResource: { score: number; feedback: string }
  grammaticalRange: { score: number; feedback: string }
  overall: string
  improvements: string[]
}

export interface ScoreData {
  overallScore: number
  feedback: ScoreFeedback
}

interface ScoreResultProps {
  result: ScoreData
  essay?: string
  prompt?: string
  taskType?: string
  onClose: () => void
  onRetry: () => void
}

const CRITERIA = [
  { key: "taskResponse" as const, label: "Task Response (TR)", icon: "TR", desc: "Trả lời đúng trọng tâm đề bài" },
  { key: "coherenceCohesion" as const, label: "Coherence & Cohesion (CC)", icon: "CC", desc: "Mạch lạc và tính liên kết" },
  { key: "lexicalResource" as const, label: "Lexical Resource (LR)", icon: "LR", desc: "Vốn từ vựng và collocations" },
  { key: "grammaticalRange" as const, label: "Grammar Range & Accuracy (GRA)", icon: "GR", desc: "Đa dạng và chuẩn xác ngữ pháp" },
]

export function ScoreResult({ result, essay, prompt, taskType, onClose, onRetry }: ScoreResultProps) {
  const { overallScore, feedback } = result
  const [activeTab, setActiveTab] = useState<"score" | "analysis">("score")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)

  // Fetch annotations when user clicks on analysis tab
  useEffect(() => {
    if (activeTab === "analysis" && essay && prompt && annotations.length === 0) {
      fetchAnnotations()
    }
  }, [activeTab, essay, prompt])

  const fetchAnnotations = async () => {
    if (!essay || !prompt) return
    setIsLoadingAnnotations(true)
    try {
      const response = await fetch("/api/annotate-essay", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({ essay, prompt, taskType }),
      })
      if (!response.ok) throw new Error("Failed to fetch annotations")
      const data = await response.json()
      setAnnotations(data.annotations || [])
    } catch (error) {
      console.error("Error fetching annotations:", error)
    } finally {
      setIsLoadingAnnotations(false)
    }
  }

  const wordCount = essay ? essay.split(/\s+/).filter(Boolean).length : 0
  const minRequired = taskType === "task1" ? 150 : 250

  const handleCopyReport = async () => {
    const reportText = `### BÁO CÁO ĐÁNH GIÁ IELTS WRITING
**Band Overall: ${overallScore}**

- Task Response (TR): ${feedback.taskResponse.score}
  ${feedback.taskResponse.feedback}
- Coherence & Cohesion (CC): ${feedback.coherenceCohesion.score}
  ${feedback.coherenceCohesion.feedback}
- Lexical Resource (LR): ${feedback.lexicalResource.score}
  ${feedback.lexicalResource.feedback}
- Grammatical Range & Accuracy (GRA): ${feedback.grammaticalRange.score}
  ${feedback.grammaticalRange.feedback}

**Nhận xét tổng quan:**
${feedback.overall}

**Gợi ý cải thiện:**
${feedback.improvements.map((imp) => `- ${imp}`).join("\n")}
`
    await navigator.clipboard.writeText(reportText)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#181C26] border-[3px] border-[#141414] dark:border-[#384259] rounded-3xl shadow-[8px_8px_0_#141414] dark:shadow-[8px_8px_0_#0A0D14] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b-2 border-[#141414]/15 bg-[#FAF7F0] dark:bg-[#11141B] dark:border-border">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-[#FFC93C] border border-[#141414]">
                <Award className="w-4 h-4 text-[#141414] stroke-[2.5]" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#141414] dark:text-white uppercase tracking-tight">
                Đánh Giá IELTS Writing (Groq AI)<span className="text-[#FF9F0A]">*</span>
              </h2>
            </div>

            {/* Tab switch */}
            <div className="flex gap-1 bg-[#FFF2D9] dark:bg-[#232938] p-1 rounded-xl border border-[#141414]/30">
              <Button
                variant={activeTab === "score" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("score")}
                className="gap-1.5 h-8 text-xs font-bold"
              >
                <Target className="w-3.5 h-3.5 stroke-[2.5]" />
                Điểm số & Tiêu chí
              </Button>
              <Button
                variant={activeTab === "analysis" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("analysis")}
                className="gap-1.5 h-8 text-xs font-bold"
              >
                <FileText className="w-3.5 h-3.5 stroke-[2.5]" />
                Phân tích câu {annotations.length > 0 && `(${annotations.length})`}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReport}
              className="h-9 gap-1.5 text-xs hidden sm:flex"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReport ? "Đã chép" : "Chép báo cáo"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl border-2 border-[#141414] hover:bg-[#F0573A] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === "score" ? (
            <div className="space-y-6">
              {/* Overall Score Banner */}
              <div className="p-6 rounded-2xl border-[3px] border-[#141414] bg-[#FFC93C]/20 shadow-[4px_4px_0_#141414] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left dark:bg-[#1F2432] dark:border-[#384259]">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs uppercase tracking-wider font-mono font-black text-muted-foreground">
                      IELTS Estimated Band Score
                    </span>
                    <Badge variant="outline" className="text-[11px] font-mono">
                      {wordCount} / {minRequired} từ
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-black text-[#141414] dark:text-white">
                    {overallScore >= 7.5
                      ? "Xuất sắc! (Very Good / Expert User)"
                      : overallScore >= 6.5
                      ? "Tốt! (Competent / Good User)"
                      : overallScore >= 5.5
                      ? "Trung bình khá (Modest User)"
                      : "Cần cải thiện (Limited User)"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold max-w-xl">
                    Chấm tự động theo chuẩn tiêu chí Cambridge IELTS Band Descriptors (Task 1 & Task 2).
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center px-6 py-3 bg-[#FFC93C] rounded-2xl border-[3px] border-[#141414] shadow-[4px_4px_0_#141414] shrink-0 text-[#141414]">
                  <span className="text-[11px] font-mono uppercase font-black">Band Score</span>
                  <span className="text-5xl font-black font-mono tracking-tight">
                    {overallScore.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 4 Criteria Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {CRITERIA.map(({ key, label, icon, desc }) => {
                  const criterion = feedback[key]
                  const score = criterion?.score ?? 6.0
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-2xl border-2 border-[#141414] bg-[#FFF8EC] shadow-[3px_3px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#141414] text-white font-mono font-black text-xs dark:bg-[#FFC93C] dark:text-[#141414]">
                            {icon}
                          </span>
                          <div>
                            <h4 className="text-xs font-black text-[#141414] dark:text-white">{label}</h4>
                            <p className="text-[10px] text-muted-foreground font-medium">{desc}</p>
                          </div>
                        </div>
                        <span className="text-base font-black font-mono px-2 py-0.5 rounded-lg border border-[#141414] bg-white text-[#141414] dark:bg-[#232938] dark:text-white">
                          Band {score.toFixed(1)}
                        </span>
                      </div>

                      <Progress value={(score / 9) * 100} className="h-2" />

                      <p className="text-xs text-[#141414]/85 leading-relaxed pt-1 font-medium dark:text-muted-foreground">
                        {criterion?.feedback || "Không có nhận xét."}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Overall Feedback */}
              <div className="p-5 rounded-2xl border-2 border-[#141414] bg-white shadow-[3px_3px_0_#141414] space-y-2 dark:bg-[#181C26] dark:border-[#384259]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#7CC243] stroke-[2.5]" />
                  <h4 className="font-black text-sm uppercase">Nhận xét tổng thể</h4>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-medium">
                  {feedback.overall}
                </p>
              </div>

              {/* Actionable Improvements */}
              {feedback.improvements && feedback.improvements.length > 0 && (
                <div className="p-5 rounded-2xl border-2 border-[#141414] bg-[#FFF2D9] shadow-[3px_3px_0_#141414] space-y-3 dark:bg-[#232938] dark:border-[#384259]">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#FF9F0A] stroke-[2.5]" />
                    <h4 className="font-black text-sm uppercase text-[#141414] dark:text-[#FFC93C]">
                      Chiến lược bứt phá band điểm tiếp theo
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {feedback.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 font-medium">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#141414] text-white font-bold text-[10px] dark:bg-[#FFC93C] dark:text-[#141414]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {isLoadingAnnotations ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <div className="w-10 h-10 border-4 border-[#141414] border-t-transparent rounded-full animate-spin dark:border-[#FFC93C]" />
                  <p className="text-sm font-bold text-muted-foreground">
                    AI đang phân tích từng câu và phát hiện lỗi...
                  </p>
                </div>
              ) : annotations.length > 0 ? (
                <>
                  <div className="p-4 bg-[#FFF8EC] rounded-2xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 dark:bg-[#232938]">
                    <div>
                      <h4 className="font-black text-xs text-foreground uppercase">
                        Đã phát hiện {annotations.length} đoạn văn & câu cần lưu ý
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Di chuột hoặc chạm vào đoạn có màu gạch chân để xem lý do và cách sửa gợi ý từ AI.
                      </p>
                    </div>
                  </div>
                  <AnnotatedEssay essay={essay || ""} annotations={annotations} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/40" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Không phát hiện lỗi nghiêm trọng nào, hoặc bài viết quá ngắn để phân tích chi tiết.
                  </p>
                  <Button variant="outline" size="sm" onClick={fetchAnnotations}>
                    Thử phân tích lại
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-[#141414]/15 bg-[#FAF7F0] dark:bg-[#11141B] dark:border-border flex flex-wrap gap-2.5 justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Đóng xem bài
          </Button>
          <Button variant="yellow" size="sm" onClick={onRetry} className="gap-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5 stroke-[2.5]" />
            Luyện tập đề bài mới
          </Button>
        </div>
      </div>
    </div>
  )
}
