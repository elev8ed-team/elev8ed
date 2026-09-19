"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { store } from "@/lib/store"
import { Invitation } from "@/lib/types"

export default function OnboardingSelectorPage() {
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState("")
  const [validatedInvite, setValidatedInvite] = useState<Invitation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleValidateToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!tokenInput.trim()) {
      setError("Please input an invitation token.")
      return
    }

    const invite = store.validateInvitationToken(tokenInput.trim())
    if (!invite) {
      setError("Invalid or expired invitation token. Check with your committee lead.")
      setValidatedInvite(null)
      return
    }

    setValidatedInvite(invite)
  }

  const handleAcceptInvite = () => {
    if (!validatedInvite) return
    const committee = store.acceptInvitation(validatedInvite.token)
    if (committee) {
      setSuccess(`Accepted invitation! Redirecting to ${committee.name}...`)
      setTimeout(() => {
        router.push(`/workspace/${committee.id}/overview`)
      }, 800)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex overflow-hidden selection:bg-white/20">
      
      {/* 1. STRUCTURAL ONBOARDING SIDEBAR */}
      <aside className="w-16 md:w-64 bg-neutral-950 border-r border-neutral-850 flex flex-col justify-between items-center md:items-stretch py-6 px-4 shrink-0 transition-all duration-300">
        <div className="space-y-8 w-full">
          {/* Logo Identity Slot */}
          <Link href="/" className="flex items-center gap-3 px-2 justify-center md:justify-start">
            <div className="h-2.5 w-2.5 rounded-full bg-lime-400 shrink-0 shadow-[0_0_8px_rgba(163,230,53,0.6)]" />
            <span className="hidden md:inline text-sm font-black tracking-tight">Elev8Ed</span>
          </Link>

          {/* Contextual Onboarding Tabs */}
          <nav className="space-y-2 w-full">
            <div className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white transition-all text-xs font-semibold justify-center md:justify-start">
              <span className="text-xs">🔑</span>
              <span className="hidden md:inline tracking-tight">Workspace Gateway</span>
            </div>
            <Link
              href="/onboarding/create"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/50 transition-all text-xs font-medium justify-center md:justify-start"
            >
              <span className="text-xs">⚡</span>
              <span className="hidden md:inline tracking-tight">Provision Committee</span>
            </Link>
          </nav>
        </div>

        {/* Account Session Context Footer */}
        <div className="w-full border-t border-neutral-900 pt-4 flex items-center gap-3 px-2 justify-center md:justify-start">
          <div className="h-7 w-7 rounded-full bg-neutral-800 flex items-center justify-center font-mono text-[10px] font-bold border border-neutral-700 text-neutral-200">
            N
          </div>
          <div className="hidden md:block overflow-hidden">
            <p className="text-xs font-bold tracking-tight truncate">Nevedhya</p>
            <p className="text-[9px] font-mono text-neutral-500 truncate">nevedhya@elev8ed.edu</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ONBOARDING SELECTION GATE VIEW */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full flex flex-col justify-center animate-fade-in-up">
        
        {/* Header Introduction Block */}
        <div className="space-y-2 max-w-xl pb-2">
          <span className="text-[9px] font-mono tracking-widest text-neutral-500 uppercase">Initialization Phase // 01</span>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
            Establish your operational hub.
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Deploy a clean workspace architecture for your student organization, or parse a live invitation token to join an active committee portfolio.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-xs font-medium text-lime-400 bg-lime-400/10 border border-lime-400/20 rounded-xl">
            {success}
          </div>
        )}

        {/* Action Gate Cards Grid - Structured Like Dashboard Modules */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Card Option A: Provision Clean Architecture */}
          <div className="group rounded-2xl border border-neutral-850 bg-neutral-950 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl">
            
            {/* Geometric interactive vector structure block */}
            <div className="rounded-xl border border-neutral-800 bg-black p-4 h-36 flex flex-col justify-between relative overflow-hidden transition-colors group-hover:border-neutral-700">
              <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500">
                <span>SYS_PROVISION // ROOT_NODE</span>
                <span className="text-lime-400 font-semibold">STATUS: READY</span>
              </div>
              
              <div className="flex items-center justify-center h-full">
                <svg className="h-full w-full max-w-[140px]" viewBox="0 0 160 80" fill="none">
                  <circle cx="40" cy="40" r="12" stroke="#a3e635" strokeWidth="2" fill="black" />
                  <circle cx="120" cy="40" r="12" stroke="#06b6d4" strokeWidth="2" fill="black" />
                  <path d="M52 40 L108 40" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d="M40 28 C 40 12, 120 12, 120 28" stroke="#d946ef" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>
              <span className="absolute bottom-2 right-3 text-[8px] font-mono text-neutral-600">DEPL_MATRIX</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
                <h4 className="text-xs font-bold text-white tracking-tight">Deploy New Workspace</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Register a clean container instance for a new student chapter. Initialize administrative roles, security thresholds, and construct custom operational pipelines.
              </p>
            </div>

            <Link
              href="/onboarding/create"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-white px-4 text-xs font-semibold text-black transition-all hover:bg-neutral-200"
            >
              Create New Workspace
            </Link>
          </div>

          {/* Card Option B: Sync Roster via Verification Token */}
          <div className="group rounded-2xl border border-neutral-850 bg-neutral-950 p-6 flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl">
            
            {/* Structured geometric token verification stream visual block */}
            <div className="rounded-xl border border-neutral-800 bg-black p-4 h-36 flex flex-col justify-between relative overflow-hidden transition-colors group-hover:border-neutral-700">
              <div className="flex items-center justify-between text-[8px] font-mono text-neutral-500">
                <span>INGEST_STREAM // ACCESS_KEY</span>
                <span className="text-magenta-400" style={{ color: '#d946ef' }}>STATUS: LISTENING</span>
              </div>
              
              <div className="flex items-center justify-center h-full">
                <svg className="h-full w-full max-w-[140px]" viewBox="0 0 160 80" fill="none">
                  <circle cx="80" cy="40" r="22" stroke="#d946ef" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                  <circle cx="80" cy="40" r="14" stroke="#d946ef" strokeWidth="2" fill="black" />
                  <path d="M20 40 L58 40" stroke="#404040" strokeWidth="1.5" />
                  <path d="M102 40 L140 40" stroke="#404040" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="absolute bottom-2 right-3 text-[8px] font-mono text-neutral-600">TOKEN_RESOLVER</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#d946ef' }} />
                <h4 className="text-xs font-bold text-white tracking-tight">Enter Invitation Token</h4>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Input a validation code generated by your organization&apos;s core head to sync instantly with pre-assigned departments, tasks, and file storage environments.
              </p>
            </div>

            <div className="space-y-3">
              <form onSubmit={handleValidateToken} className="relative w-full">
                <input 
                  type="text" 
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. E8-ACM-2026 or E8-CULT-2026" 
                  className="h-9 w-full rounded-lg border border-neutral-800 bg-black px-3 text-xs text-white placeholder-neutral-600 outline-none focus:border-neutral-600 transition-colors pr-20 uppercase font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 rounded-md bg-white text-[10px] font-bold text-black hover:bg-neutral-200 transition-all"
                >
                  Validate
                </button>
              </form>

              {/* Sample Quick Fill Buttons */}
              <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                <span>Demo Tokens:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("E8-ACM-2026")
                    const inv = store.validateInvitationToken("E8-ACM-2026")
                    setValidatedInvite(inv || null)
                  }}
                  className="underline hover:text-white transition-colors"
                >
                  E8-ACM-2026
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setTokenInput("E8-CULT-2026")
                    const inv = store.validateInvitationToken("E8-CULT-2026")
                    setValidatedInvite(inv || null)
                  }}
                  className="underline hover:text-white transition-colors"
                >
                  E8-CULT-2026
                </button>
              </div>

              {/* Verified Invite Card */}
              {validatedInvite && (
                <div className="rounded-xl border border-neutral-800 bg-black p-3 space-y-2 animate-fade-in-up">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{validatedInvite.committeeName}</p>
                      <p className="text-[10px] text-neutral-400">
                        {validatedInvite.departmentName ? `${validatedInvite.departmentName} Dept · ` : ""}
                        Role: <span className="capitalize text-lime-400 font-semibold">{validatedInvite.role}</span>
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-lime-400/10 px-2 py-0.5 text-[9px] font-semibold text-lime-400 border border-lime-400/20">
                      Token Valid
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptInvite}
                    className="w-full flex items-center justify-center rounded-lg bg-lime-400 py-1.5 text-xs font-bold text-black hover:bg-lime-300 transition-all"
                  >
                    Accept Invitation & Launch Workspace →
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Architecture Footer Spacers */}
        <footer className="pt-6 border-t border-neutral-900 text-[10px] text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Elev8Ed Operating Infrastructure · Campus Workspace Engine</p>
          <Link href="/dashboard" className="text-neutral-500 hover:text-neutral-300 transition-colors">
            Already have active workspaces? Go to Dashboard →
          </Link>
        </footer>
      </main>
    </div>
  )
}