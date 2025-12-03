"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, History, BookMarked, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/vocabulary", label: "Từ vựng", icon: BookMarked },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider>
      <aside
        className="hidden md:flex w-14 lg:w-16 border-r border-border flex-col items-center py-6 gap-4 bg-card/50"
        role="navigation"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="w-5 h-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}

        <div className="flex-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="w-5 h-5" />
              <span className="sr-only">Trợ giúp</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Trợ giúp</TooltipContent>
        </Tooltip>
      </aside>
    </TooltipProvider>
  )
}
