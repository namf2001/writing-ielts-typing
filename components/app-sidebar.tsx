"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, History, BookMarked, Languages, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SettingsDialog } from "@/components/settings-dialog"

const NAV_ITEMS = [
  { href: "/", label: "Luyện gõ bài mẫu", icon: Home },
  { href: "/?tab=translation", label: "Luyện dịch Việt - Anh", icon: Languages },
  { href: "/vocabulary", label: "Kho từ vựng & Flashcards", icon: BookMarked },
  { href: "/history", label: "Lịch sử & Đánh giá AI", icon: History },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/?tab=translation") {
      return pathname === "/" && typeof window !== "undefined" && window.location.search.includes("tab=translation")
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <TooltipProvider>
        <aside
          className="hidden md:flex w-16 border-r-[3px] border-[#141414] dark:border-[#384259] flex-col items-center py-5 gap-3 bg-[#FAF7F0] dark:bg-[#11141B] z-30"
          role="navigation"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`relative p-2.5 rounded-xl border-2 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                      active
                        ? "bg-[#FFC93C] text-[#141414] border-[#141414] shadow-[3px_3px_0_#141414] font-black -translate-x-0.5"
                        : "border-transparent text-muted-foreground hover:border-[#141414] hover:bg-white hover:text-[#141414] hover:shadow-[2px_2px_0_#141414] dark:hover:bg-[#181C26] dark:hover:border-[#384259]"
                    }`}
                  >
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold border-2 border-[#141414] shadow-[2px_2px_0_#141414] bg-white text-[#141414]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}

          <div className="flex-1" />

          {/* Settings Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="p-2.5 rounded-xl border-2 border-[#141414] bg-white dark:bg-[#181C26] dark:border-[#384259] text-muted-foreground hover:text-[#141414] hover:bg-[#FFC93C] hover:border-[#141414] shadow-[2px_2px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
                aria-label="Cài đặt hệ thống"
              >
                <Settings className="w-5 h-5 stroke-[2.2]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold border-2 border-[#141414] shadow-[2px_2px_0_#141414] bg-white text-[#141414]">
              Cài đặt AI & Âm thanh
            </TooltipContent>
          </Tooltip>
        </aside>
      </TooltipProvider>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}
