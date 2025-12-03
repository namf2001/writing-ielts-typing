"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Trash2, Eye, FileText, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getSubmissions, deleteSubmission, type Submission } from "@/lib/storage"

export default function HistoryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setSubmissions(getSubmissions())
  }, [])

  const filteredSubmissions = submissions.filter((s) =>
    s.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa bài nộp này?")) {
      deleteSubmission(id)
      setSubmissions(getSubmissions())
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

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo đề bài hoặc chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Chưa có bài nộp nào</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Hoàn thành bài viết và nộp để xem lịch sử
          </p>
          <Button asChild>
            <Link href="/">Bắt đầu luyện tập</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header info */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline">
                        {submission.taskType === "task1" ? "Task 1" : "Task 2"}
                      </Badge>
                      <Badge variant="secondary">{submission.topic}</Badge>
                      <Badge variant={submission.writingMode === "ai-assisted" ? "default" : "outline"}>
                        {submission.writingMode === "ai-assisted" ? "Gõ theo mẫu" : "Tự viết"}
                      </Badge>
                    </div>

                    {/* Prompt preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {submission.prompt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(submission.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>Band {submission.bandTarget}</span>
                      </div>
                      <span>{submission.wordCount} từ</span>
                      <span>{submission.wpm} WPM</span>
                      <span>{submission.accuracy}% chính xác</span>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex flex-col items-end gap-2">
                    {submission.score && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {submission.score.overallScore}
                        </div>
                        <div className="text-xs text-muted-foreground">Band</div>
                      </div>
                    )}
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/history/${submission.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(submission.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
