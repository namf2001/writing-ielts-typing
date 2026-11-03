"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, Target, FileText, Award, Calendar, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { AnnotatedEssay, type Annotation } from "@/components/annotated-essay"
import { getSubmissionById, type Submission } from "@/lib/storage"

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"score" | "analysis">("score")
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(false)

  useEffect(() => {
    const sub = getSubmissionById(submissionId)
    if (!sub) {
      router.push("/history")
      return
    }
    setSubmission(sub)
    setIsLoading(false)
  }, [submissionId, router])

  // Fetch annotations khi chuyển sang tab phân tích
  useEffect(() => {
    if (activeTab === "analysis" && submission && annotations.length === 0) {
      fetchAnnotations()
    }
  }, [activeTab, submission])

  const fetchAnnotations = async () => {
    if (!submission) return
    
    setIsLoadingAnnotations(true)
    try {
      const response = await fetch('/api/annotate-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          essay: submission.essay, 
          prompt: submission.prompt, 
          taskType: submission.taskType 
        })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] dark:bg-[#11141B]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#141414] border-t-transparent dark:border-[#FFC93C]" />
      </div>
    )
  }

  if (!submission) return null

  const score = submission.score

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#11141B] pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Back button */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/history">
            <ArrowLeft className="h-4 w-4 mr-1.5 stroke-[2.5]" />
            Quay lại lịch sử
          </Link>
        </Button>

        {/* Overview Header */}
        <Card className="h24-block p-6 bg-white dark:bg-[#181C26]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono">
                  {submission.taskType === "task1" ? "Task 1" : "Task 2"}
                </Badge>
                <Badge variant="yellow" className="capitalize">
                  {submission.topic}
                </Badge>
                <Badge variant={submission.writingMode === "ai-assisted" ? "default" : "green"}>
                  {submission.writingMode === "ai-assisted"
                    ? "Gõ theo mẫu"
                    : submission.writingMode === "translation"
                    ? "Luyện dịch"
                    : "Tự viết"}
                </Badge>
              </div>
              <p className="text-xs font-mono font-bold text-muted-foreground">{formatDate(submission.createdAt)}</p>
            </div>

            {score && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border-[3px] border-[#141414] bg-[#FFC93C] shadow-[3px_3px_0_#141414] text-[#141414]">
                <div>
                  <div className="text-[10px] font-mono font-black uppercase">Overall Band</div>
                  <div className="text-3xl font-black font-mono leading-none">{score.overallScore}</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center pt-5 mt-5 border-t-2 border-[#141414]/10 dark:border-border">
            <div className="p-3 bg-[#FFF8EC] rounded-xl border-2 border-[#141414] dark:bg-[#232938]">
              <div className="text-2xl font-black text-[#141414] dark:text-white font-mono">{submission.wordCount}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Số từ</div>
            </div>
            <div className="p-3 bg-[#F0FDF4] rounded-xl border-2 border-[#141414] dark:bg-[#232938]">
              <div className="text-2xl font-black text-[#141414] dark:text-[#7CC243] font-mono">{submission.wpm || 0}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">WPM</div>
            </div>
            <div className="p-3 bg-[#EFF6FF] rounded-xl border-2 border-[#141414] dark:bg-[#232938]">
              <div className="text-2xl font-black text-[#141414] dark:text-[#7FB2FF] font-mono">{submission.accuracy || 100}%</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Chính xác</div>
            </div>
            <div className="p-3 bg-[#FFF1F2] rounded-xl border-2 border-[#141414] dark:bg-[#232938]">
              <div className="text-2xl font-black text-[#141414] dark:text-[#F0573A] font-mono">{submission.bandTarget}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase">Mục tiêu</div>
            </div>
          </div>
        </Card>

        {/* Prompt */}
        <Card className="h24-block p-6 bg-white dark:bg-[#181C26]">
          <h3 className="text-xs font-mono font-black uppercase tracking-wider text-muted-foreground mb-2">ĐỀ BÀI IELTS</h3>
          <p className="text-base font-bold text-[#141414] dark:text-white leading-relaxed">{submission.prompt}</p>
        </Card>

        {/* Tab Buttons */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "score" ? "default" : "outline"}
            onClick={() => setActiveTab("score")}
            className="gap-2"
          >
            <Target className="w-4 h-4 stroke-[2.5]" />
            Điểm số & Nhận xét
          </Button>
          <Button
            variant={activeTab === "analysis" ? "default" : "outline"}
            onClick={() => setActiveTab("analysis")}
            className="gap-2"
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
            Phân tích chi tiết bài viết
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === "score" ? (
          <>
            {/* Essay - Original View */}
            <Card className="h24-block p-6 bg-white dark:bg-[#181C26]">
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-muted-foreground mb-3">BÀI VIẾT CỦA BẠN</h3>
              <p className="whitespace-pre-wrap font-serif leading-relaxed text-base text-[#141414] dark:text-white font-medium">
                {submission.essay}
              </p>
            </Card>

            {/* Score Details */}
            {score && (
              <Card className="h24-block p-6 bg-white dark:bg-[#181C26] space-y-6">
                <h3 className="text-base font-black uppercase tracking-tight">Chi Tiết Điểm Số 4 Tiêu Chí</h3>

                {/* Score breakdown */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-xl border-2 border-[#141414] bg-[#FFF8EC] dark:bg-[#232938] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase">Task Response (TR)</span>
                      <span className="font-mono font-black text-base px-2 py-0.5 rounded bg-[#141414] text-white">
                        Band {score.feedback.taskResponse.score}
                      </span>
                    </div>
                    <Progress value={(score.feedback.taskResponse.score / 9) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {score.feedback.taskResponse.feedback}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[#141414] bg-[#F0FDF4] dark:bg-[#232938] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase">Coherence & Cohesion (CC)</span>
                      <span className="font-mono font-black text-base px-2 py-0.5 rounded bg-[#141414] text-white">
                        Band {score.feedback.coherenceCohesion.score}
                      </span>
                    </div>
                    <Progress value={(score.feedback.coherenceCohesion.score / 9) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {score.feedback.coherenceCohesion.feedback}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[#141414] bg-[#EFF6FF] dark:bg-[#232938] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase">Lexical Resource (LR)</span>
                      <span className="font-mono font-black text-base px-2 py-0.5 rounded bg-[#141414] text-white">
                        Band {score.feedback.lexicalResource.score}
                      </span>
                    </div>
                    <Progress value={(score.feedback.lexicalResource.score / 9) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {score.feedback.lexicalResource.feedback}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-[#141414] bg-[#FFF1F2] dark:bg-[#232938] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs uppercase">Grammar (GRA)</span>
                      <span className="font-mono font-black text-base px-2 py-0.5 rounded bg-[#141414] text-white">
                        Band {score.feedback.grammaticalRange.score}
                      </span>
                    </div>
                    <Progress value={(score.feedback.grammaticalRange.score / 9) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {score.feedback.grammaticalRange.feedback}
                    </p>
                  </div>
                </div>

                {/* Overall feedback */}
                <div className="p-5 bg-[#FAF7F0] rounded-2xl border-2 border-[#141414] dark:bg-[#232938] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7CC243] stroke-[2.5]" />
                    <h4 className="font-black text-sm uppercase">Nhận xét tổng thể</h4>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed font-medium">{score.feedback.overall}</p>
                </div>

                {/* Improvements */}
                {score.feedback.improvements && score.feedback.improvements.length > 0 && (
                  <div className="p-5 bg-[#FFF2D9] rounded-2xl border-2 border-[#141414] dark:bg-[#232938] space-y-3">
                    <h4 className="font-black text-sm uppercase text-[#141414] dark:text-[#FFC93C]">
                      Gợi ý cải thiện tiếp theo
                    </h4>
                    <ul className="space-y-2">
                      {score.feedback.improvements.map((improvement, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#141414] text-white font-bold text-[10px] dark:bg-[#FFC93C] dark:text-[#141414]">
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </>
        ) : (
          /* Phân tích chi tiết với Annotations */
          <Card className="h24-block p-6 bg-white dark:bg-[#181C26]">
            <h3 className="text-base font-black uppercase mb-1">Phân Tích Chi Tiết Từng Đoạn Văn</h3>
            <p className="text-xs text-muted-foreground font-semibold mb-4">
              Di chuột (hover) vào các đoạn được đánh dấu để xem gợi ý cải thiện cụ thể
            </p>
            {isLoadingAnnotations ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin dark:border-[#FFC93C]" />
                <p className="text-sm font-bold text-muted-foreground">Đang phân tích bài viết chi tiết...</p>
              </div>
            ) : annotations.length > 0 ? (
              <AnnotatedEssay essay={submission.essay} annotations={annotations} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40 stroke-[2]" />
                <p className="text-sm font-bold text-muted-foreground">Không có dữ liệu phân tích</p>
                <Button onClick={fetchAnnotations} variant="outline">
                  Thử lại
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/history">Quay lại lịch sử</Link>
          </Button>
          <Button variant="yellow" asChild>
            <Link href="/">Luyện tập mới</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
