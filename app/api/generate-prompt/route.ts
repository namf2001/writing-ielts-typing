import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  const { topic, taskType, bandTarget } = await req.json()

  const topicInstruction =
    topic && topic !== "random"
      ? `about the topic: ${topic}`
      : "on a random common IELTS topic (education, technology, environment, health, society, work, culture)"

  const taskInstruction =
    taskType === "task1"
      ? "Write an IELTS Academic Writing Task 1 prompt. The prompt should describe a chart, graph, table, or diagram that candidates need to analyze and summarize in at least 150 words."
      : "Write an IELTS Academic Writing Task 2 prompt. The prompt should present an opinion, problem, or discussion topic that candidates need to write an essay about in at least 250 words."

  const prompt = `${taskInstruction}

Topic: ${topicInstruction}

Requirements:
- The prompt should be clear and specific
- It should be suitable for IELTS band ${bandTarget || 7} level
- Write only the prompt text, no additional instructions
- Keep it concise but comprehensive

Generate the prompt now:`

  const { text } = await generateText({
    model: google("gemini-2.0-flash"),
    prompt,
    maxOutputTokens: 500,
    temperature: 0.8,
  })

  return Response.json({
    prompt: text.trim(),
    topic: topic || "random",
  })
}
