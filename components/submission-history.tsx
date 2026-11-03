"use client"

import { Clock, FileText, TrendingUp, Trash2, Eye, PlusCircle, Keyboard, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScoreData, TaskType, WritingMode } from "@/lib/storage"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export interface Submission {
  id: string
  date: string
  prompt: string
  essay: string
  taskType: TaskType
  topic: string
  writingMode: WritingMode
  bandTarget: number
  score: ScoreData
  wpm: number
  accuracy: number
  wordCount: number
}

interface SubmissionHistoryProps {
  submissions: Submission[]
  onViewSubmission: (submission: Submission) => void
  onDeleteSubmission: (id: string) => void
  onNewPractice: () => void
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function getTopicLabel(topic: string): string {
  const topics: Record<string, string> = {
    random: "Ngẫu nhiên",
    education: "Giáo dục",
    technology: "Công nghệ",
    environment: "Môi trường",
    health: "Sức khỏe",
    society: "Xã hội",
    work: "Công việc",
    culture: "Văn hóa",
  }
  return topics[topic] || topic
}

export function SubmissionHistory({
  submissions,
  onViewSubmission,
  onDeleteSubmission,
  onNewPractice,
}: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="h24-block w-full max-w-md bg-white dark:bg-[#181C26]">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFC93C] border-2 border-[#141414] shadow-[3px_3px_0_#141414] mb-4">
              <FileText className="h-8 w-8 text-[#141414] stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-black mb-2 uppercase">Chưa có bài nộp nào</h3>
            <p className="text-muted-foreground text-xs font-semibold mb-6">
              Bắt đầu luyện tập để xem lịch sử và theo dõi tiến trình của bạn.
            </p>
            <Button variant="yellow" onClick={onNewPractice} className="gap-2">
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              Bắt đầu luyện tập ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const avgScore = submissions.reduce((sum, s) => sum + s.score.overallScore, 0) / submissions.length
  const avgWpm = Math.round(submissions.reduce((sum, s) => sum + s.wpm, 0) / submissions.length)
  const totalWords = submissions.reduce((sum, s) => sum + s.wordCount, 0)

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#FAF7F0] dark:bg-[#11141B]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-3.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="h24-block p-4 rounded-2xl bg-[#FFF8EC] dark:bg-[#181C26] flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141414] text-white border-2 border-[#141414] shrink-0 dark:bg-[#FFC93C] dark:text-[#141414]">
              <FileText className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black font-mono leading-none">{submissions.length}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase pt-1">Bài đã nộp</p>
            </div>
          </div>

          <div className="h24-block p-4 rounded-2xl bg-[#FFC93C]/20 dark:bg-[#181C26] flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFC93C] text-[#141414] border-2 border-[#141414] shrink-0">
              <Target className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black font-mono leading-none">{avgScore.toFixed(1)}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase pt-1">Điểm TB</p>
            </div>
          </div>

          <div className="h24-block p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#181C26] flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB2FF] text-[#141414] border-2 border-[#141414] shrink-0">
              <Keyboard className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black font-mono leading-none">{avgWpm}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase pt-1">WPM TB</p>
            </div>
          </div>

          <div className="h24-block p-4 rounded-2xl bg-[#FFF1F2] dark:bg-[#181C26] flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0573A] text-white border-2 border-[#141414] shrink-0">
              <TrendingUp className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-black font-mono leading-none">{totalWords.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase pt-1">Tổng từ</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <Card className="h24-block bg-white dark:bg-[#181C26]">
          <CardHeader className="pb-4 border-b-2 border-[#141414]/15 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Lịch Sử Bài Nộp</CardTitle>
            <Button variant="yellow" size="sm" onClick={onNewPractice} className="gap-1.5 h-9">
              <PlusCircle className="h-4 w-4 stroke-[2.5]" />
              <span>Luyện bài mới</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border-2 border-[#141414] p-4 bg-[#FAF7F0] dark:bg-[#232938] transition-all hover:shadow-[3px_3px_0_#141414] dark:border-[#384259]"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {submission.taskType === "task1" ? "Task 1" : "Task 2"}
                    </Badge>
                    <Badge variant="yellow" className="text-[10px]">
                      {getTopicLabel(submission.topic)}
                    </Badge>
                    <Badge
                      variant={submission.writingMode === "ai-assisted" ? "default" : "green"}
                      className="text-[10px]"
                    >
                      {submission.writingMode === "ai-assisted" ? "AI hỗ trợ" : "Tự viết"}
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-[#141414] dark:text-white line-clamp-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{submission.prompt}</ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono font-bold text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#FF9F0A]" />
                      {formatDate(submission.date)}
                    </span>
                    <span>{submission.wordCount} từ</span>
                    <span>{submission.wpm} WPM</span>
                    <span>{submission.accuracy.toFixed(0)}% chính xác</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="px-3 py-1 rounded-xl border-2 border-[#141414] bg-[#FFC93C] text-[#141414] shadow-[2px_2px_0_#141414]">
                    <span className="text-lg font-black font-mono">
                      {submission.score.overallScore}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="p-2 rounded-xl border-2 border-[#141414] bg-white hover:bg-[#FFC93C] transition-all cursor-pointer dark:bg-[#181C26]"
                      onClick={() => onViewSubmission(submission)}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-xl border-2 border-[#141414] bg-white hover:bg-[#F0573A] hover:text-white transition-all cursor-pointer dark:bg-[#181C26]"
                      onClick={() => onDeleteSubmission(submission.id)}
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
