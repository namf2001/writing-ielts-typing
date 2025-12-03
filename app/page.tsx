"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, PenLine, ArrowRight, GraduationCap, Laptop, Leaf, Heart, Users, TrendingUp, Palette, Filter, Plus, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createExercise, type WritingMode, type TaskType } from "@/lib/storage"
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

type ViewMode = "samples" | "create"

export default function HomePage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("samples")
  
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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false)

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

  const startPractice = () => {
    if (!prompt) {
      alert("Vui lòng tạo đề bài trước")
      return
    }
    if (writingMode === "ai-assisted" && !sampleEssay) {
      alert("Vui lòng tạo bài mẫu trước khi luyện tập")
      return
    }
    const exercise = createExercise({
      prompt,
      sampleEssay,
      taskType,
      topic,
      bandTarget,
      writingMode,
    })
    router.push(`/practice/${exercise.id}`)
  }

  const getTopicLabel = (topicId: string) => {
    return TOPICS.find((t) => t.id === topicId)?.label || topicId
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Luyện viết IELTS</h1>
            <p className="text-muted-foreground">Chọn bài mẫu hoặc tạo bài tập mới</p>
          </div>
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
            <Button
              variant={viewMode === "samples" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("samples")}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Bài mẫu
            </Button>
            <Button
              variant={viewMode === "create" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("create")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tạo mới
            </Button>
          </div>
        </div>

        {viewMode === "samples" ? (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-base">Bộ lọc</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Chủ đề</Label>
                    <Select value={filterTopic} onValueChange={setFilterTopic}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {TOPICS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Band điểm</Label>
                    <Select value={filterBand} onValueChange={setFilterBand}>
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {exercisesData.bandLevels.map((band) => (
                          <SelectItem key={band} value={band.toString()}>Band {band}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Loại bài</Label>
                    <Select value={filterTaskType} onValueChange={setFilterTaskType}>
                      <SelectTrigger className="w-[130px] h-9">
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
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy bài mẫu phù hợp</p>
              </Card>
            ) : (
              exercisesByBand.map(({ band, exercises }) => (
                <div key={band} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-sm px-3 py-1">Band {band}</Badge>
                    <span className="text-sm text-muted-foreground">{exercises.length} bài</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {exercises.map((exercise) => (
                      <Card
                        key={exercise.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleSelectSample(exercise)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="gap-1">
                                {TOPIC_ICONS[exercise.topic]}
                                {getTopicLabel(exercise.topic)}
                              </Badge>
                              <Badge variant="secondary">
                                {exercise.taskType === "task1" ? "Task 1" : "Task 2"}
                              </Badge>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                          <p className="text-sm line-clamp-3">{exercise.prompt}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {exercise.sampleEssay.split(/\s+/).length} từ
                          </p>
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
            <Card>
              <CardHeader>
                <CardTitle>Chọn chế độ luyện tập</CardTitle>
                <CardDescription>Chọn cách bạn muốn luyện viết</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={writingMode}
                  onValueChange={(v) => setWritingMode(v as WritingMode)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="ai-assisted"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      writingMode === "ai-assisted" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="ai-assisted" id="ai-assisted" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">Gõ theo mẫu AI</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI tạo bài mẫu, bạn gõ lại để học cách viết và từ vựng
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="self"
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      writingMode === "self" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="self" id="self" className="mt-1" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PenLine className="h-4 w-4 text-primary" />
                        <span className="font-medium">Tự viết</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tự viết bài theo đề, AI chấm điểm và nhận xét
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Task Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt bài tập</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Loại bài</Label>
                    <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task1">Task 1 (150+ từ)</SelectItem>
                        <SelectItem value="task2">Task 2 (250+ từ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chủ đề</Label>
                    <Select value={topic} onValueChange={setTopic}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="random">Ngẫu nhiên</SelectItem>
                        {TOPICS.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Band mục tiêu</Label>
                    <Select value={bandTarget.toString()} onValueChange={(v) => setBandTarget(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {exercisesData.bandLevels.map((band) => (
                          <SelectItem key={band} value={band.toString()}>Band {band}</SelectItem>
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
                    <CardTitle>Đề bài</CardTitle>
                    <CardDescription>Tạo đề bài mới hoặc nhập đề của bạn</CardDescription>
                  </div>
                  <Button onClick={generatePrompt} disabled={isGeneratingPrompt}>
                    {isGeneratingPrompt ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo đề bài
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Nhấn 'Tạo đề bài' hoặc nhập đề bài của bạn..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Sample Essay */}
            {writingMode === "ai-assisted" && prompt && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Bài mẫu</CardTitle>
                      <CardDescription>AI sẽ tạo bài mẫu để bạn gõ theo</CardDescription>
                    </div>
                    <Button onClick={generateSampleEssay} disabled={isGeneratingEssay || !prompt}>
                      {isGeneratingEssay ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Tạo bài mẫu
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {sampleEssay && (
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg max-h-[300px] overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">{sampleEssay}</p>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {sampleEssay.split(/\s+/).filter(Boolean).length} từ
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Start Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={startPractice}
                disabled={!prompt || (writingMode === "ai-assisted" && !sampleEssay)}
                className="gap-2"
              >
                Bắt đầu luyện tập
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
