"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Sparkles,
  PenLine,
  ArrowRight,
  GraduationCap,
  Laptop,
  Leaf,
  Heart,
  Users,
  TrendingUp,
  Palette,
  BookOpen,
  Languages,
  Clock,
  Zap,
  Star,
  FileText,
  Filter,
  CheckCircle2,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { TidArrowCta } from "@/components/ui/tid-arrow-cta"
import { GsapAnimatedHud } from "@/components/gsap-animated-hud"
import {
  createExercise,
  getSubmissions,
  getAiHeaders,
  type WritingMode,
  type TaskType,
} from "@/lib/storage"
import exercisesData from "@/data/exercises.json"

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  education: <GraduationCap className="h-4 w-4" />,
  technology: <Laptop className="h-4 w-4" />,
  environment: <Leaf className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  society: <Users className="h-4 w-4" />,
  economy: <TrendingUp className="h-4 w-4" />,
  culture: <Palette className="h-4 w-4" />,
}

const TOPICS = exercisesData.topics

type ViewMode = "samples" | "translation" | "create"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<ViewMode>("samples")
  const [stats, setStats] = useState({ totalPracticed: 0, totalWords: 0, avgWpm: 0, avgAccuracy: 100 })

  // Synchronize with URL search query "?tab=translation" or "?tab=create"
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "translation") {
      setViewMode("translation")
    } else if (tab === "create") {
      setViewMode("create")
    }
  }, [searchParams])

  // Filter states
  const [filterTopic, setFilterTopic] = useState<string>("all")
  const [filterBand, setFilterBand] = useState<string>("all")
  const [filterTaskType, setFilterTaskType] = useState<string>("all")

  // Create form states
  const [writingMode, setWritingMode] = useState<WritingMode>("ai-assisted")
  const [taskType, setTaskType] = useState<TaskType>("task2")
  const [topic, setTopic] = useState("random")
  const [bandTarget, setBandTarget] = useState(7.5)
  const [prompt, setPrompt] = useState("")
  const [sampleEssay, setSampleEssay] = useState<string | null>(null)
  const [vietnameseEssay, setVietnameseEssay] = useState<string | null>(null)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false)
  const [isGeneratingVietnamese, setIsGeneratingVietnamese] = useState(false)

  // Load stats
  useEffect(() => {
    const submissions = getSubmissions()
    const words = submissions.reduce((acc, s) => acc + (s.wordCount || 0), 0)
    const validWpm = submissions.filter((s) => s.wpm && s.wpm > 0)
    const avgWpm = validWpm.length > 0 ? Math.round(validWpm.reduce((acc, s) => acc + s.wpm!, 0) / validWpm.length) : 0
    const validAcc = submissions.filter((s) => s.accuracy && s.accuracy > 0)
    const avgAcc = validAcc.length > 0 ? Math.round(validAcc.reduce((acc, s) => acc + s.accuracy!, 0) / validAcc.length) : 100

    setStats({
      totalPracticed: submissions.length,
      totalWords: words,
      avgWpm,
      avgAccuracy: avgAcc,
    })
  }, [])

  // Filter English typing samples
  const typingExercises = useMemo(() => {
    return exercisesData.exercises.filter((ex) => {
      if (ex.writingMode === "translation") return false
      if (filterTopic !== "all" && ex.topic !== filterTopic) return false
      if (filterBand !== "all" && ex.bandTarget !== parseFloat(filterBand)) return false
      if (filterTaskType !== "all" && ex.taskType !== filterTaskType) return false
      return true
    })
  }, [filterTopic, filterBand, filterTaskType])

  // Group typing exercises by band
  const typingByBand = useMemo(() => {
    const grouped: Record<number, typeof typingExercises> = {}
    typingExercises.forEach((ex) => {
      if (!grouped[ex.bandTarget]) grouped[ex.bandTarget] = []
      grouped[ex.bandTarget].push(ex)
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .map(([band, exercises]) => ({ band: parseFloat(band), exercises }))
  }, [typingExercises])

  // Filter Vietnamese -> English translation exercises
  const translationExercises = useMemo(() => {
    return exercisesData.exercises.filter((ex) => {
      if (ex.writingMode !== "translation") return false
      if (filterTopic !== "all" && ex.topic !== filterTopic) return false
      if (filterBand !== "all" && ex.bandTarget !== parseFloat(filterBand)) return false
      if (filterTaskType !== "all" && ex.taskType !== filterTaskType) return false
      return true
    })
  }, [filterTopic, filterBand, filterTaskType])

  const handleSelectSample = (sample: typeof exercisesData.exercises[0], forceMode?: WritingMode) => {
    const mode = forceMode || (sample.writingMode as WritingMode) || "ai-assisted"
    const exercise = createExercise({
      prompt: sample.prompt,
      sampleEssay: sample.sampleEssay,
      taskType: sample.taskType as TaskType,
      topic: sample.topic,
      bandTarget: sample.bandTarget,
      writingMode: mode,
    })

    if (mode === "translation") {
      router.push(`/practice/translation/${exercise.id}`)
    } else {
      router.push(`/practice/${exercise.id}`)
    }
  }

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true)
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({ topic: topic === "random" ? null : topic, taskType, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setPrompt(data.prompt)
      setSampleEssay(null)
      setVietnameseEssay(null)
    } catch (error) {
      console.error("Failed to generate prompt:", error)
      alert("Lỗi kết nối AI. Vui lòng thử lại.")
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const generateSampleEssay = async () => {
    if (!prompt) return
    setIsGeneratingEssay(true)
    try {
      const res = await fetch("/api/generate-essay", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({ prompt, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setSampleEssay(data.essay)
    } catch (error) {
      console.error("Failed to generate sample essay:", error)
      alert("Lỗi kết nối AI. Vui lòng thử lại.")
    } finally {
      setIsGeneratingEssay(false)
    }
  }

  const generateVietnameseEssay = async () => {
    if (!prompt) return
    setIsGeneratingVietnamese(true)
    try {
      const res = await fetch("/api/generate-vietnamese-essay", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({ prompt, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setVietnameseEssay(data.vietnameseEssay)
    } catch (error) {
      console.error("Failed to generate Vietnamese essay:", error)
      alert("Lỗi kết nối AI. Vui lòng thử lại.")
    } finally {
      setIsGeneratingVietnamese(false)
    }
  }

  const startPractice = () => {
    if (!prompt) return
    const essayContent = writingMode === "translation" ? vietnameseEssay : sampleEssay
    const exercise = createExercise({
      prompt,
      sampleEssay: essayContent,
      taskType,
      topic: topic === "random" ? "general" : topic,
      bandTarget,
      writingMode,
    })

    if (writingMode === "translation") {
      router.push(`/practice/translation/${exercise.id}`)
    } else {
      router.push(`/practice/${exercise.id}`)
    }
  }

  return (
    <div className="flex-1 w-full flex flex-col pb-20 bg-[#FAF7F0] dark:bg-[#11141B]">
      {/* 1. TID Hero Banner Section */}
      <section className="relative overflow-hidden border-b-[3px] border-[#141414] dark:border-[#384259] bg-[#FAF7F0] dark:bg-[#11141B] tid-grid-bg py-12 sm:py-16 px-4 sm:px-6">
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-5">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[#141414] bg-[#FFC93C] text-[#141414] shadow-[3px_3px_0_#141414] font-mono text-xs font-black uppercase tracking-wider dark:border-[#384259] dark:shadow-[3px_3px_0_#0A0D14]">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>NỀN TẢNG LUYỆN VIẾT & GÕ PHÍM IELTS CHUẨN TƯ DUY 8.5+</span>
          </div>

          {/* Headline in TID Playful Editorial Style */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#141414] dark:text-white max-w-4xl mx-auto leading-[1.15]">
            Luyện thi IELTS<span className="text-[#FF9F0A]">*</span>{" "}
            <span className="inline-block relative">
              <span className="relative z-10 underline decoration-[#FFC93C] decoration-[6px] underline-offset-8">
                Writing & Typing
              </span>
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#141414]/80 dark:text-muted-foreground max-w-2xl mx-auto leading-relaxed font-semibold">
            Phương pháp song hành thế hệ mới: Nạp phản xạ từ vựng học thuật qua{" "}
            <span className="text-[#141414] dark:text-white underline decoration-[#7CC243] decoration-2">Luyện Gõ</span>,
            rèn tư duy tự nhiên qua{" "}
            <span className="text-[#141414] dark:text-white underline decoration-[#7FB2FF] decoration-2">Luyện Dịch Việt - Anh</span>,
            và chấm điểm 4 tiêu chí IELTS miễn phí cùng AI.
          </p>

          {/* TID GSAP Animated HUD Metrics */}
          <div className="pt-4 max-w-4xl mx-auto">
            <GsapAnimatedHud
              wpm={stats.avgWpm}
              accuracy={stats.avgAccuracy}
              streak={stats.totalPracticed}
              totalWords={stats.totalWords}
            />
          </div>
        </div>
      </section>

      {/* 2. TID Signature Bento Grid (01, 02, 03, 04, 05) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF9F0A] border-2 border-[#141414]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#141414] dark:text-white uppercase tracking-tight">
              CÁC PHÂN HỆ HỌC TẬP TẠI TID<span className="text-[#FF9F0A]">*</span>
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
            05 KHÔNG GIAN
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* BENTO CARD 01: LUYỆN GÕ BÀI MẪU */}
          <div
            onClick={() => setViewMode("samples")}
            className="h24-block relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer bg-[#FFF8EC] text-[#141414] min-h-[260px] dark:bg-[#181C26] dark:text-white"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                <span className="bg-[#141414] px-2 py-0.5 text-white rounded">01</span>
                LỘ TRÌNH
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                Luyện Gõ Bài Mẫu<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Gõ phím theo nhịp điệu từng đoạn văn mẫu Band 7.5 - 8.5+. Ghi nhớ cấu trúc ngữ pháp và từ vựng tự nhiên qua vận động ngón tay.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <TidArrowCta arrowBg="bg-[#FF9F0A]" bg="bg-[#141414]" textColor="text-white">
                Khám phá cơ chế ({typingExercises.length} bài)
              </TidArrowCta>
            </div>
          </div>

          {/* BENTO CARD 02: LUYỆN DỊCH VIỆT - ANH */}
          <div
            onClick={() => setViewMode("translation")}
            className="h24-block relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer bg-[#F0FDF4] text-[#141414] min-h-[260px] dark:bg-[#181C26] dark:text-white"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                <span className="bg-[#141414] px-2 py-0.5 text-white rounded">02</span>
                DỊCH THUẬT
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                Luyện Dịch Việt - Anh<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Chuyển tải câu tiếng Việt sang tiếng Anh học thuật. AI phân tích ngữ pháp, collocations và đề xuất phiên bản Band 8.5+ tức thì.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <TidArrowCta arrowBg="bg-[#7CC243]" bg="bg-[#141414]" textColor="text-white">
                Vào luyện dịch ({translationExercises.length} bài)
              </TidArrowCta>
            </div>
          </div>

          {/* BENTO CARD 03: KHO TỪ VỰNG BAND 7.5+ */}
          <Link
            href="/vocabulary"
            className="h24-block relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer bg-[#EFF6FF] text-[#141414] min-h-[260px] dark:bg-[#181C26] dark:text-white"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                <span className="bg-[#141414] px-2 py-0.5 text-white rounded">03</span>
                TỪ VỰNG
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                Kho Từ Vựng 7.5+<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                500+ collocations, idioms & từ nối học thuật phân loại theo 7 chủ đề trọng tâm Task 1 & Task 2 kèm cơ chế lật thẻ flashcard.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <TidArrowCta arrowBg="bg-[#7FB2FF]" bg="bg-[#141414]" textColor="text-white">
                Mở kho từ vựng
              </TidArrowCta>
            </div>
          </Link>

          {/* BENTO CARD 04: CHẤM BÀI & SOÁT LỖI AI */}
          <div
            onClick={() => setViewMode("create")}
            className="h24-block relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer bg-[#FFF1F2] text-[#141414] min-h-[260px] dark:bg-[#181C26] dark:text-white"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                <span className="bg-[#141414] px-2 py-0.5 text-white rounded">04</span>
                CHẤM ĐIỂM AI
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                Chấm Bài & Soát Lỗi<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Phân tích 4 tiêu chí TR, CC, LR, GRA theo chuẩn giám khảo khảo thí IELTS quốc tế. Miễn phí với Groq Llama 3.3 70B & RAC-VL.
              </p>
            </div>
            <div className="pt-4 mt-auto">
              <TidArrowCta arrowBg="bg-[#F0573A]" arrowColor="text-white" bg="bg-[#141414]" textColor="text-white">
                Tạo bài & chấm ngay
              </TidArrowCta>
            </div>
          </div>

          {/* BENTO CARD 05: TIẾN ĐỘ & LỊCH SỬ BÀI LÀM */}
          <Link
            href="/history"
            className="h24-block relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer bg-[#FAF5FF] text-[#141414] min-h-[260px] md:col-span-2 lg:col-span-2 dark:bg-[#181C26] dark:text-white"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest uppercase">
                <span className="bg-[#141414] px-2 py-0.5 text-white rounded">05</span>
                TIẾN ĐỘ & HUY HIỆU
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none">
                Lịch Sử Luyện Tập & Biểu Đồ Phản Xạ<span className="text-[#FF9F0A]">*</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-xl">
                Theo dõi sự tiến bộ từng ngày: Tốc độ gõ phím WPM, tỷ lệ chính xác từ vựng, chuỗi ngày streak và bảng điểm chi tiết từ các lần chấm bài AI trước đây.
              </p>
            </div>
            <div className="pt-4 mt-auto flex items-center justify-between">
              <TidArrowCta arrowBg="bg-[#9B5DE5]" arrowColor="text-white" bg="bg-[#141414]" textColor="text-white">
                Xem lịch sử & bảng vàng
              </TidArrowCta>
              <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold text-muted-foreground">
                <Award className="w-4 h-4 text-[#9B5DE5]" />
                ĐÃ HOÀN THÀNH {stats.totalPracticed} BÀI TẬP
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. TID Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Navigation Switcher Tabs (TID Numbered Bento Pills) */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#FFF2D9] border-[3px] border-[#141414] shadow-[4px_4px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[4px_4px_0_#0A0D14] gap-2">
            <button
              type="button"
              onClick={() => setViewMode("samples")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                viewMode === "samples"
                  ? "bg-[#141414] text-white border-2 border-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#FFC93C] dark:text-[#141414] dark:border-[#FFC93C]"
                  : "text-foreground hover:bg-white/60 dark:hover:bg-[#232938]"
              }`}
            >
              <span className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded">01</span>
              <BookOpen className="w-4 h-4" />
              Luyện gõ bài mẫu ({typingExercises.length})
            </button>

            <button
              type="button"
              onClick={() => setViewMode("translation")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                viewMode === "translation"
                  ? "bg-[#7CC243] text-[#141414] border-2 border-[#141414] shadow-[2px_2px_0_#141414]"
                  : "text-foreground hover:bg-white/60 dark:hover:bg-[#232938]"
              }`}
            >
              <span className="font-mono text-[10px] bg-black/10 px-1 py-0.2 rounded">02</span>
              <Languages className="w-4 h-4" />
              Luyện dịch Việt - Anh ({translationExercises.length})
            </button>

            <button
              type="button"
              onClick={() => setViewMode("create")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                viewMode === "create"
                  ? "bg-[#FFC93C] text-[#141414] border-2 border-[#141414] shadow-[2px_2px_0_#141414]"
                  : "text-foreground hover:bg-white/60 dark:hover:bg-[#232938]"
              }`}
            >
              <span className="font-mono text-[10px] bg-black/10 px-1 py-0.2 rounded">03</span>
              <Sparkles className="w-4 h-4" />
              Tạo bài viết AI
            </button>
          </div>
        </div>

        {/* Filters Bar (Only for samples & translation) */}
        {viewMode !== "create" && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border-[3px] border-[#141414] bg-white shadow-[4px_4px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[4px_4px_0_#0A0D14]">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#141414] dark:text-white shrink-0">
              <Filter className="w-4 h-4 stroke-[2.5]" />
              <span>BỘ LỌC CHUYÊN ĐỀ:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Topic Select */}
              <Select value={filterTopic} onValueChange={setFilterTopic}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chủ đề</SelectItem>
                  {TOPICS.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Band Select */}
              <Select value={filterBand} onValueChange={setFilterBand}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Band" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi Band</SelectItem>
                  <SelectItem value="7">Band 7.0</SelectItem>
                  <SelectItem value="7.5">Band 7.5</SelectItem>
                  <SelectItem value="8">Band 8.0</SelectItem>
                </SelectContent>
              </Select>

              {/* Task Type Select */}
              <Select value={filterTaskType} onValueChange={setFilterTaskType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dạng bài" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Mọi dạng</SelectItem>
                  <SelectItem value="task1">Task 1</SelectItem>
                  <SelectItem value="task2">Task 2</SelectItem>
                </SelectContent>
              </Select>

              {(filterTopic !== "all" || filterBand !== "all" || filterTaskType !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterTopic("all")
                    setFilterBand("all")
                    setFilterTaskType("all")
                  }}
                  className="text-xs h-10 font-bold"
                >
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: SAMPLE ESSAY TYPING */}
        {viewMode === "samples" && (
          <div className="space-y-8">
            {typingByBand.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground border-2 border-dashed border-[#141414] rounded-2xl bg-white dark:bg-[#181C26]">
                <BookOpen className="w-10 h-10 mx-auto opacity-40 mb-2 stroke-[2]" />
                <p className="font-bold">Không tìm thấy bài gõ mẫu phù hợp với bộ lọc.</p>
              </div>
            ) : (
              typingByBand.map(({ band, exercises }) => (
                <div key={band} className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#141414] bg-[#FFC93C] text-[#141414] shadow-[2px_2px_0_#141414] text-xs font-black uppercase tracking-wider dark:border-[#384259]">
                      <Star className="w-3.5 h-3.5 fill-[#141414] stroke-[2]" />
                      Mục tiêu Band {band}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      ({exercises.length} bài mẫu chất lượng cao)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {exercises.map((ex) => {
                      const wordCount = ex.sampleEssay.trim().split(/\s+/).length
                      return (
                        <Card
                          key={ex.id}
                          className="h24-block group relative cursor-pointer flex flex-col justify-between bg-white dark:bg-[#181C26]"
                          onClick={() => handleSelectSample(ex)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="yellow" className="gap-1.5 capitalize font-bold">
                                {TOPIC_ICONS[ex.topic]}
                                {ex.topic}
                              </Badge>
                              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-[#141414] text-white uppercase dark:bg-[#FFC93C] dark:text-[#141414]">
                                {ex.taskType === "task1" ? "Task 1" : "Task 2"}
                              </span>
                            </div>

                            <h3 className="font-black text-lg text-[#141414] group-hover:text-[#FF9F0A] transition-colors line-clamp-2 dark:text-white">
                              {ex.prompt}
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                              {ex.sampleEssay}
                            </p>
                          </div>

                          <div className="pt-4 border-t-2 border-[#141414]/10 dark:border-border/60 flex items-center justify-between mt-4 text-xs font-bold text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" />
                              {wordCount} từ
                            </span>

                            <span className="flex items-center gap-1 font-black text-[#141414] dark:text-[#FFC93C] group-hover:translate-x-1 transition-transform">
                              Luyện gõ ngay
                              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                            </span>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: VIETNAMESE TO ENGLISH TRANSLATION */}
        {viewMode === "translation" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border-[3px] border-[#141414] bg-[#7CC243]/15 shadow-[4px_4px_0_#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[4px_4px_0_#0A0D14]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-[#141414] stroke-[2.5] dark:text-[#7CC243]" />
                  <h3 className="font-black text-lg text-[#141414] dark:text-white">
                    Luyện Dịch Câu Việt - Anh (IELTS Academic Translation)
                  </h3>
                </div>
                <p className="text-xs text-[#141414]/80 dark:text-muted-foreground max-w-xl font-semibold">
                  Dịch từng câu tiếng Việt sang tiếng Anh học thuật. AI đánh giá điểm số, gợi ý collocations C1/C2 và bản dịch đối chiếu tức thì.
                </p>
              </div>

              <Link href="/practice/translation">
                <Button variant="green" size="sm" className="gap-2 shrink-0">
                  Xem tất cả bài dịch
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {translationExercises.map((ex) => {
                const sentenceCount = ex.sampleEssay.split(/[.!?]\s+/).filter(Boolean).length
                const firstSentence = ex.sampleEssay.split(/[.!?]\s+/)[0] || ex.sampleEssay
                return (
                  <Card
                    key={ex.id}
                    className="h24-block group relative cursor-pointer flex flex-col justify-between bg-white dark:bg-[#181C26]"
                    onClick={() => handleSelectSample(ex, "translation")}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="green" className="gap-1.5 capitalize font-bold">
                          {TOPIC_ICONS[ex.topic]}
                          {ex.topic}
                        </Badge>
                        <Badge variant="yellow">Band {ex.bandTarget}</Badge>
                      </div>

                      <h3 className="font-black text-lg text-[#141414] group-hover:text-[#7CC243] transition-colors line-clamp-2 dark:text-white">
                        {ex.prompt}
                      </h3>

                      <div className="p-3.5 rounded-xl bg-[#FFF8EC] border-2 border-[#141414]/20 text-xs text-[#141414]/90 italic line-clamp-2 font-medium dark:bg-[#232938] dark:border-border dark:text-muted-foreground">
                        &ldquo;{firstSentence}...&rdquo;
                      </div>
                    </div>

                    <div className="pt-4 border-t-2 border-[#141414]/10 dark:border-border/60 flex items-center justify-between mt-4 text-xs font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {sentenceCount} câu cần dịch
                      </span>

                      <span className="flex items-center gap-1 font-black text-[#141414] dark:text-[#7CC243] group-hover:translate-x-1 transition-transform">
                        Bắt đầu dịch câu
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM AI ESSAY GENERATOR */}
        {viewMode === "create" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="h24-block p-6 sm:p-8 space-y-6 bg-white dark:bg-[#181C26]">
              <div>
                <h3 className="text-2xl font-black text-[#141414] dark:text-white">
                  Tạo Đề Bài Luyện Tập Bằng AI<span className="text-[#FF9F0A]">*</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 font-semibold">
                  Chọn chủ đề và mục tiêu band điểm để AI tạo đề bài và nội dung mẫu phù hợp nhất.
                </p>
              </div>

              {/* Writing Mode */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider">Chế độ luyện tập</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWritingMode("ai-assisted")}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      writingMode === "ai-assisted"
                        ? "border-[#141414] bg-[#FFC93C] text-[#141414] shadow-[3px_3px_0_#141414] font-black"
                        : "border-[#141414]/40 hover:border-[#141414] bg-white text-muted-foreground dark:bg-[#181C26] dark:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      <PenLine className="w-4 h-4 stroke-[2.5]" />
                      Luyện gõ bài mẫu
                    </div>
                    <p className="text-xs mt-1 font-medium opacity-80">Gõ theo bài văn mẫu chuẩn Band</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWritingMode("translation")}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      writingMode === "translation"
                        ? "border-[#141414] bg-[#7CC243] text-[#141414] shadow-[3px_3px_0_#141414] font-black"
                        : "border-[#141414]/40 hover:border-[#141414] bg-white text-muted-foreground dark:bg-[#181C26] dark:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-sm">
                      <Languages className="w-4 h-4 stroke-[2.5]" />
                      Luyện dịch Việt - Anh
                    </div>
                    <p className="text-xs mt-1 font-medium opacity-80">Dịch từng câu tiếng Việt sang tiếng Anh</p>
                  </button>
                </div>
              </div>

              {/* Task Type & Band Target */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Dạng bài</Label>
                  <Select value={taskType} onValueChange={(val: any) => setTaskType(val)} className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Dạng bài" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task1">IELTS Task 1 (Report)</SelectItem>
                      <SelectItem value="task2">IELTS Task 2 (Essay)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Band mục tiêu</Label>
                  <Select value={bandTarget.toString()} onValueChange={(val) => setBandTarget(parseFloat(val))} className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Band điểm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6.5">Band 6.5</SelectItem>
                      <SelectItem value="7">Band 7.0</SelectItem>
                      <SelectItem value="7.5">Band 7.5</SelectItem>
                      <SelectItem value="8">Band 8.0</SelectItem>
                      <SelectItem value="8.5">Band 8.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider">Chủ đề bài viết</Label>
                <Select value={topic} onValueChange={setTopic} className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chủ đề" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">🎲 Ngẫu nhiên</SelectItem>
                    {TOPICS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prompt generation */}
              <div className="space-y-2 pt-2 border-t-2 border-[#141414]/10 dark:border-border/60">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider">Đề bài IELTS</Label>
                  <Button
                    type="button"
                    variant="yellow"
                    size="sm"
                    onClick={generatePrompt}
                    disabled={isGeneratingPrompt}
                    className="text-xs gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                    {isGeneratingPrompt ? "Đang tạo..." : "Sinh đề bằng AI"}
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Nhập hoặc để AI sinh đề bài IELTS..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-sm font-medium"
                />
              </div>

              {/* Sample Essay or Vietnamese Essay */}
              {writingMode === "ai-assisted" && prompt && (
                <div className="space-y-2 pt-2 border-t-2 border-[#141414]/10 dark:border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider">Bài văn mẫu tiếng Anh</Label>
                    <Button
                      type="button"
                      variant="yellow"
                      size="sm"
                      onClick={generateSampleEssay}
                      disabled={isGeneratingEssay || !prompt}
                      className="text-xs gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      {isGeneratingEssay ? "Đang viết bài..." : "Tạo bài mẫu bằng AI"}
                    </Button>
                  </div>
                  {sampleEssay ? (
                    <div className="p-4 bg-[#FFF8EC] rounded-xl text-xs leading-relaxed max-h-40 overflow-y-auto border-2 border-[#141414]/20 font-medium dark:bg-[#232938] dark:border-border">
                      {sampleEssay}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic font-medium">
                      Nhấn nút &ldquo;Tạo bài mẫu bằng AI&rdquo; để chuẩn bị nội dung luyện gõ.
                    </p>
                  )}
                </div>
              )}

              {writingMode === "translation" && prompt && (
                <div className="space-y-2 pt-2 border-t-2 border-[#141414]/10 dark:border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-[#141414] dark:text-white">
                      Bài văn tiếng Việt để luyện dịch
                    </Label>
                    <Button
                      type="button"
                      variant="green"
                      size="sm"
                      onClick={generateVietnameseEssay}
                      disabled={isGeneratingVietnamese || !prompt}
                      className="text-xs gap-1.5"
                    >
                      <Languages className="w-3.5 h-3.5 stroke-[2.5]" />
                      {isGeneratingVietnamese ? "Đang tạo bài..." : "Tạo bài tiếng Việt bằng AI"}
                    </Button>
                  </div>
                  {vietnameseEssay ? (
                    <div className="p-4 bg-[#F0FDF4] rounded-xl text-xs leading-relaxed max-h-40 overflow-y-auto border-2 border-[#141414]/20 font-medium dark:bg-[#232938] dark:border-border">
                      {vietnameseEssay}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic font-medium">
                      Nhấn nút &ldquo;Tạo bài tiếng Việt bằng AI&rdquo; để chuẩn bị các câu dịch.
                    </p>
                  )}
                </div>
              )}

              {/* Start Button */}
              <div className="pt-4 flex justify-end">
                <Button
                  size="lg"
                  variant="yellow"
                  onClick={startPractice}
                  disabled={
                    !prompt ||
                    (writingMode === "ai-assisted" && !sampleEssay) ||
                    (writingMode === "translation" && !vietnameseEssay)
                  }
                  className="gap-2 text-base"
                >
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                  Bắt đầu luyện tập ngay
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Button>
              </div>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F0] dark:bg-[#11141B]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#141414] border-t-transparent dark:border-[#FFC93C]" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
