import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminClient = createAdminClient();
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Get team members
    const { data: teamMembers, error: teamError } = await adminClient
      .from("team_members")
      .select("*");
    
    // Get current user's team member record
    let currentMember = null;
    if (user) {
      const { data } = await adminClient
        .from("team_members")
        .select("*")
        .eq("user_id", user.id)
        .single();
      currentMember = data;
    }
    
    return NextResponse.json({
      currentUser: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message,
      currentMember,
      teamMembers: {
        count: teamMembers?.length || 0,
        data: teamMembers
      },
      teamError: teamError?.message
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
