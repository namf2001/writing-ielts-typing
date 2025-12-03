"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Trash2, BookOpen, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  getVocabularies,
  deleteVocabulary,
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
    audio.play()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Đang tải thông tin từ điển...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        {error}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="pt-2">
      {/* Phonetic */}
      {(data.phonetic || data.phonetics.length > 0) && (
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {data.phonetic && (
              <span className="text-sm text-muted-foreground">{data.phonetic}</span>
            )}
            {data.phonetics
              .filter((p) => p.audio)
              .slice(0, 2)
              .map((phonetic, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => phonetic.audio && playAudio(phonetic.audio)}
                  className="h-6 text-xs gap-1"
                >
                  <Volume2 className="h-3 w-3" />
                  {phonetic.text || "Phát âm"}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Meanings */}
      <div className="space-y-4">
        {data.meanings.map((meaning, index) => (
          <div key={index}>
            <h4 className="font-medium capitalize text-primary text-sm mb-2">
              {meaning.partOfSpeech}
            </h4>
            <div className="space-y-2 pl-2">
              {meaning.definitions.slice(0, 4).map((def, defIndex) => (
                <div key={defIndex} className="text-sm">
                  <p className="text-foreground">
                    <span className="text-muted-foreground mr-1 font-medium">{defIndex + 1}.</span>
                    {def.definition}
                  </p>
                  {def.example && (
                    <p className="text-xs text-muted-foreground italic mt-1 pl-4 border-l-2 border-primary/20">
                      &ldquo;{def.example}&rdquo;
                    </p>
                  )}
                </div>
              ))}

              {/* Synonyms */}
              {meaning.synonyms && meaning.synonyms.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-medium text-muted-foreground">Đồng nghĩa: </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {meaning.synonyms.slice(0, 6).join(", ")}
                  </span>
                </div>
              )}

              {/* Antonyms */}
              {meaning.antonyms && meaning.antonyms.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Trái nghĩa: </span>
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    {meaning.antonyms.slice(0, 6).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setVocabularies(getVocabularies())
  }, [])

  const filteredVocabularies = vocabularies.filter((v) => {
    return (
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Bạn có chắc muốn xóa từ này?")) {
      deleteVocabulary(id)
      setVocabularies(getVocabularies())
    }
  }

  const speakWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation()
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-US"
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm từ vựng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              <span className="font-medium text-foreground">{vocabularies.length}</span> từ đã lưu
            </div>
          </div>
        </div>

        {/* Vocabulary List */}
        {filteredVocabularies.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Chưa có từ vựng nào</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bôi đen từ trong bài viết và lưu để học sau
            </p>
            <Button asChild>
              <Link href="/">Bắt đầu luyện tập</Link>
            </Button>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredVocabularies.map((vocab) => (
              <AccordionItem key={vocab.id} value={vocab.id} className="border-b">
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="flex-1 py-4 hover:no-underline [&>svg]:hidden">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-medium text-base">{vocab.word}</span>
                      <span className="text-sm text-muted-foreground">- {vocab.meaning}</span>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => speakWord(e, vocab.word)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, vocab.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <AccordionContent className="pb-4">
                  <DictionaryInfo word={vocab.word} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  )
}
