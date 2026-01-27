import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || 'PE';
  
  try {
    const supabase = createAdminClient();
    
    // Get all accounts
    const { data: allAccounts, error: allError } = await supabase
      .from("accounts")
      .select("id, name, country_code, stage")
      .limit(10);
    
    // Get accounts for specific country
    const { data: countryAccounts, error: countryError } = await supabase
      .from("accounts")
      .select("id, name, country_code, stage")
      .eq("country_code", country.toUpperCase())
      .limit(10);
    
    // Get distinct country codes
    const { data: distinctCountries, error: distinctError } = await supabase
      .from("accounts")
      .select("country_code")
      .limit(100);
    
    const uniqueCountries = [...new Set(distinctCountries?.map(a => a.country_code) || [])];
    
    return NextResponse.json({
      requestedCountry: country.toUpperCase(),
      allAccountsCount: allAccounts?.length || 0,
      allAccountsSample: allAccounts?.slice(0, 5),
      allAccountsError: allError?.message,
      countryAccountsCount: countryAccounts?.length || 0,
      countryAccountsSample: countryAccounts?.slice(0, 5),
      countryAccountsError: countryError?.message,
      uniqueCountryCodes: uniqueCountries,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
