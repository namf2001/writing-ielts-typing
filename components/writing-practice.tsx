"use client"

import { useState } from "react"
import { AppNavbar } from "./app-navbar"
import { ExerciseSelector } from "./exercise-selector"
import { WritingEditor } from "./writing-editor"
import { SubmissionHistory } from "./submission-history"
import { ScoreResult } from "./score-result"

export type WritingMode = "self-write" | "ai-assisted"
export type AppView = "exercise" | "history"

export interface WritingPrompt {
  id: string
  topic: string
  type: "task1" | "task2"
  prompt: string
  bandTarget?: number
}

export interface Submission {
  id: string
  prompt: WritingPrompt
  essay: string
  mode: WritingMode
  score: number
  feedback: {
    taskResponse: { score: number; feedback: string }
    coherenceCohesion: { score: number; feedback: string }
    lexicalResource: { score: number; feedback: string }
    grammaticalRange: { score: number; feedback: string }
    overall: string
    improvements: string[]
  } | null
  wordCount: number
  submittedAt: Date
}

export function WritingPractice() {
  const [currentView, setCurrentView] = useState<AppView>("exercise")
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null)
  const [writingMode, setWritingMode] = useState<WritingMode>("self-write")
  const [bandTarget, setBandTarget] = useState<number>(7)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null)
  const [isScoring, setIsScoring] = useState(false)

  const handleSelectPrompt = (prompt: WritingPrompt) => {
    setCurrentPrompt(prompt)
    setCurrentSubmission(null)
  }

  const handleSubmit = async (essay: string) => {
    if (!currentPrompt) return

    setIsScoring(true)

    try {
      const response = await fetch("/api/score-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: currentPrompt.prompt,
          essay,
          taskType: currentPrompt.type,
        }),
      })

      const result = await response.json()

      const newSubmission: Submission = {
        id: crypto.randomUUID(),
        prompt: currentPrompt,
        essay,
        mode: writingMode,
        score: result.overallScore,
        feedback: result.feedback,
        wordCount: essay.split(/\s+/).filter(Boolean).length,
        submittedAt: new Date(),
      }

      setSubmissions((prev) => [newSubmission, ...prev])
      setCurrentSubmission(newSubmission)
    } catch (error) {
      console.error("Scoring failed:", error)
    } finally {
      setIsScoring(false)
    }
  }

  const handleViewSubmission = (submission: Submission) => {
    setCurrentPrompt(submission.prompt)
    setCurrentSubmission(submission)
    setCurrentView("exercise")
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar currentView={currentView} onViewChange={setCurrentView} submissionCount={submissions.length} />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {currentView === "exercise" ? (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-6">
              <ExerciseSelector
                onSelectPrompt={handleSelectPrompt}
                currentPrompt={currentPrompt}
                writingMode={writingMode}
                onModeChange={setWritingMode}
                bandTarget={bandTarget}
                onBandTargetChange={setBandTarget}
              />
            </aside>

            <div className="space-y-6">
              {currentSubmission ? (
                <ScoreResult submission={currentSubmission} onWriteAgain={() => setCurrentSubmission(null)} />
              ) : (
                <WritingEditor
                  prompt={currentPrompt}
                  mode={writingMode}
                  bandTarget={bandTarget}
                  onSubmit={handleSubmit}
                  isScoring={isScoring}
                />
              )}
            </div>
          </div>
        ) : (
          <SubmissionHistory submissions={submissions} onViewSubmission={handleViewSubmission} />
        )}
      </main>
    </div>
  )
}
