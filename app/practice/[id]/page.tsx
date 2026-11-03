"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { PracticeSidebar } from "@/components/practice-sidebar"
import { TypingArea } from "@/components/typing-area"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { StatsBar } from "@/components/stats-bar"
import { ScoreResult, type ScoreData } from "@/components/score-result"
import { useSound } from "@/hooks/use-sound"
import {
  getExerciseById,
  createSubmission,
  saveCurrentPractice,
  getCurrentPractice,
  clearCurrentPractice,
  getSettings,
  getAiHeaders,
  type Exercise,
} from "@/lib/storage"

export default function PracticePage() {
  const params = useParams()
  const router = useRouter()
  const exerciseId = params.id as string

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [text, setText] = useState("")
  const [typedText, setTypedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const [totalErrors, setTotalErrors] = useState(0)
  const [isPaused, setIsPaused] = useState(true)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [activeKey, setActiveKey] = useState<string>("")
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreData | null>(null)
  const [showScore, setShowScore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fontSize, setFontSize] = useState(16)

  // Exam Countdown Timer
  const [examRemainingSeconds, setExamRemainingSeconds] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const { playKeySound, playErrorSound, playSpaceSound } = useSound()

  // Load exercise and saved practice
  useEffect(() => {
    const ex = getExerciseById(exerciseId)
    if (!ex) {
      router.push("/")
      return
    }
    setExercise(ex)

    // Load user settings
    const settings = getSettings()
    setShowKeyboard(settings.showKeyboard ?? true)
    setSoundEnabled(settings.soundEnabled ?? true)
    setFontSize(settings.fontSize ?? 16)

    // Exam timer setup
    const timerMinutes =
      settings.examTimerMinutes > 0
        ? settings.examTimerMinutes
        : ex.taskType === "task1"
        ? 20
        : 40

    if (settings.examTimerMinutes > 0) {
      setExamRemainingSeconds(timerMinutes * 60)
    }

    // Set text based on writing mode
    if (ex.writingMode === "ai-assisted" && ex.sampleEssay) {
      setText(ex.sampleEssay)
    } else {
      setText("")
    }

    // Restore saved practice if exists
    const saved = getCurrentPractice()
    if (saved && saved.exerciseId === exerciseId) {
      setTypedText(saved.typedText)
      setCurrentIndex(saved.currentIndex)
      if (saved.startTime) setStartTime(saved.startTime)
    }

    setIsLoading(false)
  }, [exerciseId, router])

  // Countdown timer effect
  useEffect(() => {
    if (!isPaused && examRemainingSeconds !== null && examRemainingSeconds > 0) {
      const timer = setInterval(() => {
        setExamRemainingSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPaused, examRemainingSeconds])

  // Auto-save practice
  useEffect(() => {
    if (!exercise || !typedText) return

    const timeoutId = setTimeout(() => {
      saveCurrentPractice({
        exerciseId,
        typedText,
        currentIndex,
        startTime,
      })
    }, 1500)

    return () => clearTimeout(timeoutId)
  }, [exerciseId, typedText, currentIndex, startTime, exercise])

  // Calculate stats
  const calculateStats = useCallback(() => {
    if (!startTime || currentIndex === 0) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const wordsTyped = currentIndex / 5
    setWpm(Math.round(wordsTyped / Math.max(timeElapsed, 0.05)))

    const totalChars = currentIndex
    const correctChars = totalChars - totalErrors
    setAccuracy(Math.max(0, Math.round((correctChars / totalChars) * 100 * 100) / 100))
  }, [startTime, currentIndex, totalErrors])

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(calculateStats, 500)
      return () => clearInterval(interval)
    }
  }, [isPaused, calculateStats])

  // Handle keyboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showScore || !exercise) return

      // Ignore shortcut keys
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        e.preventDefault()
      }

      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
        return
      }

      if (isPaused && (e.key.length === 1 || e.key === "Enter")) {
        setIsPaused(false)
        if (!startTime) setStartTime(Date.now())
      }

      if (isPaused) return

      setActiveKey(e.key)
      setTimeout(() => setActiveKey(""), 100)

      // Self-write mode
      if (exercise.writingMode === "self") {
        if (e.key === "Backspace") {
          if (typedText.length > 0) {
            setTypedText((prev) => prev.slice(0, -1))
            setCurrentIndex((prev) => Math.max(0, prev - 1))
            if (soundEnabled) playKeySound()
          }
          return
        }

        if (e.key === "Enter") {
          setTypedText((prev) => prev + "\n")
          setCurrentIndex((prev) => prev + 1)
          if (soundEnabled) playKeySound()
          return
        }

        if (e.key.length === 1) {
          setTypedText((prev) => prev + e.key)
          setCurrentIndex((prev) => prev + 1)
          if (soundEnabled) {
            e.key === " " ? playSpaceSound() : playKeySound()
          }
        }
        return
      }

      // AI-assisted mode (type along)
      if (e.key === "Backspace") {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
          setTypedText((prev) => prev.slice(0, -1))
          if (soundEnabled) playKeySound()
        }
        return
      }

      if (e.key === "Enter" && currentIndex < text.length) {
        const isCorrect = text[currentIndex] === "\n"
        if (!isCorrect) {
          setErrors((prev) => prev + 1)
          setTotalErrors((prev) => prev + 1)
          if (soundEnabled) playErrorSound()
        } else {
          if (soundEnabled) playKeySound()
        }
        setTypedText((prev) => prev + "\n")
        setCurrentIndex((prev) => prev + 1)
        return
      }

      if (e.key.length === 1 && currentIndex < text.length) {
        const isCorrect = e.key === text[currentIndex]
        if (!isCorrect) {
          setErrors((prev) => prev + 1)
          setTotalErrors((prev) => prev + 1)
          if (soundEnabled) playErrorSound()
        } else {
          if (soundEnabled) {
            e.key === " " ? playSpaceSound() : playKeySound()
          }
        }
        setTypedText((prev) => prev + e.key)
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [
      exercise,
      isPaused,
      currentIndex,
      text,
      typedText,
      startTime,
      showScore,
      soundEnabled,
      playKeySound,
      playErrorSound,
      playSpaceSound,
    ]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const resetPractice = useCallback(() => {
    setTypedText("")
    setCurrentIndex(0)
    setErrors(0)
    setTotalErrors(0)
    setIsPaused(true)
    setStartTime(null)
    setWpm(0)
    setAccuracy(100)
    setScoreResult(null)
    setShowScore(false)
    clearCurrentPractice()
  }, [])

  const handleExit = useCallback(() => {
    if (typedText.length > 20) {
      if (window.confirm("Bạn có chắc muốn tạm dừng và quay về trang chủ? Tiến trình gõ hiện tại đã được tự động lưu lại.")) {
        router.push("/")
      }
    } else {
      router.push("/")
    }
  }, [typedText.length, router])

  const scoreEssay = async () => {
    if (!exercise || typedText.length < 50) return

    setIsScoring(true)
    try {
      const res = await fetch("/api/score-essay", {
        method: "POST",
        headers: getAiHeaders(),
        body: JSON.stringify({
          prompt: exercise.prompt,
          essay: typedText,
          taskType: exercise.taskType,
        }),
      })
      const data = await res.json()

      if (data.error) {
        alert(data.error)
        return
      }

      setScoreResult(data)
      setShowScore(true)

      // Save submission
      createSubmission({
        exerciseId,
        essay: typedText,
        prompt: exercise.prompt,
        taskType: exercise.taskType,
        topic: exercise.topic,
        writingMode: exercise.writingMode,
        bandTarget: exercise.bandTarget,
        score: data,
        wpm,
        accuracy,
        wordCount: typedText.split(/\s+/).filter(Boolean).length,
        timeSpentSeconds: startTime ? Math.round((Date.now() - startTime) / 1000) : 0,
      })

      clearCurrentPractice()
    } catch (error) {
      console.error("Failed to score:", error)
      alert("Lỗi kết nối AI. Vui lòng kiểm tra lại cấu hình hoặc thử lại.")
    } finally {
      setIsScoring(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!exercise) return null

  const progress = text.length > 0 ? (currentIndex / text.length) * 100 : 0
  const isCompleted =
    exercise.writingMode === "ai-assisted"
      ? currentIndex >= text.length && text.length > 0
      : false

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="flex-1 flex flex-col outline-none overflow-hidden"
    >
      {/* Main content area with sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PracticeSidebar
          showKeyboard={showKeyboard}
          onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
          onReset={resetPractice}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          canScore={typedText.length >= 50 && !isScoring}
          isScoring={isScoring}
          onScore={scoreEssay}
          writingMode={exercise.writingMode}
          onExit={handleExit}
        />

        {/* Content area - scrollable */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <StatsBar
            isPaused={isPaused}
            progress={progress}
            wpm={wpm}
            accuracy={accuracy}
            errors={errors}
            totalChars={currentIndex}
            isCompleted={isCompleted}
          />

          {/* Optional Exam Timer Header */}
          {examRemainingSeconds !== null && (
            <div
              className={`px-4 py-1.5 text-xs font-mono font-medium flex items-center justify-between border-b ${
                examRemainingSeconds < 300
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse"
                  : "bg-muted/30 text-muted-foreground border-border/50"
              }`}
            >
              <span>⏱️ Thời gian thi còn lại:</span>
              <span className="font-bold">
                {Math.floor(examRemainingSeconds / 60)}:
                {(examRemainingSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Typing area - notebook journal container */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <TypingArea
              text={text}
              typedText={typedText}
              currentIndex={currentIndex}
              hasKeyboard={showKeyboard}
              prompt={exercise.prompt}
              writingMode={exercise.writingMode}
              isCompleted={isCompleted}
              wpm={wpm}
              accuracy={accuracy}
              onSubmit={scoreEssay}
              isScoring={isScoring}
              canScore={typedText.length >= 50 && !isScoring}
            />
          </div>
        </div>
      </div>

      {/* Keyboard - fixed at bottom */}
      {showKeyboard && (
        <div className="shrink-0 border-t border-border">
          <VirtualKeyboard activeKey={activeKey} nextKey={text[currentIndex] || ""} />
        </div>
      )}

      {/* Score and Detailed Annotation Result Modal */}
      {showScore && scoreResult && (
        <ScoreResult
          result={scoreResult}
          essay={typedText}
          prompt={exercise.prompt}
          taskType={exercise.taskType}
          onClose={() => setShowScore(false)}
          onRetry={() => {
            setShowScore(false)
            router.push("/")
          }}
        />
      )}
    </div>
  )
}
