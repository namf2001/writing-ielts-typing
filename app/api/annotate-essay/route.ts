import { generateAiJson } from "@/lib/ai"

interface AnnotationRaw {
  text: string
  type: "excellent" | "good" | "warning" | "error" | "spelling" | "grammar" | "vocabulary" | "coherence"
  category: "taskResponse" | "coherenceCohesion" | "lexicalResource" | "grammaticalRange" | "spelling" | "general"
  suggestion: string
  correctedText?: string
  reason: string
  impact: string
  examples?: string[]
}

interface AnnotateResponseRaw {
  annotations: AnnotationRaw[]
}

function findTextPositions(
  essay: string,
  annotations: AnnotationRaw[]
) {
  const result: Array<AnnotationRaw & { startIndex: number; endIndex: number }> = []
  const usedRanges: Array<{ start: number; end: number }> = []

  for (const annotation of annotations) {
    const searchText = annotation.text?.trim()
    if (!searchText) continue

    // Exact search first
    let startIndex = essay.indexOf(searchText)

    // Case-insensitive search fallback
    if (startIndex === -1) {
      startIndex = essay.toLowerCase().indexOf(searchText.toLowerCase())
    }

    // Normalized whitespace search fallback
    if (startIndex === -1) {
      const cleanSearch = searchText.replace(/\s+/g, " ")
      const cleanEssay = essay.replace(/\s+/g, " ")
      const matchIdx = cleanEssay.indexOf(cleanSearch)
      if (matchIdx !== -1) {
        // Approximate to essay length
        startIndex = Math.min(matchIdx, essay.length - 1)
      }
    }

    if (startIndex === -1) continue

    const endIndex = Math.min(startIndex + searchText.length, essay.length)

    // Check overlap
    const isOverlapping = usedRanges.some(
      (range) =>
        (startIndex >= range.start && startIndex < range.end) ||
        (endIndex > range.start && endIndex <= range.end) ||
        (startIndex <= range.start && endIndex >= range.end)
    )

    if (isOverlapping) continue

    usedRanges.push({ start: startIndex, end: endIndex })

    result.push({
      ...annotation,
      startIndex,
      endIndex,
      text: essay.substring(startIndex, endIndex),
    })
  }

  return result.sort((a, b) => a.startIndex - b.startIndex)
}

export async function POST(req: Request) {
  try {
    const { prompt, essay, taskType } = await req.json()

    if (!essay || typeof essay !== "string" || essay.trim().length < 15) {
      return Response.json({ annotations: [] })
    }

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const analysisPrompt = `Bạn là giám khảo IELTS Writing nhiều năm kinh nghiệm. Hãy phân tích chi tiết bài viết dưới đây và trích xuất các điểm cần lưu ý (lỗi ngữ pháp, lỗi chính tả, từ vựng học thuật xuất sắc, hoặc gợi ý diễn đạt tự nhiên hơn).

Đề bài:
"""
${prompt || "IELTS Writing Task"}
"""

Bài viết:
"""
${essay}
"""

YÊU CẦU QUAN TRỌNG:
1. Trường 'text' PHẢI là đoạn trích nguyên văn CHÍNH XÁC từ bài viết (copy từng chữ, bao gồm cả lỗi sai nếu có).
2. Với lỗi chính tả (spelling), chỉ trích đúng từ bị sai (ví dụ "conutries"), không trích cả câu dài.
3. Cung cấp gợi ý (suggestion) và lý do (reason) bằng tiếng Việt rõ ràng, dễ hiểu.
4. Trường 'type' chọn từ: "excellent" | "good" | "warning" | "error" | "spelling" | "grammar" | "vocabulary" | "coherence"
5. Trường 'category' chọn từ: "taskResponse" | "coherenceCohesion" | "lexicalResource" | "grammaticalRange" | "spelling" | "general"

Trả về JSON theo format sau:
{
  "annotations": [
    {
      "text": "cụm từ chính xác trích từ bài",
      "type": "grammar",
      "category": "grammaticalRange",
      "suggestion": "Nên đổi thành...",
      "correctedText": "cách viết chuẩn",
      "reason": "Lý do vì sao sai hoặc chưa tối ưu",
      "impact": "Giúp tăng 0.5 band GRA nếu sửa",
      "examples": ["Ví dụ tương tự 1", "Ví dụ 2"]
    }
  ]
}`

    const rawResponse = await generateAiJson<AnnotateResponseRaw>({
      prompt: analysisPrompt,
      system:
        "Bạn là chuyên gia phân tích bài thi IELTS Writing. Trả về đúng JSON danh sách annotations.",
      temperature: 0.2,
      apiKey: customApiKey,
      model: customModel,
      defaultFallback: { annotations: [] },
    })

    const processedAnnotations = findTextPositions(essay, rawResponse.annotations || [])

    return Response.json({ annotations: processedAnnotations })
  } catch (error: any) {
    console.error("Annotate essay error:", error)
    return Response.json(
      { error: error?.message || "Không thể phân tích bài viết lúc này." },
      { status: 500 }
    )
  }
}
