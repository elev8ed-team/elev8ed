"use client"

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'auth_code_error'
      ? 'Google OAuth is currently not configured or whitelist is pending in Supabase. You can click "Continue as Demo Admin" below to preview everything immediately!'
      : null
  )

  // Standard Credentials Login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      setIsLoading(false)
    }
  }

  // Instant Demo Bypass Login
  const handleDemoLogin = (targetPath: string = '/dashboard') => {
    document.cookie = 'elev8ed_demo_mode=true; path=/; max-age=86400'
    window.location.href = targetPath
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials or use the instant preview bypass to explore the platform
        </p>
      </div>

      {/* One-Click Instant Demo Login Banner */}
      <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400">
            Preview Mode
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-400/20 text-lime-300">
            No Login Needed
          </span>
        </div>
        <p className="text-xs text-neutral-300">
          Skip credentials and immediately inspect the full operational dashboard and committee workspace.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin('/dashboard')}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-lime-400 px-3 py-2 text-xs font-bold text-black shadow transition-transform hover:scale-[1.02] hover:bg-lime-300 cursor-pointer"
          >
            <span>⚡ Enter Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('/workspace/acm-core/overview')}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow transition-colors hover:bg-neutral-800 cursor-pointer"
          >
            <span>🏢 Committee Workspace</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {errorMessage}
        </div>
      )}

      {/* Main Credentials Form */}
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
          <input
            type="email"
            placeholder="name@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? 'Processing Access...' : 'Sign In with Email'}
        </button>
      </form>

      {/* Horizontal Visual Separator */}
      <div className="relative flex items-center justify-center my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <span className="relative bg-background px-2 text-xs uppercase text-muted-foreground tracking-wider font-semibold">
          Or continue with
        </span>
      </div>

      {/* OAuth Integration Actions */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
      >
        <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Sign In with Google
      </button>

      {/* Bottom Navigation Link */}
      <div className="text-center lg:text-left">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs font-mono text-muted-foreground">Loading login form...</div>}>
      <LoginForm />
    </Suspense>
  )
}