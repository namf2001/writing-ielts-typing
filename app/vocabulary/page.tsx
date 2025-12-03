"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Trash2, BookOpen, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  getVocabularies,
  deleteVocabulary,
  updateVocabulary,
  type Vocabulary,
} from "@/lib/storage"

export default function VocabularyPage() {
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setVocabularies(getVocabularies())
  }, [])

  const categories = Array.from(new Set(vocabularies.map((v) => v.category).filter(Boolean)))

  const filteredVocabularies = vocabularies.filter((v) => {
    const matchSearch =
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = !selectedCategory || v.category === selectedCategory
    return matchSearch && matchCategory
  })

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa từ này?")) {
      deleteVocabulary(id)
      setVocabularies(getVocabularies())
    }
  }

  const handleReview = (id: string) => {
    updateVocabulary(id, {
      reviewCount: (vocabularies.find((v) => v.id === id)?.reviewCount || 0) + 1,
      lastReviewAt: new Date().toISOString(),
    })
    setVocabularies(getVocabularies())
  }

  const speakWord = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-US"
    speechSynthesis.speak(utterance)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm từ vựng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              Tất cả
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat || null)}
              >
                {cat}
              </Button>
            ))}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredVocabularies.map((vocab) => (
              <Card key={vocab.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{vocab.word}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => speakWord(vocab.word)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-muted-foreground">{vocab.meaning}</p>
                      {vocab.example && (
                        <p className="text-sm text-muted-foreground mt-2 italic">"{vocab.example}"</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(vocab.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      {vocab.category && (
                        <Badge variant="secondary" className="text-xs">
                          {vocab.category}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Ôn tập: {vocab.reviewCount} lần
                      </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleReview(vocab.id)}>
                      Đã ôn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
