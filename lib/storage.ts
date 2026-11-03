import { v4 as uuidv4 } from "uuid"
import exercisesData from "@/data/exercises.json"

// ===== TYPES =====
export type WritingMode = "self" | "ai-assisted" | "translation"
export type TaskType = "task1" | "task2"

export interface Exercise {
  id: string
  prompt: string
  sampleEssay: string | null
  taskType: TaskType
  topic: string
  bandTarget: number
  writingMode: WritingMode
  createdAt: string
}

export interface Submission {
  id: string
  exerciseId: string
  essay: string
  prompt: string
  taskType: TaskType
  topic: string
  writingMode: WritingMode
  bandTarget: number
  score: ScoreData | null
  wpm: number
  accuracy: number
  wordCount: number
  timeSpentSeconds?: number
  createdAt: string
}

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

export interface Vocabulary {
  id: string
  word: string
  meaning: string
  phonetic?: string
  example?: string
  category?: string
  mastered?: boolean
  createdAt: string
  reviewCount: number
  lastReviewAt?: string
}

export interface TranslationHistory {
  id: string
  originalText: string
  translatedText: string
  sourceLang: "en" | "vi"
  targetLang: "en" | "vi"
  createdAt: string
}

export type FontFamilyOption = "mono" | "serif" | "sans" | "handwriting"
export type NotebookPaperStyle = "ruled" | "grid" | "dot" | "blank"
export type CaretStyle = "bar" | "block" | "underline"
export type LineHeightOption = "compact" | "normal" | "relaxed"
export type UntypedTextColor = "blue" | "purple" | "teal" | "slate"

export interface UserSettings {
  theme: "light" | "dark" | "system"
  defaultTargetLang: "en" | "vi"
  autoSave: boolean
  fontSize: number
  fontFamily: FontFamilyOption
  notebookPaperStyle: NotebookPaperStyle
  caretStyle: CaretStyle
  lineHeight: LineHeightOption
  textAnimation: boolean
  untypedTextColor: UntypedTextColor
  soundEnabled: boolean
  soundVolume: number
  soundTheme: "clicky" | "tactile" | "soft" | "typewriter"
  showKeyboard: boolean
  groqApiKey: string
  groqModel: string
  examTimerMinutes: number
}

// ===== STORAGE KEYS =====
const KEYS = {
  DEVICE_ID: "ielts_device_id",
  EXERCISES: "ielts_exercises",
  SUBMISSIONS: "ielts_submissions",
  VOCABULARIES: "ielts_vocabularies",
  TRANSLATION_HISTORY: "ielts_translation_history",
  SETTINGS: "ielts_settings",
  CURRENT_PRACTICE: "ielts_current_practice",
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  defaultTargetLang: "vi",
  autoSave: true,
  fontSize: 18,
  fontFamily: "mono",
  notebookPaperStyle: "ruled",
  caretStyle: "bar",
  lineHeight: "normal",
  textAnimation: true,
  untypedTextColor: "blue",
  soundEnabled: true,
  soundVolume: 0.15,
  soundTheme: "clicky",
  showKeyboard: true,
  groqApiKey: "",
  groqModel: "qwen/qwen3.8-27b",
  examTimerMinutes: 0,
}

// ===== HELPER =====
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return uuidv4()
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// ===== AI HEADERS =====
export function getAiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (typeof window !== "undefined") {
    const settings = getSettings()
    if (settings.groqApiKey) {
      headers["x-groq-api-key"] = settings.groqApiKey.trim()
    }
    if (settings.groqModel) {
      headers["x-groq-model"] = settings.groqModel.trim()
    }
  }
  return headers
}

// ===== DEVICE ID =====
export function getDeviceId(): string {
  if (typeof window === "undefined") return ""
  let deviceId = localStorage.getItem(KEYS.DEVICE_ID)
  if (!deviceId) {
    deviceId = generateId()
    localStorage.setItem(KEYS.DEVICE_ID, deviceId)
  }
  return deviceId
}

// ===== EXERCISES =====
export function createExercise(data: Omit<Exercise, "id" | "createdAt">): Exercise {
  const exercises = getExercises()
  const newExercise: Exercise = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.EXERCISES, [newExercise, ...exercises])
  return newExercise
}

export function getExercises(): Exercise[] {
  return getItem<Exercise[]>(KEYS.EXERCISES, [])
}

export function getExerciseById(id: string): Exercise | undefined {
  const fromStorage = getExercises().find((e) => e.id === id)
  if (fromStorage) return fromStorage

  // Fallback to preset exercises in data/exercises.json
  const preset = (exercisesData.exercises as any[]).find((e) => e.id === id)
  if (preset) {
    return {
      ...preset,
      createdAt: new Date().toISOString(),
    }
  }
  return undefined
}

export function deleteExercise(id: string): void {
  const exercises = getExercises().filter((e) => e.id !== id)
  setItem(KEYS.EXERCISES, exercises)
}

// ===== SUBMISSIONS =====
export function createSubmission(data: Omit<Submission, "id" | "createdAt">): Submission {
  const submissions = getSubmissions()
  const newSubmission: Submission = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.SUBMISSIONS, [newSubmission, ...submissions])
  return newSubmission
}

export function getSubmissions(): Submission[] {
  return getItem<Submission[]>(KEYS.SUBMISSIONS, [])
}

