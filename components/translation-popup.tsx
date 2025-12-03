"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { X, ArrowRightLeft, Loader2, Copy, Check, Volume2, BookmarkPlus, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addVocabulary, getVocabularies } from "@/lib/storage"

interface TranslationPopupProps {
  selectedText: string
  position: { x: number; y: number }
  onClose: () => void
}

export function TranslationPopup({ selectedText, position, onClose }: TranslationPopupProps) {
  const [translated, setTranslated] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [targetLang, setTargetLang] = useState<"vi" | "en">("vi")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Kiểm tra xem có phải từ đơn không (không có khoảng trắng)
  const isSingleWord = useMemo(() => {
    const trimmed = selectedText.trim()
    // Từ đơn: không có khoảng trắng và có ít nhất 1 ký tự
    return trimmed.length > 0 && !trimmed.includes(" ")
  }, [selectedText])

  // Kiểm tra từ đã được lưu chưa
  useEffect(() => {
    if (isSingleWord) {
      const vocabularies = getVocabularies()
      const exists = vocabularies.some(
        (v) => v.word.toLowerCase() === selectedText.trim().toLowerCase()
      )
      setIsSaved(exists)
    }
  }, [selectedText, isSingleWord])

  const translate = useCallback(async () => {
    if (!selectedText.trim()) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: selectedText, targetLang }),
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
        setTranslated("")
      } else if (data.translated) {
        setTranslated(data.translated)
      }
    } catch (err) {
      console.error("Translation error:", err)
      setError("Lỗi kết nối")
      setTranslated("")
    } finally {
      setIsLoading(false)
    }
  }, [selectedText, targetLang])

  useEffect(() => {
    translate()
  }, [translate])

  const toggleLanguage = () => {
    setTargetLang((prev) => (prev === "vi" ? "en" : "vi"))
  }

  const copyToClipboard = async () => {
    if (!translated) return
    await navigator.clipboard.writeText(translated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const speakText = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === "vi" ? "vi-VN" : "en-US"
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  // Lưu từ vựng
  const saveToVocabulary = useCallback(() => {
    if (!isSingleWord || !translated || isSaved) return

    setIsSaving(true)
    try {
      addVocabulary(
        selectedText.trim().toLowerCase(),
        translated,
        undefined, // example
        undefined  // category
      )
      setIsSaved(true)
    } catch (err) {
      console.error("Save vocabulary error:", err)
    } finally {
      setIsSaving(false)
    }
  }, [selectedText, translated, isSingleWord, isSaved])

  // Tính toán vị trí popup để không bị tràn ra ngoài màn hình
  const popupWidth = 320
  const popupHeight = 250
  const padding = 10

  let left = position.x
  let top = position.y + 8

  // Điều chỉnh nếu popup tràn ra bên phải
  if (left + popupWidth > window.innerWidth - padding) {
    left = window.innerWidth - popupWidth - padding
  }

  // Điều chỉnh nếu popup tràn ra bên trái
  if (left < padding) {
    left = padding
  }

  // Điều chỉnh nếu popup tràn ra bên dưới
  if (top + popupHeight > window.innerHeight - padding) {
    top = position.y - popupHeight - 8
  }

  return (
    <div
      data-translation-popup
      className="fixed z-[100] bg-background rounded-lg shadow-2xl border border-border p-3 w-[320px] animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="h-7 text-xs gap-1"
        >
          {targetLang === "vi" ? "EN → VI" : "VI → EN"}
          <ArrowRightLeft className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="h-6 w-6 p-0 hover:bg-destructive/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Original Text */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            Văn bản gốc
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => speakText(selectedText, targetLang === "vi" ? "en" : "vi")}
            className="h-5 w-5 p-0"
            title="Phát âm"
          >
            <Volume2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-sm text-foreground bg-secondary/50 rounded-md p-2 max-h-[60px] overflow-y-auto">
          {selectedText}
        </div>
      </div>

      {/* Translated Text */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {targetLang === "vi" ? "Tiếng Việt" : "English"}
          </span>
          {translated && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(translated, targetLang)}
              className="h-5 w-5 p-0"
              title="Phát âm"
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="text-sm bg-primary/10 rounded-md p-2 min-h-[40px] max-h-[80px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang dịch...</span>
            </div>
          ) : error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            <span className="text-foreground font-medium">{translated}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {translated && !isLoading && !error && (
        <div className="flex justify-between items-center">
          {/* Nút lưu từ vựng - chỉ hiển thị khi là từ đơn */}
          <div>
            {isSingleWord && (
              <Button
                variant={isSaved ? "ghost" : "outline"}
                size="sm"
                onClick={saveToVocabulary}
                disabled={isSaved || isSaving}
                className="h-7 text-xs gap-1"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isSaved ? (
                  <>
                    <BookmarkCheck className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Đã lưu</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="h-3 w-3" />
                    <span>Lưu từ</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Nút copy */}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 text-xs gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Đã copy</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
