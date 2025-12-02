"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { TypingArea } from "./typing-area"
import { VirtualKeyboard } from "./virtual-keyboard"
import { StatsBar } from "./stats-bar"
import { ExercisePanel } from "./exercise-panel"
import { ScoreResult } from "./score-result"
import { SubmissionHistory, type Submission } from "./submission-history"
import { useSound } from "@/hooks/use-sound"

const DEFAULT_TEXT = `Many people believe that social networking sites have had a huge negative impact on both individuals and society. To what extent do you agree or disagree?

Write at least 250 words.`

export type WritingMode = "self" | "ai-assisted"
export type TaskType = "task1" | "task2"
export type ViewMode = "practice" | "history"

export interface ScoreData {
  overallScore: number
  feedback: {
    taskResponse: { score: number; feedback: string }
    coherenceCohesion: { score: number; feedback: string }
    lexicalResource: { score: number; feedback: string }
    grammaticalRange: { score: number; feedback: string }
    overall: string
    improvements: string[]
  }
}

export function TypingPractice() {
  const [viewMode, setViewMode] = useState<ViewMode>("practice")
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const [prompt, setPrompt] = useState(DEFAULT_TEXT)
  const [sampleEssay, setSampleEssay] = useState<string | null>(null)
  const [text, setText] = useState(DEFAULT_TEXT)
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
  const [showExercisePanel, setShowExercisePanel] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [writingMode, setWritingMode] = useState<WritingMode>("ai-assisted")
  const [taskType, setTaskType] = useState<TaskType>("task2")
  const [bandTarget, setBandTarget] = useState(7)
  const [topic, setTopic] = useState("random")
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingEssay, setIsGeneratingEssay] = useState(false)
  const [isScoring, setIsScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreData | null>(null)
  const [showScore, setShowScore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { playKeySound, playErrorSound, playSpaceSound } = useSound()

  useEffect(() => {
    const saved = localStorage.getItem("writing-submissions")
    if (saved) {
      setSubmissions(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem("writing-submissions", JSON.stringify(submissions))
    }
  }, [submissions])

  const calculateStats = useCallback(() => {
    if (!startTime || currentIndex === 0) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60
    const wordsTyped = currentIndex / 5
    const currentWpm = Math.round(wordsTyped / timeElapsed)
    setWpm(currentWpm)

    const totalChars = currentIndex
    const correctChars = totalChars - totalErrors
    const currentAccuracy = Math.max(0, Math.round((correctChars / totalChars) * 100 * 100) / 100)
    setAccuracy(currentAccuracy)
  }, [startTime, currentIndex, totalErrors])

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(calculateStats, 500)
      return () => clearInterval(interval)
    }
  }, [isPaused, calculateStats])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (showExercisePanel || showScore || viewMode === "history") return
      
      // Ngăn Space và Enter scroll trang xuống hoặc trigger các hành động mặc định
      if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
        e.preventDefault()
      }
      
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
        return
      }

      if (isPaused && (e.key.length === 1 || e.key === "Enter")) {
        setIsPaused(false)
        if (!startTime) {
          setStartTime(Date.now())
        }
      }

      if (isPaused) return

      setActiveKey(e.key)
      setTimeout(() => setActiveKey(""), 100)

      if (e.key === "Backspace") {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
          setTypedText((prev) => prev.slice(0, -1))
          if (soundEnabled) playKeySound()
        }
        return
      }

      // Xử lý phím Enter (xuống dòng)
      if (e.key === "Enter" && currentIndex < text.length) {
        const expectedChar = text[currentIndex]
        const isCorrect = expectedChar === "\n"

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
        const expectedChar = text[currentIndex]
        const isCorrect = e.key === expectedChar

        if (!isCorrect) {
          setErrors((prev) => prev + 1)
          setTotalErrors((prev) => prev + 1)
          if (soundEnabled) playErrorSound()
        } else {
          if (soundEnabled) {
            if (e.key === " ") {
              playSpaceSound()
            } else {
              playKeySound()
            }
          }
        }

        setTypedText((prev) => prev + e.key)
        setCurrentIndex((prev) => prev + 1)
      }
    },
    [
      isPaused,
      currentIndex,
      text,
      startTime,
      showExercisePanel,
      showScore,
      viewMode,
      soundEnabled,
      playKeySound,
      playErrorSound,
      playSpaceSound,
    ],
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
  }, [])

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true)
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic || null, taskType, bandTarget }),
      })
      const data = await res.json()
      setPrompt(data.prompt)
      setSampleEssay(null)
    } catch (error) {
      console.error("Failed to generate prompt:", error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const generateSampleEssay = async () => {
    setIsGeneratingEssay(true)
    try {
      const res = await fetch("/api/generate-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, taskType, bandTarget }),
      })
      const data = await res.json()
      setSampleEssay(data.essay)
    } catch (error) {
      console.error("Failed to generate essay:", error)
    } finally {
      setIsGeneratingEssay(false)
    }
  }

  const startPractice = () => {
    const practiceText = writingMode === "ai-assisted" && sampleEssay ? sampleEssay : prompt
    setText(practiceText)
    resetPractice()
    setShowExercisePanel(false)
  }

  const scoreEssay = async () => {
    if (typedText.length < 50) return
    setIsScoring(true)
    try {
      const res = await fetch("/api/score-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, essay: typedText, taskType }),
      })
      const data = await res.json()
      setScoreResult(data)
      setShowScore(true)

      const newSubmission: Submission = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        prompt,
        essay: typedText,
        taskType,
        topic,
        writingMode,
        bandTarget,
        score: data,
        wpm,
        accuracy,
        wordCount: typedText.split(/\s+/).filter(Boolean).length,
      }
      setSubmissions((prev) => [newSubmission, ...prev])
    } catch (error) {
      console.error("Failed to score essay:", error)
    } finally {
      setIsScoring(false)
    }
  }

  const handleViewSubmission = (submission: Submission) => {
    setScoreResult(submission.score)
    setShowScore(true)
  }

  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
  }

  const progress = (currentIndex / text.length) * 100
  const isCompleted = currentIndex >= text.length && text.length > 0

  return (
    <div ref={containerRef} tabIndex={0} className="h-screen bg-background flex flex-col outline-none overflow-hidden">
      <Header
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenExercise={() => {
          setViewMode("practice")
          setShowExercisePanel(true)
        }}
        onReset={resetPractice}
        onScore={scoreEssay}
        canScore={typedText.length >= 50 && !isScoring && viewMode === "practice"}
        isScoring={isScoring}
        submissionCount={submissions.length}
      />

      {viewMode === "practice" ? (
        <>
          <div className="flex flex-1 min-h-0">
            <Sidebar
              showKeyboard={showKeyboard}
              onToggleKeyboard={() => setShowKeyboard((prev) => !prev)}
              onReset={resetPractice}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
            />

            <main className="flex-1 flex flex-col min-h-0">
              <StatsBar
                isPaused={isPaused}
                progress={progress}
                wpm={wpm}
                accuracy={accuracy}
                errors={errors}
                totalChars={currentIndex}
                isCompleted={isCompleted}
              />

              <TypingArea
                text={text}
                typedText={typedText}
                currentIndex={currentIndex}
                hasKeyboard={showKeyboard}
                prompt={prompt}
              />
            </main>
          </div>

          {showKeyboard && <VirtualKeyboard activeKey={activeKey} nextKey={text[currentIndex] || ""} />}
        </>
      ) : (
        <SubmissionHistory
          submissions={submissions}
          onViewSubmission={handleViewSubmission}
          onDeleteSubmission={handleDeleteSubmission}
          onNewPractice={() => {
            setViewMode("practice")
            setShowExercisePanel(true)
          }}
        />
      )}

      {showExercisePanel && viewMode === "practice" && (
        <ExercisePanel
          topic={topic}
          setTopic={setTopic}
          taskType={taskType}
          setTaskType={setTaskType}
          writingMode={writingMode}
          setWritingMode={setWritingMode}
          bandTarget={bandTarget}
          setBandTarget={setBandTarget}
          prompt={prompt}
          sampleEssay={sampleEssay}
          onGeneratePrompt={generatePrompt}
          onGenerateEssay={generateSampleEssay}
          onStartPractice={startPractice}
          onClose={() => setShowExercisePanel(false)}
          isGeneratingPrompt={isGeneratingPrompt}
          isGeneratingEssay={isGeneratingEssay}
        />
      )}

      {showScore && scoreResult && (
        <ScoreResult
          result={scoreResult}
          onClose={() => setShowScore(false)}
          onRetry={() => {
            setShowScore(false)
            setShowExercisePanel(true)
          }}
        />
      )}
    </div>
  )
}