export function getSubmissionById(id: string): Submission | undefined {
  return getSubmissions().find((s) => s.id === id)
}

export function getSubmissionsByExerciseId(exerciseId: string): Submission[] {
  return getSubmissions().filter((s) => s.exerciseId === exerciseId)
}

export function deleteSubmission(id: string): void {
  const submissions = getSubmissions().filter((s) => s.id !== id)
  setItem(KEYS.SUBMISSIONS, submissions)
}

// ===== VOCABULARY =====
export function addVocabulary(
  word: string,
  meaning: string,
  phonetic?: string,
  example?: string,
  category?: string
): Vocabulary {
  const vocabularies = getVocabularies()
  const normalizedWord = word.trim().toLowerCase()
  
  // Update if already exists
  const existingIndex = vocabularies.findIndex((v) => v.word.toLowerCase() === normalizedWord)
  if (existingIndex !== -1) {
    const updated = {
      ...vocabularies[existingIndex],
      meaning: meaning || vocabularies[existingIndex].meaning,
      phonetic: phonetic || vocabularies[existingIndex].phonetic,
      example: example || vocabularies[existingIndex].example,
      category: category || vocabularies[existingIndex].category,
      reviewCount: (vocabularies[existingIndex].reviewCount || 0) + 1,
      lastReviewAt: new Date().toISOString(),
    }
    vocabularies[existingIndex] = updated
    setItem(KEYS.VOCABULARIES, [...vocabularies])
    return updated
  }

  const newVocab: Vocabulary = {
    id: generateId(),
    word: normalizedWord,
    meaning,
    phonetic,
    example,
    category,
    mastered: false,
    createdAt: new Date().toISOString(),
    reviewCount: 0,
  }
  setItem(KEYS.VOCABULARIES, [newVocab, ...vocabularies])
  return newVocab
}

export function getVocabularies(): Vocabulary[] {
  return getItem<Vocabulary[]>(KEYS.VOCABULARIES, [])
}

export function getVocabularyById(id: string): Vocabulary | undefined {
  return getVocabularies().find((v) => v.id === id)
}

export function updateVocabulary(id: string, updates: Partial<Vocabulary>): void {
  const vocabularies = getVocabularies()
  const index = vocabularies.findIndex((v) => v.id === id)
  if (index !== -1) {
    vocabularies[index] = { ...vocabularies[index], ...updates }
    setItem(KEYS.VOCABULARIES, vocabularies)
  }
}

export function deleteVocabulary(id: string): void {
  const vocabularies = getVocabularies().filter((v) => v.id !== id)
  setItem(KEYS.VOCABULARIES, vocabularies)
}

// ===== TRANSLATION HISTORY =====
export function addTranslationHistory(
  originalText: string,
  translatedText: string,
  sourceLang: "en" | "vi",
  targetLang: "en" | "vi"
): TranslationHistory {
  const history = getTranslationHistory()
  const newHistory: TranslationHistory = {
    id: generateId(),
    originalText,
    translatedText,
    sourceLang,
    targetLang,
    createdAt: new Date().toISOString(),
  }
  setItem(KEYS.TRANSLATION_HISTORY, [newHistory, ...history].slice(0, 100))
  return newHistory
}

export function getTranslationHistory(): TranslationHistory[] {
  return getItem<TranslationHistory[]>(KEYS.TRANSLATION_HISTORY, [])
}

export function clearTranslationHistory(): void {
  setItem(KEYS.TRANSLATION_HISTORY, [])
}

// ===== SETTINGS =====
export function getSettings(): UserSettings {
  const stored = getItem<Partial<UserSettings>>(KEYS.SETTINGS, {})
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function updateSettings(updates: Partial<UserSettings>): UserSettings {
  const settings = { ...getSettings(), ...updates }
  setItem(KEYS.SETTINGS, settings)
  return settings
}

// ===== CURRENT PRACTICE (for auto-save) =====
export interface CurrentPractice {
  exerciseId: string
  typedText: string
  currentIndex: number
  startTime: number | null
  savedAt: string
}

export function saveCurrentPractice(data: Omit<CurrentPractice, "savedAt">): void {
  setItem(KEYS.CURRENT_PRACTICE, { ...data, savedAt: new Date().toISOString() })
}

export function getCurrentPractice(): CurrentPractice | null {
  return getItem<CurrentPractice | null>(KEYS.CURRENT_PRACTICE, null)
}

export function clearCurrentPractice(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(KEYS.CURRENT_PRACTICE)
}

// ===== EXPORT/IMPORT =====
export function exportAllData(): string {
  return JSON.stringify(
    {
      deviceId: getDeviceId(),
      exercises: getExercises(),
      submissions: getSubmissions(),
      vocabularies: getVocabularies(),
      translationHistory: getTranslationHistory(),
      settings: getSettings(),
    },
    null,
    2
  )
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.exercises) setItem(KEYS.EXERCISES, data.exercises)
    if (data.submissions) setItem(KEYS.SUBMISSIONS, data.submissions)
    if (data.vocabularies) setItem(KEYS.VOCABULARIES, data.vocabularies)
    if (data.translationHistory) setItem(KEYS.TRANSLATION_HISTORY, data.translationHistory)
    if (data.settings) setItem(KEYS.SETTINGS, data.settings)
    return true
  } catch {
    return false
  }
}
