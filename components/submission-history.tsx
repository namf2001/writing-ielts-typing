"use client"

import { Clock, FileText, TrendingUp, Trash2, Eye, PlusCircle, Keyboard, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScoreData, TaskType, WritingMode } from "./typing-practice"
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

function getScoreColor(score: number): string {
  if (score >= 7) return "text-primary"
  if (score >= 5.5) return "text-yellow-500"
  return "text-destructive"
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-primary/10"
  if (score >= 5.5) return "bg-yellow-500/10"
  return "bg-destructive/10"
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
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có bài nộp nào</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Bắt đầu luyện tập để xem lịch sử và theo dõi tiến trình của bạn.
            </p>
            <Button onClick={onNewPractice} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Bắt đầu luyện tập
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
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{submissions.length}</p>
                <p className="text-xs text-muted-foreground truncate">Bài đã nộp</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${getScoreBg(avgScore)}`}>
                <Target className={`h-5 w-5 ${getScoreColor(avgScore)}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl md:text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground truncate">Điểm TB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                <Keyboard className="h-5 w-5 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{avgWpm}</p>
                <p className="text-xs text-muted-foreground truncate">WPM TB</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 shrink-0">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xl md:text-2xl font-bold">{totalWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground truncate">Tổng từ</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Lịch sử bài nộp</CardTitle>
            <Button variant="outline" size="sm" onClick={onNewPractice} className="gap-1.5 h-8 bg-transparent">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Bài mới</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px] sm:text-xs uppercase">
                      {submission.taskType === "task1" ? "Task 1" : "Task 2"}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {getTopicLabel(submission.topic)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] sm:text-xs ${
                        submission.writingMode === "ai-assisted" ? "border-primary/50 text-primary" : ""
                      }`}
                    >
                      {submission.writingMode === "ai-assisted" ? "AI hỗ trợ" : "Tự viết"}
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-table:my-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{submission.prompt}</ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(submission.date)}
                    </span>
                    <span>{submission.wordCount} từ</span>
                    <span>{submission.wpm} WPM</span>
                    <span>{submission.accuracy.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-center">
                    <span className={`text-xl sm:text-2xl font-bold ${getScoreColor(submission.score.overallScore)}`}>
                      {submission.score.overallScore}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewSubmission(submission)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Xem chi tiết</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onDeleteSubmission(submission.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Xóa</span>
                    </Button>
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
