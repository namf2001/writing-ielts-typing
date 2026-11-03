import { generateAiText } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { prompt, taskType = "task2" } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Thiếu đề bài writing" }, { status: 400 })
    }

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const systemPrompt = `Bạn là một dịch giả và giáo viên luyện thi IELTS song ngữ Anh-Việt xuất sắc.
Hãy viết một bài văn bằng TIẾNG VIỆT hoàn chỉnh dựa trên đề bài IELTS sau để học viên có thể luyện dịch từng câu sang tiếng Anh.

Đề bài:
"${prompt}"

Yêu cầu:
1. Viết bằng tiếng Việt tự nhiên, chuẩn mực, mạch lạc, chia đoạn rõ ràng (Mở bài, 2 đoạn Thân bài, Kết bài).
2. Các câu văn nên có cấu trúc rõ ràng, logic, giàu ý tưởng lập luận để khi dịch sang tiếng Anh sẽ vận dụng được các cấu trúc câu phức, mệnh đề quan hệ, từ nối học thuật.
3. Độ dài khoảng 250 - 320 từ tiếng Việt.
4. Chỉ xuất ra nội dung bài văn tiếng Việt (các đoạn cách nhau 1 dòng trống). Không thêm tiêu đề, chú thích hay đếm từ.`

    const vietnameseEssay = await generateAiText({
      prompt: "Hãy viết bài văn tiếng Việt hoàn chỉnh ngay bây giờ:",
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 1500,
      apiKey: customApiKey,
      model: customModel,
    })

    return Response.json({ essay: vietnameseEssay.trim() })
  } catch (error: any) {
    console.error("Generate vietnamese essay error:", error)
    return Response.json(
      { error: error?.message || "Không thể tạo bài văn tiếng Việt." },
      { status: 500 }
    )
  }
}
