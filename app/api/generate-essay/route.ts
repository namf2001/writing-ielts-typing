import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { prompt, taskType, bandTarget } = await req.json()

    const minWords = taskType === "task1" ? 150 : 250
    const maxWords = taskType === "task1" ? 200 : 350

    const systemPrompt = `You are an expert IELTS essay writer. Write a model essay that would achieve Band ${bandTarget}.

Writing Prompt: ${prompt}

Requirements:
- Write exactly between ${minWords} and ${maxWords} words
- Demonstrate Band ${bandTarget} level vocabulary and grammar
- Use appropriate essay structure with clear paragraphs
- Include relevant examples and supporting details
- Use cohesive devices appropriately for Band ${bandTarget}
- Write naturally, as a skilled test-taker would

Band ${bandTarget} characteristics to demonstrate:
${bandTarget >= 8 ? "- Sophisticated vocabulary with rare lexical items\n- Wide range of grammatical structures with full flexibility\n- Skillful paragraphing throughout" : ""}
${bandTarget >= 7 ? "- Good range of vocabulary with some less common items\n- Variety of complex structures with good control\n- Clear progression of ideas" : ""}
${bandTarget >= 6 ? "- Adequate vocabulary for the task\n- Mix of simple and complex sentences\n- Logical organization of information" : ""}
${bandTarget < 6 ? "- Basic but adequate vocabulary\n- Some complex sentences attempted\n- Overall progression of ideas" : ""}

Write the essay now (no title, no word count, just the essay):`.trim()

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: systemPrompt,
      maxOutputTokens: 1500,
      temperature: 0.7,
    })

    return Response.json({
      essay: text.trim(),
      bandTarget,
    })
  } catch (error: unknown) {
    console.error("Generate essay error:", error)
    
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
