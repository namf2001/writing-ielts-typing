// Simple in-memory cache
const cache = new Map<string, { result: string; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

// List of public Lingva instances (fallback if one fails)
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.plausibility.cloud",
  "https://lingva.garuber.com",
  "https://lingva.thedaviddelta.com",
]

async function translateWithLingva(text: string, targetLang: string): Promise<string> {
  const sourceLang = "auto"
  const to = targetLang === "vi" ? "vi" : "en"

  for (const instance of LINGVA_INSTANCES) {
    try {
      const url = `${instance}/api/v1/${sourceLang}/${to}/${encodeURIComponent(text)}`
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (response.ok) {
        const data = await response.json()
        return data.translation
      }
    } catch (error) {
      console.log(`Lingva instance ${instance} failed, trying next...`)
      continue
    }
  }

  throw new Error("All Lingva translation instances failed")
}

export async function POST(req: Request) {
  try {
    const { text, targetLang } = await req.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Thiếu văn bản cần dịch" }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${text}-${targetLang}`
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json({
        translated: cached.result,
        from: "cache",
      })
    }

    const translation = await translateWithLingva(text, targetLang)

    // Cache the result
    cache.set(cacheKey, { result: translation, timestamp: Date.now() })

    // Clean old cache entries (keep max 500)
    if (cache.size > 500) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 250).forEach(([key]) => cache.delete(key))
    }

    return Response.json({
      translated: translation,
      from: "auto",
    })
  } catch (error) {
    console.error("Translate error:", error)
    return Response.json(
      { error: "Không thể dịch văn bản. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}
