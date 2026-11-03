"use client"

import { X, Sparkles, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WritingMode, TaskType } from "@/lib/storage"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ExercisePanelProps {
  topic: string
  setTopic: (topic: string) => void
  taskType: TaskType
  setTaskType: (type: TaskType) => void
  writingMode: WritingMode
  setWritingMode: (mode: WritingMode) => void
  bandTarget: number
  setBandTarget: (band: number) => void
  prompt: string
  sampleEssay: string | null
  onGeneratePrompt: () => void
  onGenerateEssay: () => void
  onStartPractice: () => void
  onClose: () => void
  isGeneratingPrompt: boolean
  isGeneratingEssay: boolean
}

const topics = [
  { value: "random", label: "🎲 Ngẫu nhiên" },
  { value: "education", label: "🎓 Giáo dục" },
  { value: "technology", label: "💻 Công nghệ" },
  { value: "environment", label: "🌱 Môi trường" },
  { value: "health", label: "❤️ Sức khỏe" },
  { value: "society", label: "👥 Xã hội" },
  { value: "work", label: "💼 Kinh tế / Việc làm" },
  { value: "culture", label: "🎨 Văn hóa" },
]

export function ExercisePanel({
  topic,
  setTopic,
  taskType,
  setTaskType,
  writingMode,
  setWritingMode,
  bandTarget,
  setBandTarget,
  prompt,
  sampleEssay,
  onGeneratePrompt,
  onGenerateEssay,
  onStartPractice,
  onClose,
  isGeneratingPrompt,
  isGeneratingEssay,
}: ExercisePanelProps) {
  // Chế độ tự viết: chỉ cần có đề bài
  // Chế độ AI hỗ trợ: cần có bài mẫu
  const canStart = writingMode === "self" ? prompt.length > 0 : sampleEssay !== null

  return (
    <div className="fixed inset-0 z-50 bg-[#141414]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#181C26] border-[3px] border-[#141414] dark:border-[#384259] rounded-3xl shadow-[8px_8px_0_#141414] dark:shadow-[8px_8px_0_#0A0D14] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 md:p-6 border-b-2 border-[#141414]/15 dark:border-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF9F0A] border border-[#141414]" />
            <h2 className="text-xl font-black text-[#141414] dark:text-white uppercase tracking-tight">
              Chọn Bài Tập IELTS<span className="text-[#FF9F0A]">*</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-[#141414] hover:bg-[#F0573A] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-5 md:p-7 space-y-5 md:space-y-6">
          {/* Writing Mode */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Chế độ luyện tập</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  writingMode === "self"
                    ? "border-[#141414] bg-[#FFC93C] text-[#141414] shadow-[3px_3px_0_#141414] font-black"
                    : "border-[#141414]/30 hover:border-[#141414] bg-white text-muted-foreground dark:bg-[#181C26] dark:border-border"
                }`}
                onClick={() => setWritingMode("self")}
              >
                <span className="font-black block mb-1">✍️ Tự viết (Chấm điểm)</span>
                <span className="text-xs opacity-80 font-medium">
                  Tự gõ bài theo đề, AI chấm 4 tiêu chí IELTS
                </span>
              </button>
              <button
                type="button"
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  writingMode === "ai-assisted"
                    ? "border-[#141414] bg-[#7CC243] text-[#141414] shadow-[3px_3px_0_#141414] font-black"
                    : "border-[#141414]/30 hover:border-[#141414] bg-white text-muted-foreground dark:bg-[#181C26] dark:border-border"
                }`}
                onClick={() => setWritingMode("ai-assisted")}
              >
                <span className="font-black block mb-1">⌨️ Gõ theo mẫu</span>
                <span className="text-xs opacity-80 font-medium">
                  Gõ theo bài mẫu AI chuẩn Band, luyện tốc độ WPM
                </span>
              </button>
            </div>
          </div>

          {/* Topic & Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Chủ đề</Label>
              <Select value={topic} onValueChange={setTopic} className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Loại bài</Label>
              <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)} className="w-full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task1">Task 1 (150+ từ)</SelectItem>
                  <SelectItem value="task2">Task 2 (250+ từ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Band Target (chỉ hiện ở chế độ AI hỗ trợ) */}
          {writingMode === "ai-assisted" && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Band mục tiêu</Label>
              <Select value={bandTarget.toString()} onValueChange={(v) => setBandTarget(Number(v))} className="w-full">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((band) => (
                    <SelectItem key={band} value={band.toString()}>
                      Band {band}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Generate Prompt Button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={onGeneratePrompt}
            disabled={isGeneratingPrompt}
          >
            {isGeneratingPrompt ? <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
            {isGeneratingPrompt ? "Đang tạo đề..." : "Tạo đề bài mới bằng AI"}
          </Button>

          {/* Prompt Display */}
          {prompt && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Đề bài</Label>
              <div className="p-4 bg-[#FFF8EC] rounded-2xl border-2 border-[#141414]/20 text-xs sm:text-sm font-medium leading-relaxed dark:bg-[#232938] dark:border-border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Generate Essay Button (chỉ hiện ở chế độ AI hỗ trợ) */}
          {writingMode === "ai-assisted" && prompt && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onGenerateEssay}
              disabled={isGeneratingEssay}
            >
              {isGeneratingEssay ? <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" /> : <Sparkles className="w-4 h-4 stroke-[2.5]" />}
              {isGeneratingEssay ? "Đang tạo bài mẫu..." : `Tạo bài mẫu Band ${bandTarget}`}
            </Button>
          )}

          {/* Sample Essay Display (chỉ hiện ở chế độ AI hỗ trợ) */}
          {writingMode === "ai-assisted" && sampleEssay && (
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider">
                Bài mẫu ({sampleEssay.split(/\s+/).length} từ)
              </Label>
              <div className="p-4 bg-[#F0FDF4] rounded-2xl border-2 border-[#141414]/20 max-h-48 overflow-y-auto text-xs sm:text-sm leading-relaxed font-medium dark:bg-[#232938] dark:border-border">
                <p className="whitespace-pre-wrap">{sampleEssay}</p>
              </div>
            </div>
          )}

          {/* Start Practice Button */}
          <Button
            variant="yellow"
            className="w-full gap-2 h-12 text-base"
            onClick={onStartPractice}
            disabled={!canStart}
          >
            <Play className="w-5 h-5 stroke-[2.5]" />
            Bắt đầu luyện tập ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
