// Free Dictionary API - không cần API key
const DICTIONARY_API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en"

// Cache để tránh gọi API nhiều lần cho cùng một từ
const cache = new Map<string, { result: DictionaryResponse; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 * 24 * 7 // 7 ngày

export interface Phonetic {
  text?: string
  audio?: string
  sourceUrl?: string
}

export interface Definition {
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

export interface Meaning {
  partOfSpeech: string
  definitions: Definition[]
  synonyms?: string[]
  antonyms?: string[]
}

export interface DictionaryEntry {
  word: string
  phonetic?: string
  phonetics: Phonetic[]
  meanings: Meaning[]
  sourceUrls?: string[]
}

export interface DictionaryResponse {
  success: boolean
  data?: DictionaryEntry
  error?: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const word = searchParams.get("word")

    if (!word || word.trim().length === 0) {
      return Response.json(
        { success: false, error: "Thiếu từ cần tra cứu" },
        { status: 400 }
      )
    }

    const normalizedWord = word.trim().toLowerCase()

    // Kiểm tra cache
    const cached = cache.get(normalizedWord)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json(cached.result)
    }

    // Gọi Free Dictionary API
    const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(normalizedWord)}`, {
      headers: {
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json({
          success: false,
          error: "Không tìm thấy từ này trong từ điển",
        })
      }
      throw new Error(`API returned ${response.status}`)
    }

    const data: DictionaryEntry[] = await response.json()

    if (!data || data.length === 0) {
      return Response.json({
        success: false,
        error: "Không tìm thấy thông tin từ vựng",
      })
    }

    // Lấy entry đầu tiên
    const entry = data[0]

    // Tìm audio URL (ưu tiên audio có nội dung)
    const audioPhonetic = entry.phonetics.find((p) => p.audio && p.audio.length > 0)

    const result: DictionaryResponse = {
      success: true,
      data: {
        word: entry.word,
        phonetic: entry.phonetic || audioPhonetic?.text,
        phonetics: entry.phonetics.filter((p) => p.audio || p.text),
        meanings: entry.meanings,
        sourceUrls: entry.sourceUrls,
      },
    }

    // Cache kết quả
    cache.set(normalizedWord, { result, timestamp: Date.now() })

    // Dọn cache cũ (giữ tối đa 200 từ)
    if (cache.size > 200) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 100).forEach(([key]) => cache.delete(key))
    }

    return Response.json(result)
  } catch (error) {
    console.error("Dictionary API error:", error)
    return Response.json(
      { success: false, error: "Không thể tra cứu từ điển. Vui lòng thử lại." },
      { status: 500 }
    )
  }
}
