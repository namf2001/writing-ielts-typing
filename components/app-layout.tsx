"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Các phiên làm bài thi/luyện tập trực tiếp:
  // - /practice/[id] (Luyện gõ bài mẫu hoặc tự viết)
  // - /practice/translation/[id] (Luyện dịch câu chi tiết)
  // Các trang này chạy ở chế độ Focus Mode (fullscreen, ẩn Navbar toàn cục để tránh trùng lặp Header & công cụ)
  // Riêng trang /practice/translation là trang danh sách (hub) nên vẫn giữ Navbar điều hướng.
  const isPracticeSession =
    pathname.startsWith("/practice/") && pathname !== "/practice/translation"
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {!isPracticeSession && <Navbar />}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className={`flex-1 flex flex-col ${isPracticeSession ? 'overflow-hidden' : 'overflow-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
