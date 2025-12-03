"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { getSubmissionById, type Submission } from "@/lib/storage"

export default function SubmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sub = getSubmissionById(submissionId)
    if (!sub) {
      router.push("/history")
      return
    }
    setSubmission(sub)
    setIsLoading(false)
  }, [submissionId, router])

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!submission) return null

  const score = submission.score

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/history">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại lịch sử
          </Link>
        </Button>

        {/* Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {submission.taskType === "task1" ? "Task 1" : "Task 2"}
                  </Badge>
                  <Badge variant="secondary">{submission.topic}</Badge>
                  <Badge variant={submission.writingMode === "ai-assisted" ? "default" : "outline"}>
                    {submission.writingMode === "ai-assisted" ? "Gõ theo mẫu" : "Tự viết"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(submission.createdAt)}</p>
              </div>
              {score && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{score.overallScore}</div>
                  <div className="text-sm text-muted-foreground">Band Score</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{submission.wordCount}</div>
                <div className="text-sm text-muted-foreground">Số từ</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{submission.wpm}</div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{submission.accuracy}%</div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{submission.bandTarget}</div>
                <div className="text-sm text-muted-foreground">Band mục tiêu</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đề bài</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{submission.prompt}</p>
          </CardContent>
        </Card>

        {/* Essay */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bài viết</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-serif leading-relaxed">{submission.essay}</p>
          </CardContent>
        </Card>

        {/* Score Details */}
        {score && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Chi tiết điểm số</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score breakdown */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Task Response</span>
                    <span className="font-bold">{score.feedback.taskResponse.score}</span>
                  </div>
                  <Progress value={(score.feedback.taskResponse.score / 9) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{score.feedback.taskResponse.feedback}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Coherence & Cohesion</span>
                    <span className="font-bold">{score.feedback.coherenceCohesion.score}</span>
                  </div>
                  <Progress value={(score.feedback.coherenceCohesion.score / 9) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{score.feedback.coherenceCohesion.feedback}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Lexical Resource</span>
                    <span className="font-bold">{score.feedback.lexicalResource.score}</span>
                  </div>
                  <Progress value={(score.feedback.lexicalResource.score / 9) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{score.feedback.lexicalResource.feedback}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Grammatical Range & Accuracy</span>
                    <span className="font-bold">{score.feedback.grammaticalRange.score}</span>
                  </div>
                  <Progress value={(score.feedback.grammaticalRange.score / 9) * 100} className="h-2" />
                  <p className="text-sm text-muted-foreground">{score.feedback.grammaticalRange.feedback}</p>
                </div>
              </div>

              {/* Overall feedback */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Nhận xét chung</h4>
                <p className="text-sm">{score.feedback.overall}</p>
              </div>

              {/* Improvements */}
              {score.feedback.improvements && score.feedback.improvements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Gợi ý cải thiện</h4>
                  <ul className="space-y-2">
                    {score.feedback.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/history">Quay lại lịch sử</Link>
          </Button>
          <Button asChild>
            <Link href="/">Luyện tập mới</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
