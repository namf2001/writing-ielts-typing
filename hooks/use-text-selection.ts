"use client"

import { useState, useEffect, useCallback } from "react"

interface SelectionState {
  text: string
  position: { x: number; y: number }
}

export function useTextSelection() {
  const [selection, setSelection] = useState<SelectionState | null>(null)

  const handleMouseUp = useCallback(() => {
    // Delay để đảm bảo selection đã được set
    setTimeout(() => {
      const selectedText = window.getSelection()?.toString().trim()

      if (selectedText && selectedText.length > 0) {
        const range = window.getSelection()?.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          setSelection({
            text: selectedText,
            position: {
              x: rect.left + window.scrollX,
              y: rect.bottom + window.scrollY,
            },
          })
        }
      }
    }, 10)
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Không đóng popup nếu click vào chính popup
      if (target.closest("[data-translation-popup]")) {
        return
      }

      // Delay để kiểm tra xem có selection mới không
      setTimeout(() => {
        const currentSelection = window.getSelection()?.toString().trim()
        if (!currentSelection) {
          clearSelection()
        }
      }, 50)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [clearSelection])

  return { selection, handleMouseUp, clearSelection }
}
