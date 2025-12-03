import { translate } from "@vitalets/google-translate-api"

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Thiếu văn bản cần dịch" }, { status: 400 })
    }

    const result = await translate(text, {
      to: targetLang === "vi" ? "vi" : "en",
    })

    return Response.json({
      translated: result.text,
      from: result.raw?.src || "auto",
    })
  } catch (error) {
    console.error("Translate error:", error)
    return Response.json(
      { error: "Không thể dịch văn bản. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
