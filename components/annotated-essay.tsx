"use client"

import { useState, useRef, useEffect } from "react"
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Sparkles, MessageSquare, Lightbulb, Copy, Check, X } from "lucide-react"

export interface Annotation {
  startIndex: number
  endIndex: number
  text: string
  type: "excellent" | "good" | "warning" | "error" | "spelling" | "grammar" | "vocabulary" | "coherence"
  category: "taskResponse" | "coherenceCohesion" | "lexicalResource" | "grammaticalRange" | "spelling" | "general"
  suggestion: string
  correctedText?: string
  reason?: string
  impact?: string
  examples?: string[]
  severity?: "low" | "medium" | "high" // Mức độ nghiêm trọng
  bandImpact?: number // Ảnh hưởng ước tính đến band score (-0.5, -0.25, +0.25, etc.)
}

interface AnnotatedEssayProps {
  essay: string
  annotations: Annotation[]
}

const annotationStyles = {
  excellent: {
    bg: "bg-green-500/20 hover:bg-green-500/30",
    border: "border-b-2 border-green-500",
    text: "text-green-700 dark:text-green-300",
    icon: CheckCircle2,
    label: "Xuất sắc",
    color: "green"
  },
  good: {
    bg: "bg-blue-500/20 hover:bg-blue-500/30",
    border: "border-b-2 border-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    icon: Sparkles,
    label: "Tốt",
    color: "blue"
  },
  warning: {
    bg: "bg-orange-500/20 hover:bg-orange-500/30",
    border: "border-b-2 border-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    icon: AlertTriangle,
    label: "Cảnh báo",
    color: "orange"
  },
  error: {
    bg: "bg-red-500/20 hover:bg-red-500/30",
    border: "border-b-2 border-red-500",
    text: "text-red-700 dark:text-red-300",
    icon: XCircle,
    label: "Lỗi nghiêm trọng",
    color: "red"
  },
  spelling: {
    bg: "bg-purple-500/20 hover:bg-purple-500/30",
    border: "border-b-2 border-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    icon: AlertCircle,
    label: "Lỗi chính tả",
    color: "purple"
  },
  grammar: {
    bg: "bg-yellow-500/20 hover:bg-yellow-500/30",
    border: "border-b-2 border-yellow-500",
    text: "text-yellow-700 dark:text-yellow-300",
    icon: AlertCircle,
    label: "Lỗi ngữ pháp",
    color: "yellow"
  },
  vocabulary: {
    bg: "bg-pink-500/20 hover:bg-pink-500/30",
    border: "border-b-2 border-pink-500",
    text: "text-pink-700 dark:text-pink-300",
    icon: MessageSquare,
    label: "Từ vựng",
    color: "pink"
  },
  coherence: {
    bg: "bg-gray-500/20 hover:bg-gray-500/30",
    border: "border-b-2 border-gray-500",
    text: "text-gray-700 dark:text-gray-300",
    icon: AlertCircle,
    label: "Liên kết ý",
    color: "gray"
  },
}

