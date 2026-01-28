import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const results: Record<string, any> = {}
  
  try {
    const supabase = createAdminClient()
    
    // Test 1: Countries
    try {
      const { data, error } = await supabase.from("countries").select("code, name, active")
      results.countries = error ? { error: error.message } : { success: true, count: data?.length, data }
    } catch (e: any) {
      results.countries = { error: e.message }
    }
    
    // Test 2: Accounts
    try {
      const { data, error } = await supabase.from("accounts").select("id, name, stage, country_code").limit(5)
      results.accounts = error ? { error: error.message } : { success: true, count: data?.length }
    } catch (e: any) {
      results.accounts = { error: e.message }
    }
    
    // Test 3: Opportunities
    try {
      const { data, error } = await supabase.from("opportunities").select("id, stage, mrr").limit(5)
      results.opportunities = error ? { error: error.message } : { success: true, count: data?.length }
    } catch (e: any) {
      results.opportunities = { error: e.message }
    }
    
    // Test 4: Meetings
    try {
      const { data, error } = await supabase.from("meetings").select("id, date, type").limit(5)
      results.meetings = error ? { error: error.message } : { success: true, count: data?.length }
    } catch (e: any) {
      results.meetings = { error: e.message }
    }
    
    // Test 5: Team members
    try {
      const { data, error } = await supabase.from("team_members").select("id, name, role, sales_role")
      results.team_members = error ? { error: error.message } : { success: true, count: data?.length, data }
    } catch (e: any) {
      results.team_members = { error: e.message }
    }
    
    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
