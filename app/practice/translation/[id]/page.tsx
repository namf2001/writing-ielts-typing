"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Loader2, Lightbulb, RotateCcw, ChevronDown, ChevronUp, Languages, Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  getExerciseById,
  addVocabulary,
  type Exercise,
} from "@/lib/storage"

interface TranslationReview {
  score: number
  isCorrect: boolean
  feedback: string
  suggestedTranslation: string
  improvements: string[]
  vocabularyTips: string[]
  grammarNotes: string
}

interface SentenceState {
  vietnamese: string
  userTranslation: string
  review: TranslationReview | null
  isReviewed: boolean
}

export default function TranslationPracticePage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string
  const mainContentRef = useRef<HTMLDivElement>(null)

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [sentences, setSentences] = useState<SentenceState[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [savedVocabs, setSavedVocabs] = useState<Set<string>>(new Set())

  // Load exercise
  useEffect(() => {
    const ex = getExerciseById(exerciseId)
    if (!ex) {
      router.push("/")
      return
    }
    setExercise(ex)

    // Parse Vietnamese essay into sentences
    if (ex.sampleEssay) {
      const vietnameseSentences = ex.sampleEssay
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0)
        .map((s) => ({
          vietnamese: s.trim(),
          userTranslation: "",
          review: null,
          isReviewed: false,
        }))
      setSentences(vietnameseSentences)
    }

    setIsLoading(false)
  }, [exerciseId, router])

  // Scroll to top when changing sentence
  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex])

  const currentSentence = sentences[currentIndex]
  const completedCount = sentences.filter((s) => s.isReviewed).length
  const progress = sentences.length > 0 ? (completedCount / sentences.length) * 100 : 0

  const handleTranslationChange = (value: string) => {
    setSentences((prev) =>
      prev.map((s, i) =>
        i === currentIndex ? { ...s, userTranslation: value } : s
      )
    )
  }

  const reviewTranslation = async () => {
    if (!exercise || !currentSentence?.userTranslation.trim()) return

    setIsReviewing(true)
    try {
      const res = await fetch("/api/review-translation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vietnameseSentence: currentSentence.vietnamese,
          userTranslation: currentSentence.userTranslation,
          prompt: exercise.prompt,
          bandTarget: exercise.bandTarget,
        }),
      })

      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setSentences((prev) =>
        prev.map((s, i) =>
          i === currentIndex
            ? { ...s, review: data.review, isReviewed: true }
            : s
        )
      )
    } catch (error) {
      console.error("Review error:", error)
      alert("Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setIsReviewing(false)
    }
  }

  const goToNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const resetCurrentSentence = () => {
    setSentences((prev) =>
      prev.map((s, i) =>
        i === currentIndex
          ? { ...s, userTranslation: "", review: null, isReviewed: false }
          : s
      )
    )
  }

  const handleAddVocabulary = (tip: string) => {
    // Parse vocabulary tip - format: "word: meaning" or just "word"
    const parts = tip.split(":")
    const word = parts[0].trim()
    const meaning = parts.length > 1 ? parts.slice(1).join(":").trim() : ""
    
    addVocabulary(word, meaning, "", "translation")
    setSavedVocabs((prev) => new Set(prev).add(tip))
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!exercise || sentences.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy bài tập</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Fixed Header */}
      <header className="shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-base font-semibold">Luyện dịch Việt - Anh</h1>
              <p className="text-xs text-muted-foreground">
                Band {exercise.bandTarget} • {exercise.taskType === "task1" ? "Task 1" : "Task 2"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant={completedCount === sentences.length ? "default" : "secondary"}>
                {completedCount}/{sentences.length} câu
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>

            {/* Sentence Navigation */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-sm font-medium min-w-[60px] text-center">
                {currentIndex + 1} / {sentences.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                disabled={currentIndex === sentences.length - 1}
                className="h-8 w-8 p-0"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Progress */}
        <div className="sm:hidden px-4 pb-2">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1 h-1.5" />
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sentence List (Desktop only) */}
        <aside className="hidden lg:flex flex-col w-72 border-r bg-muted/30">
          <div className="p-3 border-b">
            <p className="text-sm font-medium text-muted-foreground">Danh sách câu</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sentences.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-full text-left p-2.5 rounded-lg text-sm transition-all ${i === currentIndex
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : s.isReviewed
                      ? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
                      : "hover:bg-muted"
                  }`}
              >
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center ${i === currentIndex
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : s.isReviewed
                        ? "bg-green-600 text-white"
                        : "bg-muted-foreground/20"
                    }`}>
                    {s.isReviewed ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="line-clamp-2 leading-tight">{s.vietnamese}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Practice Area */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 space-y-4">
            {/* Prompt (Collapsible) */}
            <Card className="border-dashed">
              <CardHeader
                className="py-3 cursor-pointer"
                onClick={() => setShowPrompt(!showPrompt)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    📝 Đề bài IELTS
                  </CardTitle>
                  {showPrompt ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              {showPrompt && (
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">{exercise.prompt}</p>
                </CardContent>
              )}
            </Card>

            {/* Vietnamese Sentence */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Câu tiếng Việt
                    </p>
                    <p className="text-base leading-relaxed">{currentSentence?.vietnamese}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translation Input */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Bản dịch tiếng Anh của bạn</p>
                  {currentSentence?.isReviewed && (
                    <Button variant="ghost" size="sm" onClick={resetCurrentSentence}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1" />
                      Làm lại
                    </Button>
                  )}
                </div>
                <Textarea
                  value={currentSentence?.userTranslation || ""}
                  onChange={(e) => handleTranslationChange(e.target.value)}
                  placeholder="Type your English translation here..."
                  className="min-h-[120px] text-base resize-none"
                  disabled={currentSentence?.isReviewed}
                />

                {!currentSentence?.isReviewed && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {currentSentence?.userTranslation.length || 0} ký tự
                    </p>
                    <Button
                      onClick={reviewTranslation}
                      disabled={!currentSentence?.userTranslation.trim() || isReviewing}
                      className="gap-2"
                    >
                      {isReviewing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang đánh giá...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4" />
                          Nhận xét & Gợi ý
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Result */}
            {currentSentence?.review && (
              <Card className="border-green-200 dark:border-green-800 overflow-hidden">
                <CardHeader className="bg-green-50 dark:bg-green-950/30 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Nhận xét
                    </CardTitle>
                    <Badge
                      variant={currentSentence.review.score >= 7 ? "default" : currentSentence.review.score >= 5 ? "secondary" : "destructive"}
                      className="text-sm"
                    >
                      {currentSentence.review.score}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Feedback */}
                  <p className="text-sm leading-relaxed">{currentSentence.review.feedback}</p>

                  {/* Suggested Translation */}
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1.5">
                      ✨ Gợi ý dịch
                    </p>
                    <p className="text-sm italic leading-relaxed">
                      {currentSentence.review.suggestedTranslation}
                    </p>
                  </div>

                  {/* Improvements */}
                  {currentSentence.review.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">💡 Có thể cải thiện</p>
                      <ul className="space-y-1.5">
                        {currentSentence.review.improvements.map((imp, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vocabulary Tips */}
                  {currentSentence.review.vocabularyTips?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">📚 Từ vựng hay</p>
                      <div className="flex flex-wrap gap-2">
                        {currentSentence.review.vocabularyTips.map((tip, i) => {
                          const isSaved = savedVocabs.has(tip)
                          return (
                            <div
                              key={i}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all ${
                                isSaved
                                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                                  : "bg-background border-border hover:border-primary/50"
                              }`}
                            >
                              <span>{tip}</span>
                              {isSaved ? (
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              ) : (
                                <button
                                  onClick={() => handleAddVocabulary(tip)}
                                  className="ml-0.5 p-0.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                                  title="Thêm vào từ vựng"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Grammar Notes */}
                  {currentSentence.review.grammarNotes && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1.5">
                        📖 Lưu ý ngữ pháp
                      </p>
                      <p className="text-sm leading-relaxed">{currentSentence.review.grammarNotes}</p>
                    </div>
                  )}
                </CardContent>

                {/* Next Button */}
                {currentIndex < sentences.length - 1 && (
                  <div className="px-4 pb-4">
                    <Button onClick={goToNext} className="w-full gap-2">
                      Câu tiếp theo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Completion Card */}
            {completedCount === sentences.length && sentences.length > 0 && (
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">🎉 Hoàn thành xuất sắc!</h3>
                  <p className="text-muted-foreground mb-4">
                    Bạn đã dịch xong tất cả {sentences.length} câu.
                  </p>
                  <Button onClick={() => router.push("/")} size="lg">
                    <Home className="h-4 w-4 mr-2" />
                    Quay về trang chủ
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  )
}
