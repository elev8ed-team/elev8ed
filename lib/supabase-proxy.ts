import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Validate the user directly against the Supabase auth server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Define public authentication routes
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")

  // Allow Supabase OAuth and email verification handlers to execute freely
  const isAuthCallback = pathname.startsWith("/auth")

  // Rule 1: If user is NOT logged in and tries to access internal pages (anything other than auth routes, callback, or home)
  if (!user && !isAuthRoute && !isAuthCallback && pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Rule 2: If user IS logged in and tries to visit login/signup pages, bounce them to workspace
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/workspace"
    return NextResponse.redirect(url)
  }

  // Rule 3: If user IS logged in and visits the public root landing page (/), express-route them to workspace
  if (user && pathname === "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/workspace"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
