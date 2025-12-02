import { generateText } from "ai"

export async function POST(req: Request) {
  const { prompt, bandTarget, taskType, currentEssay } = await req.json()

  const minWords = taskType === "task1" ? 150 : 250

  const systemPrompt = `You are an IELTS writing assistant. Generate a model essay that would score around Band ${bandTarget}.

Writing Prompt: ${prompt}

${currentEssay ? `Current essay draft (user wants to improve this):\n${currentEssay}\n\n` : ""}

Requirements:
- Write a complete essay of at least ${minWords} words
- Target Band ${bandTarget} vocabulary and grammar complexity
- Use appropriate academic writing style
- Include clear introduction, body paragraphs, and conclusion
- Use cohesive devices and varied sentence structures
- If there's a current draft, improve upon it while keeping the user's ideas

Write the essay now:`

  const { text } = await generateText({
    model: "google/gemini-2.0-flash-001",
    prompt: systemPrompt,
    maxOutputTokens: 2000,
    temperature: 0.7,
  })

  return Response.json({
    suggestion: text.trim(),
  })
}
