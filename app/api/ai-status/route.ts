import { getGroqClient, DEFAULT_GROQ_MODEL } from "@/lib/ai"

export async function POST(req: Request) {
  const startTime = Date.now()
  try {
    const body = await req.json().catch(() => ({}))
    const customApiKey = body.apiKey || req.headers.get("x-groq-api-key") || undefined
    const customModel = body.model || req.headers.get("x-groq-model") || process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL

    const client = getGroqClient(customApiKey)

    // Quick test ping
    const completion = await client.chat.completions.create({
      messages: [{ role: "user", content: "Ping. Reply 'PONG' in 1 word." }],
      model: customModel,
      max_tokens: 5,
    })

    const latencyMs = Date.now() - startTime
    const reply = completion.choices[0]?.message?.content?.trim() || ""

    return Response.json({
      ok: true,
      provider: "Groq (rac-vl)",
      model: customModel,
      latencyMs,
      message: `Kết nối thành công! Phản hồi trong ${latencyMs}ms.`,
      reply,
    })
  } catch (error: any) {
    const latencyMs = Date.now() - startTime
    console.error("AI Status check error:", error)
    return Response.json(
      {
        ok: false,
        latencyMs,
        error: error?.message || "Không thể kết nối tới Groq AI.",
      },
      { status: 500 }
    )
  }
}
