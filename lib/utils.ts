import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lấy base URL tùy theo môi trường
 * - Client-side: trả về "" (relative URL)
 * - Server-side production: dùng NEXT_PUBLIC_APP_URL hoặc VERCEL_URL
 * - Server-side development: dùng localhost:3000
 */
export function getBaseUrl() {
  // Client-side: dùng relative URL
  if (typeof window !== "undefined") {
    return ""
  }

  // Server-side: cần full URL
  // Vercel deployment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Custom domain (set trong .env.production)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Development fallback
  return "http://localhost:3000"
}
