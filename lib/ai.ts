import Groq from "groq-sdk"

export const DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b"
export const FALLBACK_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "allam-2-7b",
]

export const AVAILABLE_GROQ_MODELS = [
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B (Nhanh & Tối ưu tiếng Anh/Việt)", free: true },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B (Mô hình lớn, suy luận sâu)", free: true },
  { id: "openai/gpt-oss-20b", name: "GPT OSS 20B (Siêu nhẹ, phản hồi tức thì)", free: true },
]

export function getGroqClient(customApiKey?: string | null): Groq {
  const apiKey =
    customApiKey?.trim() ||
    process.env.GROQ_API_KEY ||
    ""

  return new Groq({ apiKey })
}

export function extractJsonFromText<T = any>(text: string): T {
  let cleaned = text.trim()

  // Handle markdown code blocks
  if (cleaned.includes("```")) {
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (jsonMatch && jsonMatch[1]) {
      cleaned = jsonMatch[1].trim()
    }
  }

  // Find outermost JSON object or array
  const firstBrace = cleaned.indexOf("{")
  const firstBracket = cleaned.indexOf("[")
  let startIdx = -1
  let endIdx = -1

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace
    endIdx = cleaned.lastIndexOf("}")
  } else if (firstBracket !== -1) {
    startIdx = firstBracket
    endIdx = cleaned.lastIndexOf("]")
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1)
  }

  try {
    return JSON.parse(cleaned)
  } catch (err) {
    // Minor repair: trailing commas
    const repaired = cleaned.replace(/,\s*([}\]])/g, "$1")
    try {
      return JSON.parse(repaired)
    } catch {
      throw new Error(`Failed to parse AI JSON response: ${text.slice(0, 150)}...`)
    }
  }
}

export interface GenerateTextOptions {
  prompt: string
  system?: string
  temperature?: number
  maxTokens?: number
  model?: string
  apiKey?: string
}

export async function generateAiText(options: GenerateTextOptions): Promise<string> {
  const groq = getGroqClient(options.apiKey)
  const initialModel = options.model || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL
  const candidateModels = [initialModel, ...FALLBACK_MODELS.filter((m) => m !== initialModel)]

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = []
  if (options.system) {
    messages.push({ role: "system", content: options.system })
  }
  messages.push({ role: "user", content: options.prompt })

  let lastError: any = null
  for (const model of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1500,
      })
      const content = completion.choices[0]?.message?.content?.trim() || ""
      if (content) return content
    } catch (err: any) {
      lastError = err
      console.warn(`Model ${model} failed, attempting next fallback...`, err?.message)
      if (err?.status === 429) {
        continue // Immediately try next free model on rate limit
      }
    }
  }

  throw lastError || new Error("All Groq AI models failed to respond.")
}

export interface GenerateJsonOptions<T> {
  prompt: string
  system?: string
  temperature?: number
  maxTokens?: number
  model?: string
  apiKey?: string
  defaultFallback?: T
}

export async function generateAiJson<T>(options: GenerateJsonOptions<T>): Promise<T> {
  const groq = getGroqClient(options.apiKey)
  const initialModel = options.model || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL
  const candidateModels = [initialModel, ...FALLBACK_MODELS.filter((m) => m !== initialModel)]

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = []
  const systemInstruction = `${options.system || ""}\n\nYou MUST respond with ONLY valid JSON, adhering strictly to the requested structure. Do not include markdown code block formatting or explanations outside the JSON object.`

  messages.push({ role: "system", content: systemInstruction.trim() })
  messages.push({ role: "user", content: options.prompt })

  let lastError: any = null
  for (const model of candidateModels) {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
        response_format: { type: "json_object" },
      })

      const content = completion.choices[0]?.message?.content || "{}"
      return extractJsonFromText<T>(content)
    } catch (err: any) {
      lastError = err
      console.warn(`Model ${model} JSON generation failed, trying next fallback...`, err?.message)
      if (err?.status === 429) {
        continue
      }
    }
  }

  if (options.defaultFallback) {
    return options.defaultFallback
  }
  throw lastError || new Error("Failed to generate JSON with Groq AI.")
}
