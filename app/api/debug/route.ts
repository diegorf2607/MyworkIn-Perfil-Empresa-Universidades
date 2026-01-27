import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Test 1: Get all accounts directly
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("id, name, country_code, stage")
      .limit(5);
    
    // Test 2: Get all countries directly
    const { data: countries, error: countriesError } = await supabase
      .from("countries")
      .select("*");
    
    // Test 3: Get accounts for PE specifically
    const { data: peAccounts, error: peError } = await supabase
      .from("accounts")
      .select("id, name, country_code, stage")
      .eq("country_code", "PE")
      .limit(5);
    
    return NextResponse.json({
      accounts: {
        count: accounts?.length || 0,
        sample: accounts,
        error: accountsError?.message
      },
      countries: {
        count: countries?.length || 0,
        data: countries,
        error: countriesError?.message
      },
      peAccounts: {
        count: peAccounts?.length || 0,
        sample: peAccounts,
        error: peError?.message
      },
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
