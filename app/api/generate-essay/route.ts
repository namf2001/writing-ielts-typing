import { generateAiText } from "@/lib/ai"

export async function POST(req: Request) {
  try {
    const { prompt, bandTarget = 7, taskType = "task2" } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Thiếu đề bài writing" }, { status: 400 })
    }

    const customApiKey = req.headers.get("x-groq-api-key") || undefined
    const customModel = req.headers.get("x-groq-model") || undefined

    const minWords = taskType === "task1" ? 150 : 250

    const systemPrompt = `You are an expert IELTS Writing instructor and examiner.
Write a complete, authentic model essay targeting Band ${bandTarget} for the prompt below.

Prompt:
"${prompt}"

Task Type: ${taskType === "task1" ? "IELTS Academic Task 1" : "IELTS Task 2"}
Target Band: ${bandTarget}
Minimum Word Count: ${minWords} words (aim for around ${taskType === "task1" ? "170-190" : "270-310"} words)

Guidelines for Band ${bandTarget}:
${
  bandTarget >= 8
    ? "- Flawlessly structured paragraphs, natural cohesive devices without mechanical linking words\n- Sophisticated and precise lexical resource with rare/idiomatic academic collocations\n- Wide variety of complex grammatical structures used with full flexibility and accuracy"
    : bandTarget >= 7
    ? "- Clear progression throughout, good paragraphing and logical transitions\n- Sufficient range of vocabulary with some awareness of style and collocation\n- Variety of complex sentences with frequent error-free sentences"
    : "- Adequate paragraphing and clear overall progression\n- Generally appropriate vocabulary for the task, some repetition or minor inaccuracy\n- Mix of simple and complex sentence forms"
}

IMPORTANT: Output ONLY the essay body paragraphs (separate paragraphs with double line breaks). Do NOT include titles, word counts, notes, or explanations.`

    const essayText = await generateAiText({
      prompt: "Write the essay now following all guidelines.",
      system: systemPrompt,
      temperature: 0.6,
      maxTokens: 1500,
      apiKey: customApiKey,
      model: customModel,
    })

    return Response.json({ essay: essayText.trim() })
  } catch (error: any) {
    console.error("Generate essay error:", error)
    return Response.json(
      { error: error?.message || "Không thể tạo bài mẫu. Vui lòng thử lại." },
      { status: 500 }
    )
  }
}
