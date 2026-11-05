import { generateAiText } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { prompt, topic, taskType = "task2", bandTarget = 7.5 } = body

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    let finalPrompt = (prompt || "").trim()

    // 1. Nếu chưa có đề bài, AI tự động sinh đề thi chuẩn Cambridge IELTS theo chủ đề
    if (!finalPrompt) {
      const topicCategory =
        topic && topic !== "all"
          ? topic
          : "contemporary global issues (education, technology, environment, society, health, economy)"

      const promptSystem = `You are an official Cambridge IELTS test writer. Generate an authentic, realistic IELTS Writing exam prompt in English.
Task Type: ${taskType === "task1" ? "IELTS Academic Task 1" : "IELTS Task 2 (Essay)"}
Topic Category: ${topicCategory}
Target Band Level: Band ${bandTarget}

Requirements:
- Follow real Cambridge IELTS question phrasing (e.g. "To what extent do you agree or disagree?", "Discuss both views and give your opinion.", "What are the causes of this and what solutions can be suggested?").
- For Task 2, include standard instructions: "Give reasons for your answer and include any relevant examples from your own knowledge or experience."
- Output ONLY the prompt text directly. No preamble, no quotes, no markdown headers.`

      const generatedPrompt = await generateAiText({
        prompt: `Generate 1 authentic IELTS writing prompt about "${topicCategory}" now.`,
        system: promptSystem,
        temperature: 0.8,
        maxTokens: 250,
        apiKey: customApiKey,
        model: customModel,
      })

      finalPrompt = generatedPrompt.replace(/^["']|["']$/g, "").trim()
    }

    // 2. Sinh bài văn tiếng Việt hoàn chỉnh dựa trên đề bài để học viên luyện dịch
    const essaySystem = `Bạn là một dịch giả và giáo viên luyện thi IELTS song ngữ Anh-Việt xuất sắc.
Hãy viết một bài văn bằng TIẾNG VIỆT hoàn chỉnh dựa trên đề bài IELTS sau để học viên có thể luyện dịch từng câu sang tiếng Anh.

Đề bài IELTS:
"${finalPrompt}"

Yêu cầu:
1. Viết bằng tiếng Việt tự nhiên, chuẩn mực, mạch lạc, chia đoạn rõ ràng (Mở bài, 2 đoạn Thân bài, Kết bài).
2. Các câu văn nên có cấu trúc rõ ràng, logic, giàu ý tưởng lập luận để khi dịch sang tiếng Anh sẽ vận dụng được các cấu trúc câu phức, mệnh đề quan hệ, từ nối học thuật.
3. Độ dài khoảng 250 - 320 từ tiếng Việt (mỗi câu hoàn chỉnh kết thúc bằng dấu câu rõ ràng).
4. Chỉ xuất ra nội dung bài văn tiếng Việt (các đoạn cách nhau 1 dòng trống). Không thêm tiêu đề, chú thích hay đếm từ.`

    const vietnameseEssay = await generateAiText({
      prompt: "Hãy viết bài văn tiếng Việt hoàn chỉnh ngay bây giờ:",
      system: essaySystem,
      temperature: 0.6,
      maxTokens: 1500,
      apiKey: customApiKey,
      model: customModel,
    })

    const cleanedEssay = vietnameseEssay.trim()

    // Trả về đầy đủ các trường để tương thích mọi component gọi API
    return Response.json({
      prompt: finalPrompt,
      vietnameseEssay: cleanedEssay,
      essay: cleanedEssay,
    })
  } catch (error: any) {
    console.error("Generate vietnamese essay error:", error)
    return Response.json(
      { error: error?.message || "Không thể tạo bài văn tiếng Việt. Vui lòng thử lại." },
      { status: 500 }
    )
  }
}
