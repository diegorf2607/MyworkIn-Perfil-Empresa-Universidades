import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - require authentication
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/c/") ||
    request.nextUrl.pathname.startsWith("/all/") ||
    request.nextUrl.pathname.startsWith("/admin/") ||
    request.nextUrl.pathname.startsWith("/countries")

  const isTeamRoute = request.nextUrl.pathname.startsWith("/all/team")

  if (isTeamRoute && user) {
    // Check if user is admin
    const supabaseForQuery = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      },
    )

    const { data: member } = await supabaseForQuery
      .from("team_members")
      .select("role, is_active")
      .eq("user_id", user.id)
      .single()

    if (!member || member.role !== "admin" || !member.is_active) {
      // Redirect non-admin users away from team page
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/all/overview"
      return NextResponse.redirect(redirectUrl)
    }
  }

  if (isProtectedRoute && !user) {
    // Redirect to login if not authenticated
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/"
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
