"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Globe, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getActiveCountries } from "@/lib/actions/countries"

interface Country {
  code: string
  name: string
  active: boolean
}

interface TopbarProps {
  countryCode: string
}

export function Topbar({ countryCode }: TopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<"14d" | "30d">("14d")
  const [countries, setCountries] = useState<Country[]>([])

  const isGlobal = countryCode === "ALL"

  const loadData = useCallback(async () => {
    try {
      const countriesData = await getActiveCountries()
      setCountries(countriesData || [])
    } catch (error) {
      console.error("Error loading topbar data:", error)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const currentCountry = countries.find((c) => c.code === countryCode)

  const handleCountryChange = (code: string) => {
    if (code === "ALL") {
      router.push("/all/overview")
    } else {
      router.push(`/c/${code}/scorecards`)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar universidades, contactos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Date Range Selector */}
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as "14d" | "30d")}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="14d">14 días</SelectItem>
            <SelectItem value="30d">30 días</SelectItem>
          </SelectContent>
        </Select>

        {/* Country Selector with "Todos" option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Globe className="h-4 w-4" />
              {isGlobal ? "Todos" : currentCountry?.name || "País"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Cambiar país</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleCountryChange("ALL")} className={isGlobal ? "bg-accent" : ""}>
              <Globe className="mr-2 h-4 w-4" />
              Todos (Global)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {countries.map((country) => (
              <DropdownMenuItem
                key={country.code}
                onClick={() => handleCountryChange(country.code)}
                className={country.code === countryCode ? "bg-accent" : ""}
              >
                {country.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
