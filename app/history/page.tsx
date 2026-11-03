"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Trash2, Eye, FileText, Calendar, Target, Award, Zap } from "lucide-react"
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
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#11141B] pb-16">
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#141414]/15 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border-2 border-[#141414] bg-[#9B5DE5] text-white shadow-[2px_2px_0_#141414] font-mono text-xs font-black uppercase tracking-wider dark:border-[#384259]">
              <span className="bg-[#141414] text-white px-1.5 py-0.2 rounded text-[10px]">05</span>
              TIẾN ĐỘ & BẢNG VÀNG
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141414] dark:text-white uppercase tracking-tight">
              Lịch Sử Luyện Tập & Chấm Điểm<span className="text-[#FF9F0A]">*</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Kho lưu trữ toàn bộ các bài gõ mẫu, bài dịch câu và bảng đánh giá 4 tiêu chí từ giám khảo AI.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.5]" />
            <Input
              placeholder="Tìm kiếm theo đề bài hoặc chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 font-bold"
            />
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card className="h24-block p-12 text-center bg-white dark:bg-[#181C26]">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3 stroke-[2]" />
            <h3 className="text-base font-black mb-1 uppercase">Chưa có bài nộp nào</h3>
            <p className="text-xs text-muted-foreground mb-4 font-semibold">
              Hoàn thành bài viết hoặc luyện dịch và nộp để lưu vào lịch sử tiến độ.
            </p>
            <Button asChild variant="yellow" size="sm">
              <Link href="/">Bắt đầu luyện tập ngay</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="h24-block p-5 bg-white dark:bg-[#181C26]">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    {/* Header info */}
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

                    {/* Prompt preview */}
                    <p className="text-sm font-bold text-[#141414] dark:text-white line-clamp-2">
                      {submission.prompt}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs font-mono font-bold text-muted-foreground flex-wrap pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-[#FF9F0A]" />
                        <span>{formatDate(submission.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-[#7CC243]" />
                        <span>Mục tiêu Band {submission.bandTarget}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-[#7FB2FF]" />
                        <span>{submission.wordCount} từ</span>
                      </div>
                      {submission.wpm !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-[#FF9F0A]" />
                          <span>{submission.wpm} WPM</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#141414]/10">
                    {submission.score && (
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 border-[#141414] bg-[#FFC93C] shadow-[2px_2px_0_#141414] text-[#141414]">
                        <span className="text-[10px] font-mono font-black uppercase">Band</span>
                        <span className="text-xl font-black font-mono">
                          {submission.score.overallScore}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild className="h-9">
                        <Link href={`/history/${submission.id}`}>
                          <Eye className="h-3.5 w-3.5 mr-1 stroke-[2.5]" />
                          Xem chi tiết
                        </Link>
                      </Button>
                      <button
                        type="button"
                        className="p-2 rounded-xl border-2 border-[#141414] bg-white hover:bg-[#F0573A] hover:text-white transition-all cursor-pointer dark:bg-[#181C26]"
                        onClick={() => handleDelete(submission.id)}
                        title="Xóa bài nộp"
                      >
                        <Trash2 className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
