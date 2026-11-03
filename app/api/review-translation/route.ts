import { generateAiJson } from "@/lib/ai"

interface TranslationReview {
  score: number
  isCorrect: boolean
  feedback: string
  suggestedTranslation: string
  improvements: string[]
  vocabularyTips: string[]
  grammarNotes: string
}

export async function POST(req: Request) {
  try {
    const { vietnameseSentence, userTranslation, prompt, bandTarget = 7 } = await req.json()

    if (!vietnameseSentence || !userTranslation) {
      return Response.json(
        { error: "Thiếu câu tiếng Việt hoặc bản dịch tiếng Anh" },
        { status: 400 }
      )
    }

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const systemPrompt = `Bạn là một giáo viên chuyên luyện thi IELTS Writing band 8.5+. Hãy đánh giá chi tiết bản dịch tiếng Anh của học viên từ câu tiếng Việt.

Đề bài IELTS: ${prompt || "IELTS Writing"}
Câu tiếng Việt gốc: "${vietnameseSentence}"
Bản dịch của học viên: "${userTranslation}"
Band mục tiêu: Band ${bandTarget}

Hãy đánh giá và trả về duy nhất JSON object theo cấu trúc:
{
  "score": 8, // thang điểm từ 1 đến 10
  "isCorrect": true, // true nếu đúng ngữ nghĩa và cấu trúc chấp nhận được
  "feedback": "Nhận xét ngắn gọn, súc tích bằng tiếng Việt về bản dịch",
  "suggestedTranslation": "Bản dịch tiếng Anh xuất sắc chuẩn văn phong học thuật IELTS Band ${bandTarget}",
  "improvements": ["Gợi ý cải thiện 1 bằng tiếng Việt", "Gợi ý cải thiện 2"],
  "vocabularyTips": ["Collocation hoặc từ vựng học thuật C1/C2 kèm giải thích"],
  "grammarNotes": "Lưu ý ngữ pháp quan trọng (nếu có) bằng tiếng Việt"
}`

    const review = await generateAiJson<TranslationReview>({
      prompt: "Hãy đánh giá bản dịch trên và trả về kết quả JSON:",
      system: systemPrompt,
      temperature: 0.2,
      apiKey: customApiKey,
      model: customModel,
      defaultFallback: {
        score: 7,
        isCorrect: true,
        feedback: "Bản dịch truyền tải được ý chính, câu văn rõ ràng.",
        suggestedTranslation: userTranslation,
        improvements: ["Có thể sử dụng thêm từ nối học thuật để câu mượt mà hơn."],
        vocabularyTips: [],
        grammarNotes: "Chú ý sự phù hợp giữa danh từ số nhiều và động từ.",
      },
    })

    return Response.json({
      success: true,
      review,
    })
  } catch (error: any) {
    console.error("Review translation error:", error)
    return Response.json(
      { error: error?.message || "Không thể đánh giá bản dịch. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
