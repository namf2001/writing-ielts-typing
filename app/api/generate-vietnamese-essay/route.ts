import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { prompt, taskType, bandTarget } = await req.json()

    const minWords = taskType === "task1" ? 150 : 250
    const maxWords = taskType === "task1" ? 200 : 350

    const systemPrompt = `Bạn là một chuyên gia viết luận IELTS. Hãy viết một bài luận mẫu bằng TIẾNG VIỆT cho đề bài sau.

Đề bài: ${prompt}

Yêu cầu:
- Viết bài luận hoàn chỉnh bằng TIẾNG VIỆT
- Độ dài tương đương ${minWords}-${maxWords} từ tiếng Anh (khoảng ${Math.round(minWords * 1.2)}-${Math.round(maxWords * 1.2)} từ tiếng Việt)
- Sử dụng cấu trúc bài luận rõ ràng với các đoạn văn mạch lạc
- Bao gồm các ví dụ và chi tiết hỗ trợ phù hợp
- Viết tự nhiên, như một người viết IELTS giỏi sẽ viết
- Đây là bài mẫu để người học dịch sang tiếng Anh, nên viết rõ ràng và dễ hiểu

Cấu trúc:
- Mở bài: Giới thiệu vấn đề và nêu quan điểm
- Thân bài: 2-3 đoạn văn phát triển ý
- Kết bài: Tóm tắt và kết luận

Viết bài luận ngay bây giờ (không tiêu đề, không đếm từ, chỉ nội dung bài luận):`.trim()

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: systemPrompt,
      maxOutputTokens: 2000,
      temperature: 0.7,
    })

    return Response.json({
      essay: text.trim(),
      bandTarget,
    })
  } catch (error: unknown) {
    console.error("Generate Vietnamese essay error:", error)
    
    const errorObj = error as { lastError?: { statusCode?: number } }
    if (errorObj?.lastError?.statusCode === 429) {
      return Response.json(
        { error: "Đã vượt quá giới hạn API. Vui lòng đợi 1-2 phút rồi thử lại." },
        { status: 429 }
      )
    }
    
    return Response.json(
      { error: "Không thể tạo bài mẫu. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
