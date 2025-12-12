"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, PenLine, ArrowRight, GraduationCap, Laptop, Leaf, Heart, Users, TrendingUp, Palette, Filter, Plus, BookOpen, Languages, Target, Clock, Award, Zap, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createExercise, getSubmissions, type WritingMode, type TaskType } from "@/lib/storage"
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

const TOPIC_COLORS: Record<string, string> = {
  education: "from-blue-500 to-indigo-500",
  technology: "from-violet-500 to-purple-500",
  environment: "from-green-500 to-emerald-500",
  health: "from-rose-500 to-pink-500",
  society: "from-orange-500 to-amber-500",
  economy: "from-cyan-500 to-teal-500",
  culture: "from-fuchsia-500 to-pink-500",
}

const TOPICS = exercisesData.topics

type ViewMode = "samples" | "create"

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("samples")
  const [stats, setStats] = useState({ totalPracticed: 0, totalWords: 0 })
  
  // Filter states
  const [filterTopic, setFilterTopic] = useState<string>("all")
  const [filterBand, setFilterBand] = useState<string>("all")
  const [filterTaskType, setFilterTaskType] = useState<string>("all")

  // Create form states
  const [writingMode, setWritingMode] = useState<WritingMode>("ai-assisted")
  const [taskType, setTaskType] = useState<TaskType>("task2")
  const [topic, setTopic] = useState("random")
  const [bandTarget, setBandTarget] = useState(7)
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
    setStats({ totalPracticed: submissions.length, totalWords: words })
  }, [])

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercisesData.exercises.filter((ex) => {
      if (filterTopic !== "all" && ex.topic !== filterTopic) return false
      if (filterBand !== "all" && ex.bandTarget !== parseFloat(filterBand)) return false
      if (filterTaskType !== "all" && ex.taskType !== filterTaskType) return false
      return true
    })
  }, [filterTopic, filterBand, filterTaskType])

  // Group exercises by band
  const exercisesByBand = useMemo(() => {
    const grouped: Record<number, typeof filteredExercises> = {}
    filteredExercises.forEach((ex) => {
      if (!grouped[ex.bandTarget]) grouped[ex.bandTarget] = []
      grouped[ex.bandTarget].push(ex)
    })
    return Object.entries(grouped)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .map(([band, exercises]) => ({ band: parseFloat(band), exercises }))
  }, [filteredExercises])

  const handleSelectSample = (sample: typeof exercisesData.exercises[0]) => {
    const exercise = createExercise({
      prompt: sample.prompt,
      sampleEssay: sample.sampleEssay,
      taskType: sample.taskType as TaskType,
      topic: sample.topic,
      bandTarget: sample.bandTarget,
      writingMode: sample.writingMode as WritingMode,
    })
    router.push(`/practice/${exercise.id}`)
  }

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true)
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic === "random" ? null : topic, taskType, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setPrompt(data.prompt)
      setSampleEssay(null)
    } catch (error) {
      console.error("Failed to generate prompt:", error)
      alert("Lỗi kết nối. Vui lòng thử lại.")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskType, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setSampleEssay(data.essay)
    } catch (error) {
      console.error("Failed to generate essay:", error)
      alert("Lỗi kết nối. Vui lòng thử lại.")
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskType, bandTarget }),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      setVietnameseEssay(data.essay)
    } catch (error) {
      console.error("Failed to generate Vietnamese essay:", error)
      alert("Lỗi kết nối. Vui lòng thử lại.")
    } finally {
      setIsGeneratingVietnamese(false)
    }
  }

  const startPractice = () => {
    if (!prompt) {
      alert("Vui lòng tạo đề bài trước")
      return
    }
    if (writingMode === "ai-assisted" && !sampleEssay) {
      alert("Vui lòng tạo bài mẫu trước khi luyện tập")
      return
    }
    if (writingMode === "translation" && !vietnameseEssay) {
      alert("Vui lòng tạo bài văn tiếng Việt trước khi luyện tập")
      return
    }
    
    const exercise = createExercise({
      prompt,
      sampleEssay: writingMode === "translation" ? vietnameseEssay : sampleEssay,
      taskType,
      topic,
      bandTarget,
      writingMode,
    })
    
    if (writingMode === "translation") {
      router.push(`/practice/translation/${exercise.id}`)
    } else {
      router.push(`/practice/${exercise.id}`)
    }
  }

  const getTopicLabel = (topicId: string) => {
    return TOPICS.find((t) => t.id === topicId)?.label || topicId
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-primary/10 to-violet-500/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Luyện tập IELTS Writing hiệu quả với AI
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Nâng cao kỹ năng viết
              <span className="block mt-2 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                IELTS Writing
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Luyện tập viết theo bài mẫu, tự viết với AI chấm điểm, hoặc dịch Việt-Anh để nâng cao từ vựng và ngữ pháp
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background/80 backdrop-blur border shadow-sm">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{exercisesData.exercises.length}</p>
                  <p className="text-xs text-muted-foreground">Bài mẫu có sẵn</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background/80 backdrop-blur border shadow-sm">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{stats.totalPracticed}</p>
                  <p className="text-xs text-muted-foreground">Bài đã luyện</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-background/80 backdrop-blur border shadow-sm">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Zap className="h-5 w-5 text-violet-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Từ đã viết</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex gap-2 p-1.5 bg-muted rounded-xl">
              <Button
                variant={viewMode === "samples" ? "default" : "ghost"}
                size="lg"
                onClick={() => setViewMode("samples")}
                className={`gap-2 rounded-lg transition-all ${viewMode === "samples" ? "shadow-md" : ""}`}
              >
                <BookOpen className="h-5 w-5" />
                Bài mẫu có sẵn
              </Button>
              <Button
                variant={viewMode === "create" ? "default" : "ghost"}
                size="lg"
                onClick={() => setViewMode("create")}
                className={`gap-2 rounded-lg transition-all ${viewMode === "create" ? "shadow-md" : ""}`}
              >
                <Plus className="h-5 w-5" />
                Tạo bài tập mới
              </Button>
            </div>
          </div>

          {viewMode === "samples" ? (
            <div className="space-y-8">
              {/* Filters */}
              <Card className="border-dashed bg-muted/30 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Filter className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-base">Lọc bài mẫu</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Chủ đề</Label>
                      <Select value={filterTopic} onValueChange={setFilterTopic}>
                        <SelectTrigger className="w-[160px] h-10 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả chủ đề</SelectItem>
                          {TOPICS.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Band điểm</Label>
                      <Select value={filterBand} onValueChange={setFilterBand}>
                        <SelectTrigger className="w-[140px] h-10 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả band</SelectItem>
                          {exercisesData.bandLevels.map((band) => (
                            <SelectItem key={band} value={band.toString()}>Band {band}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Loại bài</Label>
                      <Select value={filterTaskType} onValueChange={setFilterTaskType}>
                        <SelectTrigger className="w-[140px] h-10 bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="task1">Task 1</SelectItem>
                          <SelectItem value="task2">Task 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Exercises */}
              {exercisesByBand.length === 0 ? (
                <Card className="p-16 text-center border-dashed">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">Không tìm thấy bài mẫu</p>
                  <p className="text-muted-foreground mt-1">Thử thay đổi bộ lọc để xem thêm bài mẫu</p>
                </Card>
              ) : (
                exercisesByBand.map(({ band, exercises }) => (
                  <div key={band} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-violet-500 text-white font-bold shadow-lg shadow-primary/25">
                        <Star className="h-4 w-4" />
                        Band {band}
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                      <span className="text-sm text-muted-foreground">{exercises.length} bài mẫu</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {exercises.map((exercise, idx) => (
                        <Card
                          key={exercise.id}
                          className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
                          onClick={() => handleSelectSample(exercise)}
                        >
                          <div className={`h-1 bg-gradient-to-r ${TOPIC_COLORS[exercise.topic] || "from-gray-500 to-gray-600"}`} />
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="gap-1.5 px-3 py-1">
                                  {TOPIC_ICONS[exercise.topic]}
                                  {getTopicLabel(exercise.topic)}
                                </Badge>
                                <Badge variant="secondary" className="px-3 py-1">
                                  {exercise.taskType === "task1" ? "Task 1" : "Task 2"}
                                </Badge>
                              </div>
                              <div className="p-2 rounded-full bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors">
                              {exercise.prompt}
                            </p>
                            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                ~{Math.ceil(exercise.sampleEssay.split(/\s+/).length / 40)} phút
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <PenLine className="h-3.5 w-3.5" />
                                {exercise.sampleEssay.split(/\s+/).length} từ
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Mode Selection */}
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-violet-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Chọn chế độ luyện tập
                  </CardTitle>
                  <CardDescription>Mỗi chế độ có cách tiếp cận khác nhau để giúp bạn cải thiện kỹ năng viết</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={writingMode}
                    onValueChange={(v) => {
                      setWritingMode(v as WritingMode)
                      setSampleEssay(null)
                      setVietnameseEssay(null)
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <Label
                      htmlFor="ai-assisted"
                      className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        writingMode === "ai-assisted" 
                          ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10" 
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <RadioGroupItem value="ai-assisted" id="ai-assisted" className="sr-only" />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        writingMode === "ai-assisted" ? "bg-primary text-white" : "bg-muted"
                      }`}>
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-lg">Gõ theo mẫu AI</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        AI tạo bài mẫu chuẩn, bạn gõ lại để học cách viết và từ vựng IELTS
                      </p>
                      {writingMode === "ai-assisted" && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </Label>
                    <Label
                      htmlFor="self"
                      className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        writingMode === "self" 
                          ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10" 
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <RadioGroupItem value="self" id="self" className="sr-only" />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        writingMode === "self" ? "bg-primary text-white" : "bg-muted"
                      }`}>
                        <PenLine className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-lg">Tự viết bài</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        Tự viết bài hoàn chỉnh, AI sẽ chấm điểm và đưa ra nhận xét chi tiết
                      </p>
                      {writingMode === "self" && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </Label>
                    <Label
                      htmlFor="translation"
                      className={`relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all ${
                        writingMode === "translation" 
                          ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10" 
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <RadioGroupItem value="translation" id="translation" className="sr-only" />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                        writingMode === "translation" ? "bg-primary text-white" : "bg-muted"
                      }`}>
                        <Languages className="h-6 w-6" />
                      </div>
                      <span className="font-semibold text-lg">Dịch Việt - Anh</span>
                      <p className="text-sm text-muted-foreground mt-2">
                        Dịch từng câu tiếng Việt sang Anh, AI nhận xét và gợi ý cách dịch hay
                      </p>
                      {writingMode === "translation" && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Task Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Cài đặt bài tập
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Loại bài</Label>
                      <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task1">Task 1 (150+ từ)</SelectItem>
                          <SelectItem value="task2">Task 2 (250+ từ)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Chủ đề</Label>
                      <Select value={topic} onValueChange={setTopic}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="random">🎲 Ngẫu nhiên</SelectItem>
                          {TOPICS.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Band mục tiêu</Label>
                      <Select value={bandTarget.toString()} onValueChange={(v) => setBandTarget(Number(v))}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {exercisesData.bandLevels.map((band) => (
                            <SelectItem key={band} value={band.toString()}>⭐ Band {band}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <PenLine className="h-5 w-5 text-primary" />
                        Đề bài
                      </CardTitle>
                      <CardDescription>Tạo đề bài tự động bằng AI hoặc nhập đề của bạn</CardDescription>
                    </div>
                    <Button onClick={generatePrompt} disabled={isGeneratingPrompt} size="lg" className="gap-2">
                      {isGeneratingPrompt ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Tạo đề bài AI
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Nhấn 'Tạo đề bài AI' để tạo đề tự động, hoặc nhập đề bài của bạn vào đây..."
                    className="min-h-[140px] text-base"
                  />
                </CardContent>
              </Card>

              {/* Sample Essay */}
              {writingMode === "ai-assisted" && prompt && (
                <Card className="border-green-200 dark:border-green-800/50">
                  <CardHeader className="bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <BookOpen className="h-5 w-5" />
                          Bài mẫu
                        </CardTitle>
                        <CardDescription>AI sẽ viết bài mẫu chuẩn band {bandTarget} để bạn gõ theo</CardDescription>
                      </div>
                      <Button onClick={generateSampleEssay} disabled={isGeneratingEssay || !prompt} size="lg" variant="outline" className="gap-2 border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900/30">
                        {isGeneratingEssay ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Đang viết...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Tạo bài mẫu
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {sampleEssay && (
                    <CardContent className="pt-4">
                      <div className="p-5 bg-muted/50 rounded-xl max-h-[300px] overflow-y-auto border">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{sampleEssay}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="secondary" className="gap-1">
                          <PenLine className="h-3 w-3" />
                          {sampleEssay.split(/\s+/).filter(Boolean).length} từ
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          ~{Math.ceil(sampleEssay.split(/\s+/).filter(Boolean).length / 40)} phút
                        </Badge>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Vietnamese Essay */}
              {writingMode === "translation" && prompt && (
                <Card className="border-blue-200 dark:border-blue-800/50">
                  <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                          <Languages className="h-5 w-5" />
                          Bài văn tiếng Việt
                        </CardTitle>
                        <CardDescription>AI sẽ viết bài văn tiếng Việt để bạn dịch sang tiếng Anh</CardDescription>
                      </div>
                      <Button onClick={generateVietnameseEssay} disabled={isGeneratingVietnamese || !prompt} size="lg" variant="outline" className="gap-2 border-blue-300 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/30">
                        {isGeneratingVietnamese ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Đang viết...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Tạo bài văn
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {vietnameseEssay && (
                    <CardContent className="pt-4">
                      <div className="p-5 bg-muted/50 rounded-xl max-h-[300px] overflow-y-auto border">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{vietnameseEssay}</p>
                      </div>
                      <div className="mt-3">
                        <Badge variant="secondary" className="gap-1">
                          <PenLine className="h-3 w-3" />
                          {vietnameseEssay.split(/\s+/).filter(Boolean).length} từ
                        </Badge>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Start Button */}
              <div className="flex justify-center pt-4">
                <Button
                  size="lg"
                  onClick={startPractice}
                  disabled={!prompt || (writingMode === "ai-assisted" && !sampleEssay) || (writingMode === "translation" && !vietnameseEssay)}
                  className="gap-3 h-14 px-10 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Zap className="h-5 w-5" />
                  Bắt đầu luyện tập
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
