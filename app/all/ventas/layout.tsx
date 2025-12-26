import type React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function VentasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar countryCode="ALL" />
      <SidebarInset>
        <Topbar countryCode="ALL" hideFilters={true} />
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
