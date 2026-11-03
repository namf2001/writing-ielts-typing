import { generateAiText } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { prompt, bandTarget = 7, taskType = "task2", currentEssay } = await req.json()

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const minWords = taskType === "task1" ? 150 : 250

    const systemPrompt = `You are a high-level IELTS writing coach.
The student is practicing their IELTS writing and needs assistance.

Writing Prompt:
"${prompt || "IELTS Essay"}"

${currentEssay ? `Current Student's Draft:\n"""${currentEssay}"""\n` : ""}

Task:
${
  currentEssay
    ? `Analyze the student's draft and provide a polished, improved version at Band ${bandTarget} that preserves their core ideas while elevating vocabulary, eliminating grammatical errors, and improving logical cohesion.`
    : `Generate a model outline and full essay targeted at Band ${bandTarget} (at least ${minWords} words).`
}

Output ONLY the revised/generated essay text directly. Do not include introductory conversational chatter.`

    const result = await generateAiText({
      prompt: "Generate the response now:",
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 1500,
      apiKey: customApiKey,
      model: customModel,
    })

    return Response.json({ suggestion: result.trim() })
  } catch (error: any) {
    console.error("Generate assist error:", error)
    return Response.json(
      { error: error?.message || "Không thể tạo gợi ý viết lúc này." },
      { status: 500 }
    )
  }
}
