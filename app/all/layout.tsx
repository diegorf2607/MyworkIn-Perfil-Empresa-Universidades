"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AllLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isPerformancePage = pathname?.includes("/ventas") || pathname?.includes("/actividad")

  return (
    <SidebarProvider>
      <AppSidebar countryCode="ALL" />
      <SidebarInset>
        <Topbar countryCode="ALL" hideFilters={isPerformancePage} hideSearch={isPerformancePage} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
