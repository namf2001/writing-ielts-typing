"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Trash2,
  BookOpen,
  Volume2,
  Loader2,
  ImageIcon,
  Sparkles,
  Layers,
  List,
  CheckCircle2,
  RotateCw,
  Plus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  getVocabularies,
  deleteVocabulary,
  updateVocabulary,
  addVocabulary,
  type Vocabulary,
} from "@/lib/storage"

// Dictionary types
interface Phonetic {
  text?: string
  audio?: string
}

interface Definition {
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

interface Meaning {
  partOfSpeech: string
  definitions: Definition[]
  synonyms?: string[]
  antonyms?: string[]
}

interface DictionaryData {
  word: string
  phonetic?: string
  phonetics: Phonetic[]
  meanings: Meaning[]
}

// Pixabay types
interface PixabayImage {
  id: number
  webformatURL: string
  previewURL: string
  tags: string
  user: string
}

// Component hiển thị hình ảnh từ Pixabay
function WordImages({ word }: { word: string }) {
  const [images, setImages] = useState<PixabayImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/images?word=${encodeURIComponent(word)}`)
        const result = await response.json()

        if (result.success && result.images) {
          setImages(result.images)
        } else {
          setError(result.error || "Không tìm thấy hình ảnh")
        }
      } catch (err) {
        console.error("Image fetch error:", err)
        setError("Lỗi kết nối")
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [word])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Đang tải hình ảnh...</span>
      </div>
    )
  }

  if (error || images.length === 0) {
    return null
  }

  return (
    <div className="py-2">
      <div className="grid grid-cols-4 gap-2">
        {images.slice(0, 4).map((img) => (
          <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
            <Image
              src={img.previewURL}
              alt={img.tags}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 25vw, 100px"
            />
          </div>
        ))}
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 text-right">Ảnh từ Pixabay</p>
    </div>
  )
}

// Component hiển thị thông tin từ điển
function DictionaryInfo({ word }: { word: string }) {
  const [data, setData] = useState<DictionaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDictionary = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`)
        const result = await response.json()

        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || "Không tìm thấy thông tin")
        }
      } catch (err) {
        console.error("Dictionary fetch error:", err)
        setError("Lỗi kết nối")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDictionary()
  }, [word])

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {})
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs py-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Đang tải thông tin từ điển...</span>
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-xs text-muted-foreground py-2">{error || "Không có dữ liệu"}</div>
  }

  const audioPhonetic = data.phonetics?.find((p) => p.audio && p.audio.length > 0)

  return (
    <div className="space-y-3 py-2 text-xs">
      {/* Phonetic & Audio */}
      {(data.phonetic || audioPhonetic) && (
        <div className="flex items-center gap-2 text-muted-foreground">
          {data.phonetic && <span className="font-mono text-primary font-medium">{data.phonetic}</span>}
          {audioPhonetic?.audio && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => playAudio(audioPhonetic.audio!)}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Meanings */}
      {data.meanings?.map((meaning, index) => (
        <div key={index} className="space-y-1.5 border-t border-border/50 pt-2">
          <Badge variant="outline" className="text-[10px] font-mono">
            {meaning.partOfSpeech}
          </Badge>

          {meaning.definitions?.slice(0, 2).map((def, defIndex) => (
            <div key={defIndex} className="pl-2 border-l-2 border-muted space-y-0.5">
              <p className="text-foreground/90">{def.definition}</p>
              {def.example && (
                <p className="text-muted-foreground italic text-[11px]">"{def.example}"</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "flashcard">("list")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [newWordInput, setNewWordInput] = useState("")
  const [isAddingWord, setIsAddingWord] = useState(false)

  useEffect(() => {
    setVocabularies(getVocabularies())
  }, [])

  const filteredVocabularies = vocabularies.filter(
    (v) =>
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Bạn có chắc muốn xóa từ này khỏi sổ tay?")) {
      deleteVocabulary(id)
      setVocabularies(getVocabularies())
    }
  }

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const toggleMastered = (id: string, current: boolean) => {
    updateVocabulary(id, { mastered: !current })
    setVocabularies(getVocabularies())
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWordInput.trim()) return

    setIsAddingWord(true)
    const word = newWordInput.trim().toLowerCase()

    try {
      // Auto translate word into Vietnamese
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: word, targetLang: "vi" }),
      })
      const data = await res.json()
      const meaning = data.translated || "Tra cứu nghĩa"

      addVocabulary(word, meaning)
      setVocabularies(getVocabularies())
      setNewWordInput("")
    } catch {
      addVocabulary(word, "Chưa có nghĩa")
      setVocabularies(getVocabularies())
      setNewWordInput("")
    } finally {
      setIsAddingWord(false)
    }
  }

  const currentFlashcard = filteredVocabularies[currentCardIndex]

  return (
    <div className="min-h-screen bg-[#FAF7F0] dark:bg-[#11141B] pb-16">
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#141414]/15 pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border-2 border-[#141414] bg-[#7FB2FF] text-[#141414] shadow-[2px_2px_0_#141414] font-mono text-xs font-black uppercase tracking-wider dark:border-[#384259]">
              <span className="bg-[#141414] text-white px-1.5 py-0.2 rounded text-[10px]">03</span>
              KHO TỪ VỰNG & FLASHCARDS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141414] dark:text-white uppercase tracking-tight">
              Sổ Tay Từ Vựng IELTS<span className="text-[#FF9F0A]">*</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
              Từ vựng được lưu tự động khi tra cứu hoặc thêm mới để ôn tập theo phương pháp lặp lại ngắt quãng.
            </p>
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center gap-1.5 bg-[#FFF2D9] dark:bg-[#181C26] p-1.5 rounded-2xl border-2 border-[#141414] shadow-[3px_3px_0_#141414] dark:border-[#384259]">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-1.5 h-8 text-xs font-black"
            >
              <List className="w-3.5 h-3.5 stroke-[2.5]" />
              Danh sách ({vocabularies.length})
            </Button>
            <Button
              variant={viewMode === "flashcard" ? "yellow" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("flashcard")
                setIsFlipped(false)
                setCurrentCardIndex(0)
              }}
              className="gap-1.5 h-8 text-xs font-black"
            >
              <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              Thẻ nhớ Flashcards
            </Button>
          </div>
        </div>

        {/* Quick Add Word bar & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quick add */}
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <Input
              placeholder="Thêm từ vựng mới (ví dụ: ubiquitous)..."
              value={newWordInput}
              onChange={(e) => setNewWordInput(e.target.value)}
              className="text-xs h-10 font-bold"
            />
            <Button type="submit" variant="yellow" size="sm" disabled={isAddingWord || !newWordInput.trim()} className="gap-1.5 text-xs h-10 px-4 shrink-0">
              {isAddingWord ? <Loader2 className="w-3.5 h-3.5 animate-spin stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
              Thêm từ
            </Button>
          </form>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground stroke-[2.5]" />
            <Input
              placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs h-10 font-bold"
            />
          </div>
        </div>

        {/* FLASHCARD MODE */}
        {viewMode === "flashcard" && (
          <div className="max-w-xl mx-auto space-y-4">
            {filteredVocabularies.length === 0 ? (
              <Card className="h24-block p-8 text-center bg-white dark:bg-[#181C26]">
                <p className="text-sm font-bold text-muted-foreground">Chưa có từ vựng nào để học flashcard.</p>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between font-mono text-xs font-black text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-lg border-2 border-[#141414] bg-white text-[#141414] dark:bg-[#181C26] dark:text-white">
                    Thẻ {currentCardIndex + 1} / {filteredVocabularies.length}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider">Chạm vào thẻ để lật mặt sau</span>
                </div>

                {/* The Flashcard */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`min-h-[280px] p-8 rounded-3xl border-[3px] border-[#141414] cursor-pointer select-none transition-all duration-200 flex flex-col items-center justify-center text-center relative shadow-[6px_6px_0_#141414] hover:shadow-[8px_8px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-[#384259] dark:shadow-[6px_6px_0_#0A0D14] ${
                    isFlipped
                      ? "bg-[#FFF8EC] dark:bg-[#181C26]"
                      : "bg-white dark:bg-[#181C26]"
                  }`}
                >
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <button
                      type="button"
                      className="p-2 rounded-xl border-2 border-[#141414] bg-white hover:bg-[#FFC93C] transition-all cursor-pointer dark:bg-[#232938]"
                      onClick={(e) => {
                        e.stopPropagation()
                        speakWord(currentFlashcard.word)
                      }}
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4 text-[#141414] dark:text-white stroke-[2.5]" />
                    </button>
                  </div>

                  {!isFlipped ? (
                    /* Front side */
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#141414] text-white">
                        ENGLISH WORD
                      </span>
                      <h2 className="text-4xl font-black text-[#141414] dark:text-white tracking-tight">
                        {currentFlashcard.word}
                      </h2>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-bold pt-2">
                        <RotateCw className="w-3.5 h-3.5 stroke-[2.5]" /> Nhấn để lật thẻ xem nghĩa & ví dụ
                      </p>
                    </div>
                  ) : (
                    /* Back side */
                    <div className="space-y-3 max-w-md w-full">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#7CC243] text-[#141414]">
                        VIETNAMESE MEANING & DEFINITIONS
                      </span>
                      <h3 className="text-2xl font-black text-[#141414] dark:text-white">
                        {currentFlashcard.meaning}
                      </h3>
                      <div className="pt-2 text-left">
                        <DictionaryInfo word={currentFlashcard.word} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentCardIndex === 0}
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentCardIndex((prev) => Math.max(0, prev - 1))
                    }}
                    className="gap-1 text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" /> Thẻ trước
                  </Button>

                  <Button
                    variant={currentFlashcard.mastered ? "green" : "outline"}
                    size="sm"
                    onClick={() => toggleMastered(currentFlashcard.id, !!currentFlashcard.mastered)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    {currentFlashcard.mastered ? "Đã thuộc từ này" : "Đánh dấu đã thuộc"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentCardIndex >= filteredVocabularies.length - 1}
                    onClick={() => {
                      setIsFlipped(false)
                      setCurrentCardIndex((prev) =>
                        Math.min(filteredVocabularies.length - 1, prev + 1)
                      )}
                    }
                    className="gap-1 text-xs"
                  >
                    Thẻ tiếp <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* LIST MODE */}
        {viewMode === "list" && (
          <div>
            {filteredVocabularies.length === 0 ? (
              <Card className="h24-block p-12 text-center bg-white dark:bg-[#181C26]">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3 stroke-[2]" />
                <h3 className="text-base font-black mb-1 uppercase">Chưa có từ vựng nào</h3>
                <p className="text-xs text-muted-foreground mb-4 font-semibold">
                  Bôi đen từ trong bài viết để tra cứu hoặc nhập từ mới ở thanh trên.
                </p>
                <Button asChild variant="yellow" size="sm">
                  <Link href="/">Luyện viết bài ngay</Link>
                </Button>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-2.5">
                {filteredVocabularies.map((vocab) => (
                  <AccordionItem
                    key={vocab.id}
                    value={vocab.id}
                    className="border-2 border-[#141414] rounded-2xl px-5 bg-white shadow-[3px_3px_0_#141414] dark:bg-[#181C26] dark:border-[#384259] overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <AccordionTrigger className="flex-1 py-3.5 hover:no-underline [&>svg]:hidden">
                        <div className="flex flex-wrap items-center gap-2.5 text-left">
                          <span className="font-black text-sm text-[#141414] dark:text-white">{vocab.word}</span>
                          <span className="text-xs font-semibold text-muted-foreground">• {vocab.meaning}</span>
                          {vocab.mastered && (
                            <Badge
                              variant="green"
                              className="text-[10px] py-0 h-5"
                            >
                              Đã thuộc
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border border-[#141414] hover:bg-[#FFF2D9] text-[#141414] transition-colors cursor-pointer dark:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            speakWord(vocab.word)
                          }}
                          title="Phát âm"
                        >
                          <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg border border-[#141414] hover:bg-[#F0573A] hover:text-white transition-colors cursor-pointer"
                          onClick={(e) => handleDelete(e, vocab.id)}
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    <AccordionContent className="pb-4 pt-2 border-t-2 border-[#141414]/10 dark:border-border">
                      <DictionaryInfo word={vocab.word} />
                      <WordImages word={vocab.word} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
