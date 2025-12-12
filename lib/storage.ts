import { v4 as uuidv4 } from "uuid"

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
  example?: string
  category?: string
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

export interface UserSettings {
  theme: "light" | "dark" | "system"
  defaultTargetLang: "en" | "vi"
  autoSave: boolean
  fontSize: number
  soundEnabled: boolean
  showKeyboard: boolean
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

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  defaultTargetLang: "vi",
  autoSave: true,
  fontSize: 16,
  soundEnabled: true,
  showKeyboard: true,
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
  return getExercises().find((e) => e.id === id)
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
  example?: string,
  category?: string
): Vocabulary {
  const vocabularies = getVocabularies()
  const newVocab: Vocabulary = {
    id: generateId(),
    word,
    meaning,
    example,
    category,
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
  // Giới hạn 100 bản ghi
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
  return getItem<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS)
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
  return JSON.stringify({
    deviceId: getDeviceId(),
    exercises: getExercises(),
    submissions: getSubmissions(),
    vocabularies: getVocabularies(),
    translationHistory: getTranslationHistory(),
    settings: getSettings(),
  }, null, 2)
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
