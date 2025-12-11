import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

// Schema không yêu cầu startIndex và endIndex từ AI
const annotationSchema = z.object({
  annotations: z.array(z.object({
    text: z.string().describe("Đoạn văn bản chính xác từ bài viết cần đánh dấu"),
    type: z.enum(["excellent", "good", "warning", "error", "spelling", "grammar", "vocabulary", "coherence"]),
    category: z.enum(["taskResponse", "coherenceCohesion", "lexicalResource", "grammaticalRange", "spelling", "general"]),
    suggestion: z.string(),
    correctedText: z.string().optional(),
    reason: z.string(),
    impact: z.string(),
    examples: z.array(z.string()).optional(),
  }))
})

// Hàm tìm vị trí chính xác của đoạn text trong bài viết
function findTextPositions(essay: string, annotations: Array<{
  text: string
  type: string
  category: string
  suggestion: string
  correctedText?: string
  reason: string
  impact: string
  examples?: string[]
}>) {
  const result: Array<{
    startIndex: number
    endIndex: number
    text: string
    type: string
    category: string
    suggestion: string
    correctedText?: string
    reason: string
    impact: string
    examples?: string[]
  }> = []

  const usedRanges: Array<{ start: number; end: number }> = []

  for (const annotation of annotations) {
    const searchText = annotation.text.trim()
    if (!searchText) continue

    // Tìm vị trí của đoạn text trong bài viết
    let startIndex = essay.indexOf(searchText)
    
    // Nếu không tìm thấy chính xác, thử tìm với lowercase
    if (startIndex === -1) {
      const lowerEssay = essay.toLowerCase()
      const lowerSearch = searchText.toLowerCase()
      startIndex = lowerEssay.indexOf(lowerSearch)
    }

    // Nếu vẫn không tìm thấy, bỏ qua annotation này
    if (startIndex === -1) continue

    const endIndex = startIndex + searchText.length

    // Kiểm tra xem vùng này đã được sử dụng chưa (tránh trùng lặp)
    const isOverlapping = usedRanges.some(range => 
      (startIndex >= range.start && startIndex < range.end) ||
      (endIndex > range.start && endIndex <= range.end) ||
      (startIndex <= range.start && endIndex >= range.end)
    )

    if (isOverlapping) continue

    usedRanges.push({ start: startIndex, end: endIndex })

    result.push({
      startIndex,
      endIndex,
      text: essay.substring(startIndex, endIndex), // Lấy text gốc từ bài viết
      type: annotation.type,
      category: annotation.category,
      suggestion: annotation.suggestion,
      correctedText: annotation.correctedText,
      reason: annotation.reason,
      impact: annotation.impact,
      examples: annotation.examples,
    })
  }

  // Sắp xếp theo vị trí xuất hiện
  result.sort((a, b) => a.startIndex - b.startIndex)

  return result
}

export async function POST(req: Request) {
  try {
    const { prompt, essay, taskType } = await req.json()

    const analysisPrompt = `Bạn là giám khảo IELTS Writing có kinh nghiệm. Hãy phân tích chi tiết bài viết sau và đánh dấu các đoạn cụ thể.

Đề bài: ${prompt}

Bài viết:
"${essay}"

QUAN TRỌNG: Hãy copy CHÍNH XÁC các đoạn văn bản từ bài viết trên (bao gồm cả lỗi chính tả nếu có). KHÔNG được thay đổi hay sửa text.

Hãy phân tích và tạo annotations cho bài viết:

**Loại đánh giá (type):**
- "excellent": Đoạn văn xuất sắc, từ vựng cao cấp, cấu trúc phức tạp chính xác
- "good": Đoạn văn tốt, ý tưởng hay hoặc diễn đạt tốt
- "warning": Cần cải thiện, có thể dùng từ vựng/cấu trúc tốt hơn
- "error": Lỗi nghiêm trọng về ngữ pháp, logic
- "spelling": Lỗi chính tả (ví dụ: "taht" thay vì "that", "financail" thay vì "financial")
- "grammar": Lỗi ngữ pháp
- "vocabulary": Từ vựng không phù hợp
- "coherence": Vấn đề liên kết ý

**Danh mục (category):** taskResponse, coherenceCohesion, lexicalResource, grammaticalRange, spelling, general

Cho mỗi annotation:
1. **text**: Copy CHÍNH XÁC đoạn văn bản từ bài viết (giữ nguyên lỗi chính tả nếu có)
2. **type**: Loại đánh giá
3. **category**: Danh mục
4. **suggestion**: Gợi ý cải thiện bằng tiếng Việt (2-3 câu)
5. **correctedText**: (Nếu có lỗi) Cách sửa đúng
6. **reason**: Lý do đánh giá (1-2 câu)
7. **impact**: Ảnh hưởng đến band score
8. **examples**: (Optional) 1-2 ví dụ cải thiện

Lưu ý:
- Mỗi đoạn text chỉ được đánh dấu MỘT LẦN
- Các đoạn KHÔNG ĐƯỢC CHỒNG CHÉO lên nhau
- Ưu tiên đánh dấu: lỗi chính tả > lỗi ngữ pháp > điểm tốt > cảnh báo
- Với bài viết ngắn, chỉ cần 3-5 annotations là đủ`

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: annotationSchema,
      prompt: analysisPrompt,
      temperature: 0.2,
    })

    // Tìm vị trí chính xác và loại bỏ trùng lặp
    const processedAnnotations = findTextPositions(essay, object.annotations)

    return Response.json({ annotations: processedAnnotations })
  } catch (error: unknown) {
    console.error("Annotate essay error:", error)
    
    const errorObj = error as { lastError?: { statusCode?: number } }
    if (errorObj?.lastError?.statusCode === 429) {
      return Response.json(
        { error: "Đã vượt quá giới hạn API. Vui lòng đợi 1-2 phút rồi thử lại." },
        { status: 429 }
      )
    }
    
    return Response.json(
      { error: "Không thể phân tích bài viết. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
