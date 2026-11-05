"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lightbulb,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Languages,
  Plus,
  Copy,
  Volume2,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  getExerciseById,
  addVocabulary,
  getAiHeaders,
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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load exercise
  useEffect(() => {
    const ex = getExerciseById(exerciseId)
    if (!ex) {
      router.push("/practice/translation")
      return
    }
    setExercise(ex)

    // Parse Vietnamese essay into sentences
    if (ex.sampleEssay) {
      const vietnameseSentences = ex.sampleEssay
        .split(/(?<=[.!?])\s+|\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => ({
          vietnamese: s,
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
    mainContentRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    setCopied(false)
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

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to review
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault()
      if (!isReviewing && currentSentence?.userTranslation.trim()) {
        reviewTranslation()
      }
    }
  }

  const reviewTranslation = async () => {
    if (!exercise || !currentSentence?.userTranslation.trim()) return

    setIsReviewing(true)
    try {
      const res = await fetch("/api/review-translation", {
        method: "POST",
        headers: getAiHeaders(),
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

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()

    if (isPlayingAudio) {
      setIsPlayingAudio(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 0.95
    utterance.onstart = () => setIsPlayingAudio(true)
    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)
    window.speechSynthesis.speak(utterance)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    const parts = tip.split(":")
    const word = parts[0].trim()
    const meaning = parts.length > 1 ? parts.slice(1).join(":").trim() : ""

    addVocabulary(word, meaning, "", "translation")
    setSavedVocabs((prev) => new Set(prev).add(tip))
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAF7F0] dark:bg-[#11141B]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#141414] border-t-transparent dark:border-[#FFC93C]" />
      </div>
    )
  }

  if (!exercise || sentences.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#FAF7F0] dark:bg-[#11141B] p-4">
        <p className="text-muted-foreground text-base font-bold">Không tìm thấy bài tập dịch</p>
        <Link href="/practice/translation">
          <Button variant="default">Quay lại danh sách bài dịch</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FAF7F0] dark:bg-[#11141B]">
      {/* 1. TID Top Header */}
      <header className="shrink-0 border-b-[3px] border-[#141414] bg-[#FAF7F0] dark:bg-[#11141B] dark:border-[#384259] z-20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/practice/translation"
              className="p-2 rounded-xl border-2 border-[#141414] bg-white shadow-[2px_2px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer dark:bg-[#181C26] dark:border-[#384259]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-[#141414] dark:text-white uppercase">
                  Luyện Dịch Câu Việt - Anh<span className="text-[#FF9F0A]">*</span>
                </h1>
                <Badge variant="yellow">Band {exercise.bandTarget}</Badge>
              </div>
              <p className="text-[11px] font-bold text-muted-foreground capitalize">
                Chủ đề: {exercise.topic} • {exercise.taskType === "task1" ? "IELTS Task 1" : "IELTS Task 2"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress summary */}
            <div className="hidden sm:flex items-center gap-2.5 font-mono text-xs font-bold text-[#141414] dark:text-white">
              <span>
                Đã dịch: {completedCount}/{sentences.length} câu
              </span>
              <Progress value={progress} className="w-24 h-2.5" />
            </div>

            {/* Quick sentence pager */}
            <div className="flex items-center gap-1 bg-white dark:bg-[#181C26] p-1 rounded-xl border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:border-[#384259]">
              <button
                type="button"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="h-7 w-7 p-0 flex items-center justify-center rounded-lg hover:bg-[#FFF2D9] disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
              <span className="px-2 font-mono text-xs font-black min-w-[55px] text-center">
                {currentIndex + 1} / {sentences.length}
              </span>
              <button
                type="button"
                onClick={goToNext}
                disabled={currentIndex === sentences.length - 1}
                className="h-7 w-7 p-0 flex items-center justify-center rounded-lg hover:bg-[#FFF2D9] disabled:opacity-30 cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Grid Area */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left Sentence Strip (Desktop) */}
        <aside className="hidden lg:flex flex-col w-80 border-r-[3px] border-[#141414] bg-[#FAF7F0] dark:bg-[#11141B] dark:border-[#384259]">
          <div className="p-3.5 border-b-2 border-[#141414]/15 flex items-center justify-between">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-muted-foreground">
              DANH SÁCH CÁC CÂU ({sentences.length})
            </span>
            <span className="font-mono text-xs font-black px-1.5 py-0.5 rounded bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414]">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {sentences.map((s, i) => {
              const isCurrent = i === currentIndex
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full text-left p-3 rounded-xl text-xs leading-relaxed transition-all duration-150 flex items-start gap-2.5 cursor-pointer border-2 ${
                    isCurrent
                      ? "bg-[#FFC93C] text-[#141414] border-[#141414] shadow-[3px_3px_0_#141414] font-bold"
                      : s.isReviewed
                      ? "bg-[#7CC243]/20 text-[#141414] border-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#7CC243]/20 dark:text-white"
                      : "bg-white text-muted-foreground border-[#141414]/30 hover:border-[#141414] dark:bg-[#181C26] dark:border-border"
                  }`}
                >
                  <span
                    className={`shrink-0 size-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold border border-[#141414] ${
                      isCurrent
                        ? "bg-[#141414] text-white"
                        : s.isReviewed
                        ? "bg-[#7CC243] text-[#141414]"
                        : "bg-[#FAF7F0] text-muted-foreground"
                    }`}
                  >
                    {s.isReviewed ? <Check className="w-3 h-3 stroke-[3]" /> : i + 1}
                  </span>
                  <span className="line-clamp-2 font-medium">{s.vietnamese}</span>
                </button>
              )
            })}
          </div>
        </aside>

        {/* Center Writing & Evaluation Stage */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Prompt banner */}
          <div className="p-4 rounded-2xl border-2 border-[#141414] bg-white shadow-[3px_3px_0_#141414] dark:bg-[#181C26] dark:border-[#384259]">
            <button
              type="button"
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center justify-between w-full text-left text-xs font-black uppercase text-[#141414] dark:text-white cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                ĐỀ BÀI IELTS LIÊN QUAN
              </span>
              {showPrompt ? <ChevronUp className="w-4 h-4 stroke-[2.5]" /> : <ChevronDown className="w-4 h-4 stroke-[2.5]" />}
            </button>
            {showPrompt && (
              <p className="mt-3 text-sm text-[#141414]/90 dark:text-muted-foreground leading-relaxed pt-3 border-t-2 border-[#141414]/10 font-medium">
                {exercise.prompt}
              </p>
            )}
          </div>

          {/* Current Vietnamese Sentence to Translate */}
          <div className="h24-block p-6 rounded-2xl bg-[#FFF8EC] dark:bg-[#181C26] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-black text-[#141414] dark:text-[#FFC93C]">
              <span>CÂU TIẾNG VIỆT CẦN DỊCH (CÂU {currentIndex + 1} / {sentences.length})</span>
              <Badge variant="outline" className="font-mono">IELTS Academic</Badge>
            </div>
            <p className="text-lg sm:text-xl font-bold text-[#141414] dark:text-white leading-relaxed font-serif">
              &ldquo;{currentSentence?.vietnamese}&rdquo;
            </p>
          </div>

          {/* User Translation Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#141414] dark:text-white flex items-center gap-1.5">
                <Languages className="w-4 h-4 stroke-[2.5]" />
                Bản dịch tiếng Anh của bạn
              </label>
              <span className="text-xs font-semibold text-muted-foreground">
                Nhấn <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181C26] border border-[#141414] text-[10px] font-mono">Ctrl+Enter</kbd> để chấm
              </span>
            </div>

            <Textarea
              rows={4}
              placeholder="Nhập bản dịch tiếng Anh của bạn tại đây..."
              value={currentSentence?.userTranslation || ""}
              onChange={(e) => handleTranslationChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-base sm:text-lg leading-relaxed p-4"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={resetCurrentSentence}
                disabled={!currentSentence?.userTranslation}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                Làm lại câu này
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={reviewTranslation}
                  disabled={isReviewing || !currentSentence?.userTranslation.trim()}
                  variant="green"
                  className="gap-2"
                >
                  {isReviewing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                      AI đang chấm...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 stroke-[2.5]" />
                      Chấm điểm & Phân tích
                    </>
                  )}
                </Button>

                {currentSentence?.isReviewed && currentIndex < sentences.length - 1 && (
                  <Button onClick={goToNext} variant="yellow" className="gap-1.5">
                    Câu tiếp theo
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* AI Review Results Card */}
          {currentSentence?.review && (
            <div className="h24-block p-6 rounded-2xl bg-white dark:bg-[#181C26] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#141414]/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-[#FFC93C] border-2 border-[#141414] shadow-[3px_3px_0_#141414] flex items-center justify-center text-[#141414] font-black font-mono text-xl">
                    {currentSentence.review.score}/10
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[#141414] dark:text-white">
                      {currentSentence.review.isCorrect ? "Bản dịch tốt!" : "Cần tinh chỉnh"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-semibold">{currentSentence.review.feedback}</p>
                  </div>
                </div>

                <Badge variant={currentSentence.review.score >= 8 ? "green" : "coral"}>
                  Đánh giá Band {exercise.bandTarget}+
                </Badge>
              </div>

              {/* Suggested Model Translation */}
              <div className="space-y-2 p-4 rounded-xl bg-[#F0FDF4] border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#232938]">
                <div className="flex items-center justify-between text-xs font-mono font-black text-[#141414] dark:text-[#7CC243]">
                  <span>BẢN DỊCH GỢI Ý CHUẨN IELTS BAND 8.5+</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakText(currentSentence.review!.suggestedTranslation)}
                      className="p-1 rounded-lg border border-[#141414] hover:bg-white text-[#141414] transition-colors cursor-pointer dark:text-white"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "text-emerald-500 animate-pulse" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentSentence.review!.suggestedTranslation)}
                      className="p-1 rounded-lg border border-[#141414] hover:bg-white text-[#141414] transition-colors cursor-pointer dark:text-white"
                      title="Sao chép câu"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-base font-bold text-foreground leading-relaxed font-serif">
                  {currentSentence.review.suggestedTranslation}
                </p>
                {copied && <p className="text-xs text-emerald-600 font-bold">Đã sao chép vào bộ nhớ tạm!</p>}
              </div>

              {/* Vocabulary Tips & Collocations */}
              {currentSentence.review.vocabularyTips?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-[#FF9F0A] stroke-[2.5]" />
                    Từ vựng học thuật & Collocations nên dùng
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentSentence.review.vocabularyTips.map((tip, idx) => {
                      const isSaved = savedVocabs.has(tip)
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#141414] bg-[#FFF2D9] text-xs font-bold text-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#232938] dark:text-white dark:border-[#384259]"
                        >
                          <span>{tip}</span>
                          <button
                            type="button"
                            onClick={() => handleAddVocabulary(tip)}
                            disabled={isSaved}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              isSaved ? "text-emerald-600" : "text-muted-foreground hover:text-primary"
                            }`}
                            title="Lưu vào sổ từ vựng"
                          >
                            {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Grammar Notes */}
              {currentSentence.review.grammarNotes && (
                <div className="p-4 rounded-xl bg-[#FFF8EC] border-2 border-[#141414]/20 text-xs text-muted-foreground leading-relaxed font-medium dark:bg-[#232938] dark:border-border">
                  <span className="font-bold text-[#141414] dark:text-white">Lưu ý ngữ pháp: </span>
                  {currentSentence.review.grammarNotes}
                </div>
              )}
            </div>
          )}

          {/* Completion Celebration when all sentences are reviewed */}
          {completedCount === sentences.length && (
            <div className="h24-block p-8 rounded-3xl bg-[#7CC243]/20 text-center space-y-4">
              <Award className="w-14 h-14 text-[#7CC243] mx-auto stroke-[2.5]" />
              <h3 className="text-2xl font-black text-[#141414] dark:text-white uppercase">
                Chúc Mừng! Bạn Đã Hoàn Thành Toàn Bộ Bài Dịch!<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-sm text-muted-foreground font-semibold max-w-md mx-auto">
                Tất cả các câu trong bài đã được dịch và chấm điểm chi tiết bởi AI. Hãy tiếp tục luyện tập để xây dựng phản xạ câu tự nhiên.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Link href="/practice/translation">
                  <Button variant="green" className="gap-2">
                    Luyện bài dịch khác
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Button>
                </Link>
                <Link href="/vocabulary">
                  <Button variant="outline" className="gap-2">
                    Ôn tập từ vựng đã lưu
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
