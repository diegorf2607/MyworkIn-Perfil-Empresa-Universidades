"use client"

import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"

interface CountryLayoutClientProps {
  children: React.ReactNode
  countryCode: string
}

export function CountryLayoutClient({ children, countryCode }: CountryLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar countryCode={countryCode} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar countryCode={countryCode} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
