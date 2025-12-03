"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, History, BookMarked, Home, Sun, Moon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/vocabulary", label: "Từ vựng", icon: BookMarked },
]

export function Navbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const isDark = resolvedTheme === "dark"

  // Check if current path is active (including sub-routes)
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  // Check if in practice page
  const isPracticePage = pathname.startsWith("/practice")

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
              IELTS Writing
            </span>
            <span className="text-base font-bold text-foreground tracking-wide">TypeMaster</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 h-8"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="sr-only">{isDark ? "Chế độ sáng" : "Chế độ tối"}</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-card p-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Button
                key={item.href}
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start gap-2 h-10"
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={item.href}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
