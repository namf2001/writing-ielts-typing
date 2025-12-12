import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { vietnameseSentence, userTranslation, prompt, bandTarget } = await req.json()

    const systemPrompt = `Bạn là một giáo viên IELTS chuyên nghiệp. Hãy đánh giá bản dịch tiếng Anh của học viên.

Đề bài IELTS gốc: ${prompt}

Câu tiếng Việt gốc: "${vietnameseSentence}"

Bản dịch của học viên: "${userTranslation}"

Band mục tiêu: ${bandTarget}

Hãy đánh giá và phản hồi theo format JSON sau:
{
  "score": <điểm từ 1-10>,
  "isCorrect": <true nếu bản dịch chấp nhận được, false nếu cần sửa>,
  "feedback": "<nhận xét ngắn gọn về bản dịch>",
  "suggestedTranslation": "<bản dịch gợi ý đạt Band ${bandTarget}>",
  "improvements": ["<gợi ý cải thiện 1>", "<gợi ý cải thiện 2>"],
  "vocabularyTips": ["<từ vựng hay có thể dùng>"],
  "grammarNotes": "<lưu ý về ngữ pháp nếu có>"
}

Lưu ý:
- Đánh giá dựa trên độ chính xác ngữ nghĩa, ngữ pháp, và từ vựng phù hợp với Band ${bandTarget}
- Nếu bản dịch đúng nghĩa nhưng có thể cải thiện, vẫn đánh isCorrect = true
- Gợi ý các từ vựng và cấu trúc phù hợp với IELTS Writing
- Phản hồi bằng tiếng Việt, chỉ bản dịch gợi ý bằng tiếng Anh

Trả về JSON:`.trim()

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: systemPrompt,
      maxOutputTokens: 1000,
      temperature: 0.3,
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json(
        { error: "Không thể phân tích phản hồi" },
        { status: 500 }
      )
    }

    const review = JSON.parse(jsonMatch[0])

    return Response.json({
      success: true,
      review,
    })
  } catch (error: unknown) {
    console.error("Review translation error:", error)
    
    const errorObj = error as { lastError?: { statusCode?: number } }
    if (errorObj?.lastError?.statusCode === 429) {
      return Response.json(
        { error: "Đã vượt quá giới hạn API. Vui lòng đợi 1-2 phút rồi thử lại." },
        { status: 429 }
      )
    }
    
    return Response.json(
      { error: "Không thể đánh giá bản dịch. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
