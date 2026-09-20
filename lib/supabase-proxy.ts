import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Check demo mode bypass
  const hasDemoCookie = request.cookies.get("elev8ed_demo_mode")?.value === "true"
  const hasDemoParam = request.nextUrl.searchParams.get("demo") === "true"

  if (hasDemoParam) {
    supabaseResponse.cookies.set("elev8ed_demo_mode", "true", { path: "/", maxAge: 86400 })
  }

  // Allow previewing of workspace and dashboard routes without hard-blocking users
  const isPreviewRoute =
    hasDemoCookie ||
    hasDemoParam ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/workspace") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/profile")

  // Define public authentication routes
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")

  // Allow Supabase OAuth and email verification handlers to execute freely
  const isAuthCallback = pathname.startsWith("/auth")

  // Try to validate Supabase user if client is configured
  let user = null
  try {
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

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()
    user = supabaseUser
  } catch (err) {
    console.error("Supabase auth check error:", err)
  }

  // Rule 1: If user is NOT logged in and tries to access internal pages (and not in preview)
  if (!user && !isAuthRoute && !isAuthCallback && pathname !== "/" && !isPreviewRoute) {
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
