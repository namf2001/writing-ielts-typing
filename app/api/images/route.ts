const PIXABAY_API_URL = "https://pixabay.com/api/"

// Cache để tránh gọi API nhiều lần
const cache = new Map<string, { result: PixabayResponse; timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 giờ

export interface PixabayImage {
  id: number
  webformatURL: string
  previewURL: string
  largeImageURL: string
  tags: string
  user: string
  userImageURL: string
}

export interface PixabayResponse {
  success: boolean
  images?: PixabayImage[]
  error?: string
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const word = searchParams.get("word")

    if (!word || word.trim().length === 0) {
      return Response.json(
        { success: false, error: "Thiếu từ cần tìm ảnh" },
        { status: 400 }
      )
    }

    const normalizedWord = word.trim().toLowerCase()

    // Kiểm tra cache
    const cached = cache.get(normalizedWord)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Response.json(cached.result)
    }

    const apiKey = process.env.PIXABAY_API_KEY
    if (!apiKey) {
      return Response.json(
        { success: false, error: "Chưa cấu hình Pixabay API key" },
        { status: 500 }
      )
    }

    // Gọi Pixabay API
    const response = await fetch(
      `${PIXABAY_API_URL}?key=${apiKey}&q=${encodeURIComponent(normalizedWord)}&image_type=photo&per_page=4&safesearch=true`,
      {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!response.ok) {
      throw new Error(`Pixabay API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.hits || data.hits.length === 0) {
      return Response.json({
        success: false,
        error: "Không tìm thấy hình ảnh cho từ này",
      })
    }

    const images: PixabayImage[] = data.hits.map((hit: any) => ({
      id: hit.id,
      webformatURL: hit.webformatURL,
      previewURL: hit.previewURL,
      largeImageURL: hit.largeImageURL,
      tags: hit.tags,
      user: hit.user,
      userImageURL: hit.userImageURL,
    }))

    const result: PixabayResponse = {
      success: true,
      images,
    }

    // Cache kết quả
    cache.set(normalizedWord, { result, timestamp: Date.now() })

    // Dọn cache cũ (giữ tối đa 100 từ)
    if (cache.size > 100) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 50).forEach(([key]) => cache.delete(key))
    }

    return Response.json(result)
  } catch (error) {
    console.error("Pixabay API error:", error)
    return Response.json(
      { success: false, error: "Không thể tải hình ảnh. Vui lòng thử lại." },
      { status: 500 }
    )
  }
}