export function AnnotatedEssay({ essay, annotations }: AnnotatedEssayProps) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<number | null>(null)
  const [pinnedAnnotation, setPinnedAnnotation] = useState<number | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [copied, setCopied] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPinnedAnnotation(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const calculatePopupPosition = (rect: DOMRect) => {
    const popupWidth = 384
    const popupHeight = 300
    const padding = 16

    let x = rect.left + rect.width / 2
    let y = rect.top - 10

    if (x + popupWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth / 2 - padding
    }
    if (x - popupWidth / 2 < padding) {
      x = popupWidth / 2 + padding
    }
    if (y - popupHeight < padding) {
      y = rect.bottom + 10 + popupHeight
    }

    return { x, y }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeAnnotation = pinnedAnnotation ?? hoveredAnnotation

  const sortedAnnotations = [...annotations].sort((a, b) => a.startIndex - b.startIndex)

  const renderAnnotatedText = () => {
    const parts: React.ReactElement[] = []
    let currentIndex = 0

    sortedAnnotations.forEach((annotation, index) => {
      if (currentIndex < annotation.startIndex) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            {essay.substring(currentIndex, annotation.startIndex)}
          </span>
        )
      }

      const style = annotationStyles[annotation.type]

      parts.push(
        <span
          key={`annotation-${index}`}
          className={`${style.bg} ${style.border} cursor-pointer transition-all relative rounded-sm px-0.5 ${
            activeAnnotation === index ? "ring-2 ring-offset-1 ring-primary" : ""
          }`}
          onMouseEnter={(e) => {
            if (pinnedAnnotation === null) {
              setHoveredAnnotation(index)
              const rect = e.currentTarget.getBoundingClientRect()
              setPopupPosition(calculatePopupPosition(rect))
            }
          }}
          onMouseLeave={() => {
            if (pinnedAnnotation === null) {
              setHoveredAnnotation(null)
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            const rect = e.currentTarget.getBoundingClientRect()
            setPopupPosition(calculatePopupPosition(rect))
            setPinnedAnnotation(pinnedAnnotation === index ? null : index)
          }}
        >
          {annotation.text}
        </span>
      )

      currentIndex = annotation.endIndex
    })

    if (currentIndex < essay.length) {
      parts.push(
        <span key={`text-${currentIndex}`}>
          {essay.substring(currentIndex)}
        </span>
      )
    }

    return parts
  }

  return (
    <div className="relative">
      <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground">Chú thích màu sắc:</h4>
          <span className="text-xs text-muted-foreground">
            💡 Click vào từ để ghim popup
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {Object.entries(annotationStyles).map(([type, style]) => {
            const Icon = style.icon
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${style.bg} ${style.border}`} />
                <span className="text-muted-foreground">{style.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 bg-secondary/20 rounded-lg leading-relaxed text-sm whitespace-pre-wrap">
        {renderAnnotatedText()}
      </div>

      {activeAnnotation !== null && (
        <div
          ref={popupRef}
          className="fixed z-50 w-96 max-w-[90vw] animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            {(() => {
              const annotation = sortedAnnotations[activeAnnotation]
              const style = annotationStyles[annotation.type]
              const Icon = style.icon

              return (
                <>
                  <div className={`${style.bg} p-3 border-b ${style.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-background/50`}>
                          <Icon className={`w-4 h-4 ${style.text}`} />
                        </div>
                        <div>
                          <span className={`font-semibold ${style.text} text-sm`}>
                            {style.label}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {annotation.category === 'taskResponse' && '• Task Response'}
                            {annotation.category === 'coherenceCohesion' && '• Coherence'}
                            {annotation.category === 'lexicalResource' && '• Vocabulary'}
                            {annotation.category === 'grammaticalRange' && '• Grammar'}
                            {annotation.category === 'spelling' && '• Spelling'}
                            {annotation.category === 'general' && '• General'}
                          </span>
                        </div>
                      </div>
                      {pinnedAnnotation !== null && (
                        <button
                          onClick={() => setPinnedAnnotation(null)}
                          className="p-1 hover:bg-background/50 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    
                    <div className="mt-2 bg-background/60 rounded-lg p-2 text-sm border border-border/50">
                      <code className="text-foreground font-medium">"{annotation.text}"</code>
                    </div>
                  </div>

                  <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
                    {annotation.reason && (
                      <div className="flex gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-medium text-muted-foreground uppercase">Lý do</span>
                          <p className="text-sm text-foreground mt-0.5">{annotation.reason}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">Gợi ý</span>
                        <p className="text-sm text-foreground mt-0.5">{annotation.suggestion}</p>
                      </div>
                    </div>
                    
                    {annotation.correctedText && (
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase">
                            ✨ Sửa thành
                          </span>
                          <button
                            onClick={() => handleCopy(annotation.correctedText!)}
                            className="p-1 hover:bg-green-500/20 rounded transition-colors"
                            title="Copy"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-green-600" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          "{annotation.correctedText}"
                        </p>
                      </div>
                    )}

                    {annotation.examples && annotation.examples.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">📝 Ví dụ</span>
                        <ul className="mt-1 space-y-1">
                          {annotation.examples.map((example, i) => (
                            <li key={i} className="text-sm text-foreground pl-3 border-l-2 border-muted">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {annotation.impact && (
                      <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-2 ${
                        annotation.type === 'error' || annotation.type === 'spelling' || annotation.type === 'grammar'
                          ? 'bg-red-500/10 text-red-700 dark:text-red-300' 
                          : annotation.type === 'warning'
                          ? 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
                          : 'bg-green-500/10 text-green-700 dark:text-green-300'
                      }`}>
                        <span className="font-semibold">⚡ Ảnh hưởng:</span>
                        <span>{annotation.impact}</span>
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
          <div 
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-card"
          />
        </div>
      )}
    </div>
  )
}
