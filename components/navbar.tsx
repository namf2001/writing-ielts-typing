"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  Sparkles,
  History,
  BookMarked,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  Languages,
  PenLine,
} from "lucide-react"
import { useTheme } from "next-themes"
import { SettingsDialog } from "@/components/settings-dialog"

function NavbarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"

  const navItems = [
    {
      href: "/",
      label: "Luyện gõ",
      sublabel: "01",
      icon: PenLine,
      isActive: pathname === "/" && !activeTab,
    },
    {
      href: "/?tab=translation",
      label: "Luyện dịch",
      sublabel: "02",
      icon: Languages,
      isActive: (pathname === "/" && activeTab === "translation") || pathname.startsWith("/practice/translation"),
    },
    {
      href: "/vocabulary",
      label: "Kho từ vựng",
      sublabel: "03",
      icon: BookMarked,
      isActive: pathname === "/vocabulary",
    },
    {
      href: "/history",
      label: "Lịch sử & Chấm AI",
      sublabel: "04",
      icon: History,
      isActive: pathname.startsWith("/history"),
    },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[3px] border-[#141414] bg-[#FAF7F0]/95 dark:bg-[#11141B]/95 backdrop-blur-md dark:border-[#384259] transition-all">
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 max-w-7xl mx-auto w-full">
          {/* Logo & Brand (TID Neo-Brutalist Badge) */}
          <Link href="/" className="flex items-center gap-3 group select-none">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC93C] text-[#141414] border-2 border-[#141414] shadow-[3px_3px_0_#141414] group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_#141414] transition-all duration-150 dark:border-[#434D66] dark:shadow-[3px_3px_0_#000000]">
              <Sparkles className="w-5 h-5 text-[#141414] stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-[#141414] dark:text-white">
                  TypeMaster<span className="text-[#FF9F0A]">*</span>
                </span>
                <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-sm bg-[#141414] text-white dark:bg-[#FFC93C] dark:text-[#141414]">
                  IELTS
                </span>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                The IELTS Writing & Typing Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Tabs (TID Numbered Bento Pills) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#FFF2D9] dark:bg-[#181C26] p-1 rounded-2xl border-2 border-[#141414] shadow-[3px_3px_0_#141414] dark:border-[#384259] dark:shadow-[3px_3px_0_#0A0D14]">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs lg:text-sm font-bold transition-all duration-150 select-none ${
                    item.isActive
                      ? "bg-[#141414] text-white border-2 border-[#141414] shadow-[2px_2px_0_#141414] -translate-y-0.5 dark:bg-[#FFC93C] dark:text-[#141414] dark:border-[#FFC93C]"
                      : "text-foreground hover:bg-white/60 dark:hover:bg-[#232938]"
                  }`}
                >
                  <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${item.isActive ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-black/10 dark:bg-white/10"}`}>
                    {item.sublabel}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${item.isActive ? "stroke-[2.5]" : ""}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Actions: Theme Toggle & Settings */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border-2 border-[#141414] bg-white dark:bg-[#181C26] dark:border-[#384259] shadow-[2px_2px_0_#141414] dark:shadow-[2px_2px_0_#0A0D14] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              aria-label="Chuyển chế độ sáng/tối"
            >
              {mounted && (
                isDark ? (
                  <Sun className="w-4 h-4 text-[#FFC93C] stroke-[2.5]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#141414] stroke-[2.5]" />
                )
              )}
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#141414] bg-[#FFC93C] text-[#141414] font-black text-xs shadow-[3px_3px_0_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#141414] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#141414] transition-all cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">CÀI ĐẶT AI</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border-2 border-[#141414] bg-white text-[#141414] shadow-[2px_2px_0_#141414] cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#141414] bg-[#FAF7F0] dark:bg-[#11141B] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    item.isActive
                      ? "bg-[#141414] text-white border-[#141414] shadow-[2px_2px_0_#141414]"
                      : "bg-white text-foreground border-[#141414] shadow-[2px_2px_0_#141414] dark:bg-[#181C26] dark:border-[#384259]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </div>
                  <span className="font-mono text-xs opacity-60">#{item.sublabel}</span>
                </Link>
              )
            })}
          </div>
        )}
      </header>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  )
}

export function Navbar() {
  return (
    <Suspense fallback={<div className="h-14 border-b-2 border-[#141414] bg-[#FAF7F0]" />}>
      <NavbarInner />
    </Suspense>
  )
}
