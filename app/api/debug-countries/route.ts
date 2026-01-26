import { NextResponse } from "next/server"
import { getCountries } from "@/lib/actions/countries"
import { getAccounts } from "@/lib/actions/accounts"
import { getOpportunities } from "@/lib/actions/opportunities"
import { getMeetings } from "@/lib/actions/meetings"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startTime = Date.now()
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    cacheControl: 'force-dynamic, revalidate=0',
  }

  try {
    // Test getCountries
    const countriesStart = Date.now()
    const countries = await getCountries()
    results.countries = {
      success: true,
      count: countries?.length || 0,
      data: countries,
      timeMs: Date.now() - countriesStart
    }
  } catch (error: any) {
    results.countries = {
      success: false,
      error: error.message
    }
  }

  try {
    // Test getAccounts
    const accountsStart = Date.now()
    const accounts = await getAccounts()
    results.accounts = {
      success: true,
      count: accounts?.length || 0,
      timeMs: Date.now() - accountsStart
    }
  } catch (error: any) {
    results.accounts = {
      success: false,
      error: error.message
    }
  }

  try {
    // Test getOpportunities
    const oppsStart = Date.now()
    const opps = await getOpportunities()
    results.opportunities = {
      success: true,
      count: opps?.length || 0,
      timeMs: Date.now() - oppsStart
    }
  } catch (error: any) {
    results.opportunities = {
      success: false,
      error: error.message
    }
  }

  try {
    // Test getMeetings
    const meetingsStart = Date.now()
    const meetings = await getMeetings()
    results.meetings = {
      success: true,
      count: meetings?.length || 0,
      timeMs: Date.now() - meetingsStart
    }
  } catch (error: any) {
    results.meetings = {
      success: false,
      error: error.message
    }
  }

  results.totalTimeMs = Date.now() - startTime

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  })
}
