"use client"

import { useState } from "react"
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle, Sparkles, MessageSquare, Lightbulb } from "lucide-react"

export interface Annotation {
  startIndex: number
  endIndex: number
  text: string
  type: "excellent" | "good" | "warning" | "error" | "spelling" | "grammar" | "vocabulary" | "coherence"
  category: "taskResponse" | "coherenceCohesion" | "lexicalResource" | "grammaticalRange" | "spelling" | "general"
  suggestion: string
  correctedText?: string
  // Thêm các trường mới để hiển thị chi tiết hơn
  reason?: string // Lý do tại sao đánh giá như vậy
  impact?: string // Ảnh hưởng đến band score
  examples?: string[] // Ví dụ cải thiện
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
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  // Sắp xếp annotations theo thứ tự xuất hiện
  const sortedAnnotations = [...annotations].sort((a, b) => a.startIndex - b.startIndex)

  // Tạo các đoạn text với annotations
  const renderAnnotatedText = () => {
    const parts: React.ReactElement[] = []
    let currentIndex = 0

    sortedAnnotations.forEach((annotation, index) => {
      // Text trước annotation
      if (currentIndex < annotation.startIndex) {
        parts.push(
          <span key={`text-${currentIndex}`}>
            {essay.substring(currentIndex, annotation.startIndex)}
          </span>
        )
      }

      // Text được đánh dấu
      const style = annotationStyles[annotation.type]
      const Icon = style.icon

      parts.push(
        <span
          key={`annotation-${index}`}
          className={`${style.bg} ${style.border} cursor-pointer transition-colors relative rounded-sm px-0.5`}
          onMouseEnter={(e) => {
            setHoveredAnnotation(index)
            const rect = e.currentTarget.getBoundingClientRect()
            setPopupPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10
            })
          }}
          onMouseLeave={() => setHoveredAnnotation(null)}
        >
          {annotation.text}
        </span>
      )

      currentIndex = annotation.endIndex
    })

    // Text còn lại
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
      {/* Legend - Chú thích màu sắc */}
      <div className="mb-4 p-4 bg-secondary/30 rounded-lg">
        <h4 className="text-sm font-semibold mb-3 text-foreground">Chú thích màu sắc:</h4>
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

      {/* Bài viết đã đánh dấu */}
      <div className="p-6 bg-secondary/20 rounded-lg leading-relaxed text-sm whitespace-pre-wrap">
        {renderAnnotatedText()}
      </div>

      {/* Popup gợi ý chi tiết */}
      {hoveredAnnotation !== null && (
        <div
          className="fixed z-50 w-96 max-w-[90vw] animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-card border-2 border-border rounded-lg shadow-2xl overflow-hidden">
            {(() => {
              const annotation = sortedAnnotations[hoveredAnnotation]
              const style = annotationStyles[annotation.type]
              const Icon = style.icon

              return (
                <>
                  {/* Header với màu nền */}
                  <div className={`${style.bg} border-b-2 ${style.border} p-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${style.text}`} />
                      <span className={`font-bold ${style.text} text-base`}>
                        {style.label}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full ml-auto bg-background/50">
                        {annotation.category === 'taskResponse' && 'Task Response'}
                        {annotation.category === 'coherenceCohesion' && 'Coherence & Cohesion'}
                        {annotation.category === 'lexicalResource' && 'Lexical Resource'}
                        {annotation.category === 'grammaticalRange' && 'Grammatical Range'}
                        {annotation.category === 'spelling' && 'Spelling'}
                        {annotation.category === 'general' && 'General'}
                      </span>
                    </div>
                    
                    {/* Đoạn văn bản được highlight */}
                    <div className="bg-background/50 rounded p-2 text-sm italic border border-border">
                      <span className="text-muted-foreground text-xs">Đoạn được đánh dấu:</span>
                      <div className="mt-1 font-medium text-foreground">"{annotation.text}"</div>
                    </div>
                  </div>

                  {/* Nội dung chi tiết */}
                  <div className="p-4 space-y-3">
                    {/* Lý do đánh giá */}
                    {annotation.reason && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                          <span className="text-xs font-semibold text-muted-foreground">LÝ DO:</span>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed pl-5">
                          {annotation.reason}
                        </p>
                      </div>
                    )}

                    {/* Gợi ý cải thiện */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-muted-foreground">GỢI Ý:</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed pl-5">
                        {annotation.suggestion}
                      </p>
                    </div>
                    
                    {/* Đề xuất sửa lỗi */}
                    {annotation.correctedText && (
                      <div className="bg-accent/10 rounded-lg p-3 border border-accent/30">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">✨ ĐỀ XUẤT SỬA:</p>
                        <p className="text-sm text-accent-foreground font-medium leading-relaxed">
                          "{annotation.correctedText}"
                        </p>
                      </div>
                    )}

                    {/* Ví dụ cải thiện */}
                    {annotation.examples && annotation.examples.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">📝 VÍ DỤ:</p>
                        <ul className="space-y-1 pl-5">
                          {annotation.examples.map((example, i) => (
                            <li key={i} className="text-sm text-foreground list-disc">
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Ảnh hưởng đến band score */}
                    {annotation.impact && (
                      <div className={`rounded-lg p-2 text-xs ${
                        annotation.type === 'error' || annotation.type === 'warning' 
                          ? 'bg-red-500/10 text-red-700 dark:text-red-300' 
                          : 'bg-green-500/10 text-green-700 dark:text-green-300'
                      }`}>
                        <span className="font-semibold">⚡ Ảnh hưởng: </span>
                        {annotation.impact}
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>
          {/* Arrow */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-border"
          />
        </div>
      )}
    </div>
  )
}
