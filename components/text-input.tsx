"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface TextInputProps {
  onSubmit: (text: string) => void
  onClose: () => void
  initialText: string
}

export function TextInput({ onSubmit, onClose, initialText }: TextInputProps) {
  const [text, setText] = useState(initialText)

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Nhập văn bản để luyện gõ</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dán hoặc nhập văn bản bạn muốn luyện gõ..."
          className="min-h-[300px] bg-secondary text-foreground placeholder:text-muted-foreground font-mono"
        />

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
            Bắt đầu luyện tập
          </Button>
        </div>
      </div>
    </div>
  )
}
