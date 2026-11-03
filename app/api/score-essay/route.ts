import { generateAiJson } from "@/lib/ai"

interface FeedbackResponse {
  overallScore: number
  feedback: {
    taskResponse: {
      score: number
      feedback: string
    }
    coherenceCohesion: {
      score: number
      feedback: string
    }
    lexicalResource: {
      score: number
      feedback: string
    }
    grammaticalRange: {
      score: number
      feedback: string
    }
    overall: string
    improvements: string[]
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, essay, taskType } = await req.json()

    if (!essay || typeof essay !== "string" || essay.trim().length < 15) {
      return Response.json(
        { error: "Bài viết quá ngắn để có thể chấm điểm IELTS (tối thiểu 15 từ)." },
        { status: 400 }
      )
    }

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const wordCount = essay.split(/\s+/).filter(Boolean).length
    const minWords = taskType === "task1" ? 150 : 250

    const scoringPrompt = `You are a certified senior IELTS examiner. Score the following IELTS essay strictly according to the official IELTS Band Descriptors (9-band scale).

Task Type: ${taskType === "task1" ? "IELTS Academic Task 1 (Report/Summary)" : "IELTS Task 2 (Discursive/Argumentative Essay)"}
Target Minimum Word Count: ${minWords} words
Actual Word Count: ${wordCount} words

Writing Prompt:
"""
${prompt || "General IELTS writing task"}
"""

Candidate's Essay:
"""
${essay}
"""

Evaluate across the 4 official criteria:
1. Task Response (TR) / Task Achievement (TA)
2. Coherence and Cohesion (CC)
3. Lexical Resource (LR)
4. Grammatical Range and Accuracy (GRA)

Requirements:
- Scores MUST be standard IELTS band scores (0.0 to 9.0 in 0.5 increments, e.g. 5.5, 6.0, 6.5, 7.0, 7.5, 8.0).
- overallScore is the average of the 4 criteria rounded to the nearest half-band.
- If word count is significantly under ${minWords} words, penalize Task Response accordingly.
- Write constructive, clear feedback and improvements in VIETNAMESE so the Vietnamese learner can understand and improve effectively.
- Return ONLY valid JSON matching this schema:
{
  "overallScore": 7.0,
  "feedback": {
    "taskResponse": { "score": 7.0, "feedback": "Chi tiết nhận xét TR bằng tiếng Việt..." },
    "coherenceCohesion": { "score": 7.0, "feedback": "Chi tiết nhận xét CC bằng tiếng Việt..." },
    "lexicalResource": { "score": 7.0, "feedback": "Chi tiết nhận xét LR bằng tiếng Việt..." },
    "grammaticalRange": { "score": 7.0, "feedback": "Chi tiết nhận xét GRA bằng tiếng Việt..." },
    "overall": "Nhận xét tổng quan toàn bài bằng tiếng Việt...",
    "improvements": [
      "Điểm cải thiện cụ thể 1...",
      "Điểm cải thiện cụ thể 2...",
      "Điểm cải thiện cụ thể 3..."
    ]
  }
}`

    const result = await generateAiJson<FeedbackResponse>({
      prompt: scoringPrompt,
      system:
        "You are an expert IELTS examiner providing detailed band scoring and feedback in Vietnamese.",
      temperature: 0.2,
      apiKey: customApiKey,
      model: customModel,
      defaultFallback: {
        overallScore: 6.0,
        feedback: {
          taskResponse: {
            score: 6.0,
            feedback: "Bài viết đã trả lời yêu cầu đề bài ở mức cơ bản.",
          },
          coherenceCohesion: {
            score: 6.0,
            feedback: "Bố cục rõ ràng, cần tăng cường sự mượt mà giữa các đoạn.",
          },
          lexicalResource: {
            score: 6.0,
            feedback: "Từ vựng phù hợp, nên mở rộng thêm các collocation nâng cao.",
          },
          grammaticalRange: {
            score: 6.0,
            feedback: "Cấu trúc câu đa dạng, chú ý lỗi mạo từ và sự hòa hợp chủ vị.",
          },
          overall: "Bài viết đạt mức trung bình khá, cần luyện tập thêm để nâng band.",
          improvements: [
            "Mở rộng vốn từ vựng học thuật theo chủ đề.",
            "Tập trung phát triển sâu hơn các luận điểm chính.",
            "Kiểm tra lại tính chính xác của các thì và cấu trúc câu ghép.",
          ],
        },
      },
    })

    return Response.json(result)
  } catch (error: any) {
    console.error("Score essay error:", error)
    return Response.json(
      { error: error?.message || "Không thể chấm điểm bài viết. Vui lòng kiểm tra lại kết nối AI." },
      { status: 500 }
    )
  }
}
