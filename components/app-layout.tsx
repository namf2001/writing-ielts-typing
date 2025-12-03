"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { AppSidebar } from "@/components/app-sidebar"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Trang practice có Navbar nhưng không có AppSidebar (có sidebar riêng)
  const isPracticePage = pathname.startsWith("/practice")
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {!isPracticePage && <AppSidebar />}
        <main className={`flex-1 flex flex-col ${isPracticePage ? 'overflow-hidden' : 'overflow-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
