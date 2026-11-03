import { generateAiText } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { topic, taskType = "task2", bandTarget = 7 } = await req.json()

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const systemPrompt = `You are an official Cambridge IELTS test writer. Generate an authentic, realistic IELTS Writing exam prompt.

Task Type: ${taskType === "task1" ? "IELTS Academic Task 1 (or General Training Letter)" : "IELTS Task 2 (Essay)"}
Topic Category: ${topic ? topic : "Any contemporary global topic (education, environment, technology, society, health, economy, culture, work)"}
Target Band Level: Band ${bandTarget}

Requirements:
- Follow real Cambridge IELTS question phrasing (e.g. "To what extent do you agree or disagree?", "Discuss both views and give your opinion.", "What are the causes of this and what solutions can be suggested?", "Summarise the information by selecting and reporting the main features...").
- For Task 2, include clear instructions: "Give reasons for your answer and include any relevant examples from your own knowledge or experience."
- Return ONLY the prompt text directly. No preamble, no greetings, no markdown backticks.`

    const promptText = await generateAiText({
      prompt: "Generate 1 authentic IELTS writing prompt now.",
      system: systemPrompt,
      temperature: 0.8,
      maxTokens: 300,
      apiKey: customApiKey,
      model: customModel,
    })

    return Response.json({ prompt: promptText.trim() })
  } catch (error: any) {
    console.error("Generate prompt error:", error)
    return Response.json(
      { error: error?.message || "Không thể tạo đề bài tự động." },
      { status: 500 }
    )
  }
}
