import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

const feedbackSchema = z.object({
  overallScore: z.number().min(0).max(9),
  feedback: z.object({
    taskResponse: z.object({
      score: z.number().min(0).max(9),
      feedback: z.string(),
    }),
    coherenceCohesion: z.object({
      score: z.number().min(0).max(9),
      feedback: z.string(),
    }),
    lexicalResource: z.object({
      score: z.number().min(0).max(9),
      feedback: z.string(),
    }),
    grammaticalRange: z.object({
      score: z.number().min(0).max(9),
      feedback: z.string(),
    }),
    overall: z.string(),
    improvements: z.array(z.string()),
  }),
})

export async function POST(req: Request) {
  const { prompt, essay, taskType } = await req.json()

  const wordCount = essay.split(/\s+/).filter(Boolean).length
  const minWords = taskType === "task1" ? 150 : 250

  const scoringPrompt = `You are an experienced IELTS examiner. Score the following essay according to official IELTS band descriptors.

Writing Prompt: ${prompt}

Essay (${wordCount} words, minimum required: ${minWords}):
${essay}

Evaluate the essay based on the four IELTS criteria:
1. Task Response (TR) - How well the essay addresses the prompt
2. Coherence and Cohesion (CC) - Organization and flow of ideas
3. Lexical Resource (LR) - Vocabulary range and accuracy
4. Grammatical Range and Accuracy (GRA) - Grammar variety and correctness

For each criterion:
- Provide a band score (0-9, can use .5 increments like 6.5, 7.5)
- Give specific, constructive feedback in Vietnamese

Also provide:
- Overall band score (average of four criteria, rounded to nearest 0.5)
- Overall feedback summarizing strengths and weaknesses in Vietnamese
- 3-5 specific improvement suggestions in Vietnamese

Be fair but constructive. Consider word count penalties if under minimum.`

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: feedbackSchema,
    prompt: scoringPrompt,
    maxOutputTokens: 2000,
  })

  return Response.json(object)
}
