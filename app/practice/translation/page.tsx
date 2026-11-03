"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Languages,
  Sparkles,
  ArrowRight,
  BookOpen,
  Filter,
  CheckCircle2,
  GraduationCap,
  Laptop,
  Leaf,
  Heart,
  Users,
  TrendingUp,
  Palette,
  Clock,
  Plus,
  Loader2,
  Search,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createExercise, getAiHeaders } from "@/lib/storage"
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

export default function TranslationHubPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [selectedBand, setSelectedBand] = useState("all")
  const [isGenerating, setIsGenerating] = useState(false)

  // Filter translation exercises
  const translationExercises = useMemo(() => {
    return exercisesData.exercises.filter((ex) => {
      if (ex.writingMode !== "translation") return false
      if (selectedTopic !== "all" && ex.topic !== selectedTopic) return false
      if (selectedBand !== "all" && ex.bandTarget !== parseFloat(selectedBand)) return false
      if (search.trim()) {
        const query = search.toLowerCase()
        return (
          ex.prompt.toLowerCase().includes(query) ||
          ex.sampleEssay.toLowerCase().includes(query) ||
          ex.topic.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [selectedTopic, selectedBand, search])

  const handleStartExercise = (sample: typeof exercisesData.exercises[0]) => {
    const exercise = createExercise({
      prompt: sample.prompt,
      sampleEssay: sample.sampleEssay,
      taskType: sample.taskType as any,
      topic: sample.topic,
      bandTarget: sample.bandTarget,
      writingMode: "translation",
    })
    router.push(`/practice/translation/${exercise.id}`)
  }

  const handleGenerateAiTranslation = async () => {
    setIsGenerating(true)
    try {
      // 1. Generate Vietnamese essay via API
      const res = await fetch("/api/generate-vietnamese-essay", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({
          topic: selectedTopic === "all" ? "education" : selectedTopic,
          taskType: "task2",
          bandTarget: selectedBand === "all" ? 7.5 : parseFloat(selectedBand),
        }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }

      const exercise = createExercise({
        prompt: data.prompt,
        sampleEssay: data.vietnameseEssay,
        taskType: "task2",
        topic: selectedTopic === "all" ? "education" : selectedTopic,
        bandTarget: selectedBand === "all" ? 7.5 : parseFloat(selectedBand),
        writingMode: "translation",
      })

      router.push(`/practice/translation/${exercise.id}`)
    } catch (err) {
      console.error("Failed to generate translation exercise:", err)
      alert("Lỗi kết nối AI. Vui lòng thử lại.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 bg-[#FAF7F0] dark:bg-[#11141B]">
      {/* 1. TID Hero Banner */}
      <div className="h24-block relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-[#7CC243]/20 dark:bg-[#181C26] dark:border-[#384259]">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[#141414] bg-[#7CC243] text-[#141414] shadow-[2px_2px_0_#141414] font-mono text-xs font-black uppercase tracking-wider dark:border-[#384259]">
            <span className="bg-[#141414] text-white px-1.5 py-0.2 rounded text-[10px]">02</span>
            <span>PHƯƠNG PHÁP PHẢN XẠ CÂU IELTS ACADEMIC</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#141414] dark:text-white leading-[1.15]">
            Luyện Dịch Câu Việt - Anh<span className="text-[#FF9F0A]">*</span>
          </h1>

          <p className="text-sm sm:text-base text-[#141414]/85 dark:text-muted-foreground leading-relaxed font-semibold">
            Chuyển tải câu tiếng Việt sang văn phong học thuật tiếng Anh. Nhận chấm điểm và gợi ý collocations C1/C2 tức thì từ AI hoàn toàn miễn phí.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={handleGenerateAiTranslation}
              disabled={isGenerating}
              variant="green"
              size="lg"
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                  Đang khởi tạo bài dịch...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  Tạo bài tập dịch mới bằng AI
                </>
              )}
            </Button>

            <Link href="/">
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                Về chế độ gõ bài mẫu
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. TID Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border-[3px] border-[#141414] bg-white shadow-[4px_4px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] dark:shadow-[4px_4px_0_#0A0D14]">
        <div className="relative flex-1">
          <Input
            placeholder="Tìm kiếm theo chủ đề, từ khóa đề bài..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2.5">
          {/* Topic Select */}
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-36 sm:w-44">
              <SelectValue placeholder="Chủ đề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả chủ đề</SelectItem>
              {exercisesData.topics.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Band Target Select */}
          <Select value={selectedBand} onValueChange={setSelectedBand}>
            <SelectTrigger className="w-32 sm:w-36">
              <SelectValue placeholder="Band điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mọi Band</SelectItem>
              <SelectItem value="7">Band 7.0</SelectItem>
              <SelectItem value="7.5">Band 7.5</SelectItem>
              <SelectItem value="8">Band 8.0</SelectItem>
              <SelectItem value="8.5">Band 8.5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 3. TID Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {translationExercises.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground space-y-3 border-2 border-dashed border-[#141414] rounded-2xl bg-white dark:bg-[#181C26]">
            <Languages className="w-10 h-10 mx-auto opacity-40 stroke-[2]" />
            <p className="text-base font-bold">Không tìm thấy bài tập dịch phù hợp bộ lọc.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearch(""); setSelectedTopic("all"); setSelectedBand("all") }}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          translationExercises.map((ex) => {
            const firstSentence = ex.sampleEssay.split(/[.!?]\s+/)[0] || ex.sampleEssay
            const sentenceCount = ex.sampleEssay.split(/[.!?]\s+/).filter(Boolean).length

            return (
              <Card
                key={ex.id}
                className="h24-block group relative cursor-pointer flex flex-col justify-between bg-white dark:bg-[#181C26]"
                onClick={() => handleStartExercise(ex)}
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
          })
        )}
      </div>
    </div>
  )
}
