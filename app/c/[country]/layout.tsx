import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CountryLayoutClient } from "@/components/layout/country-layout-client"

interface CountryLayoutProps {
  children: React.ReactNode
  params: Promise<{ country: string }> // params is now a Promise in Next.js 16
}

export default async function CountryLayout({ children, params }: CountryLayoutProps) {
  const { country } = await params
  const supabase = await createClient()

  const { data: countryData, error } = await supabase
    .from("countries")
    .select("code, name, active")
    .eq("code", country.toUpperCase())
    .single()

  // If country doesn't exist or is not active, redirect to countries page
  if (error || !countryData || !countryData.active) {
    redirect("/countries")
  }

  return <CountryLayoutClient countryCode={countryData.code}>{children}</CountryLayoutClient>
}
