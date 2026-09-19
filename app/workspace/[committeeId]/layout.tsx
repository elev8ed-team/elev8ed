"use client"

import React, { useState, useEffect, use } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { store, useStoreState } from "@/lib/store"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/permissions"
import {
  LayoutDashboard,
  Users,
  Building2,
  CheckSquare,
  Calendar,
  Megaphone,
  History,
  Settings,
  ChevronDown,
  Plus,
  Copy,
  Check,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react"

export default function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId
  const pathname = usePathname()
  const router = useRouter()

  const state = useStoreState()
  const committee = state.committees.find((c) => c.id === committeeId)
  const allCommittees = store.getUserCommittees()
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )
  const currentUser = state.currentUser

  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  useEffect(() => {
    if (!committee && allCommittees.length > 0) {
      router.replace(`/workspace/${allCommittees[0].id}/overview`)
    }
  }, [committee, allCommittees, router])

  const copyInviteToken = () => {
    const invites = store.getInvitations(committeeId)
    const token = invites[0]?.token || "E8-ACCESS-TOKEN"
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const navItems = [
    { label: "Overview", href: `/workspace/${committeeId}/overview`, icon: LayoutDashboard },
    { label: "Members", href: `/workspace/${committeeId}/members`, icon: Users },
    { label: "Departments", href: `/workspace/${committeeId}/departments`, icon: Building2 },
    { label: "Tasks", href: `/workspace/${committeeId}/tasks`, icon: CheckSquare },
    { label: "Events", href: `/workspace/${committeeId}/events`, icon: Calendar },
    { label: "Announcements", href: `/workspace/${committeeId}/announcements`, icon: Megaphone },
    { label: "Activity Log", href: `/workspace/${committeeId}/activity`, icon: History },
    { label: "Settings", href: `/workspace/${committeeId}/settings`, icon: Settings },
  ]

  if (!committee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-lime-400" />
          <p className="text-xs font-mono text-neutral-400">Loading workspace context...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white overflow-hidden selection:bg-lime-400/20 selection:text-lime-300">
      
      {/* SIDEBAR (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-850 bg-neutral-950 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          
          {/* 1. Header & Brand */}
          <div className="p-4 border-b border-neutral-850 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
              <span className="text-sm font-black tracking-tight text-white">Elev8Ed</span>
              <span className="text-[9px] font-mono uppercase bg-neutral-900 text-lime-400 px-1.5 py-0.5 rounded border border-neutral-800">
                SaaS
              </span>
            </Link>

            <button
              onClick={() => setMobileNavOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 2. Committee Switcher */}
          <div className="p-3 border-b border-neutral-850 relative">
            <button
              type="button"
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="w-full flex items-center justify-between rounded-xl bg-neutral-900/70 p-2.5 text-left border border-neutral-800 hover:border-neutral-700 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 font-bold text-xs text-white border border-neutral-700">
                  {committee.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white group-hover:text-lime-400 transition-colors">
                    {committee.name}
                  </p>
                  <p className="truncate text-[10px] text-neutral-400 font-mono">
                    {committee.college}
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${switcherOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Switcher Dropdown */}
            {switcherOpen && (
              <div className="absolute left-3 right-3 top-full mt-1.5 z-50 rounded-xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl backdrop-blur-xl animate-fade-in-up">
                <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                  Your Committees
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto pt-1">
                  {allCommittees.map((comm) => (
                    <button
                      key={comm.id}
                      onClick={() => {
                        setSwitcherOpen(false)
                        router.push(`/workspace/${comm.id}/overview`)
                      }}
                      className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                        comm.id === committeeId
                          ? "bg-lime-400/10 text-lime-400 font-bold border border-lime-400/20"
                          : "text-neutral-300 hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-neutral-800 text-[9px] font-bold">
                        {comm.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="truncate flex-1">{comm.name}</span>
                      {comm.id === committeeId && <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />}
                    </button>
                  ))}
                </div>

                <div className="border-t border-neutral-900 mt-2 pt-2">
                  <Link
                    href="/onboarding"
                    onClick={() => setSwitcherOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create or Join Committee...</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 3. Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              Workspace
            </div>

            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white font-semibold border border-neutral-800 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-lime-400" : "text-neutral-500"}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* 4. Current User Session Profile */}
          <div className="p-3 border-t border-neutral-850">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-2.5 flex items-center justify-between">
              <Link href="/profile" className="flex items-center gap-2.5 min-w-0 group">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-200 border border-neutral-700 group-hover:border-lime-400 transition-colors">
                  {currentUser.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white group-hover:text-lime-400 transition-colors">
                    {currentUser.fullName}
                  </p>
                  <p className="truncate text-[10px] text-neutral-400">
                    {currentMembership ? getRoleLabel(currentMembership.role) : "Member"}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  href="/profile"
                  title="Your Profile"
                  className="rounded p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <User className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => router.push("/login")}
                  title="Sign Out"
                  className="rounded p-1 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Operational Bar */}
        <header className="h-14 border-b border-neutral-850 bg-neutral-950/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden text-neutral-400 hover:text-white p-1"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-400">
              <span className="text-white font-bold">{committee.name}</span>
              <span>/</span>
              <span className="text-neutral-300 capitalize">
                {pathname.split("/").pop() || "Overview"}
              </span>
            </div>
          </div>

          {/* Top Actions: Invite Token & Quick Action */}
          <div className="flex items-center gap-3">
            {/* Quick Invite Token Pill */}
            <button
              onClick={copyInviteToken}
              title="Copy Committee Invite Code"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:border-neutral-700 hover:text-white transition-all"
            >
              {copiedToken ? (
                <>
                  <Check className="h-3.5 w-3.5 text-lime-400" />
                  <span className="text-lime-400 font-bold">Code Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-neutral-500" />
                  <span>Invite Token: <strong className="text-white font-bold">{store.getInvitations(committeeId)[0]?.token || "E8-ACM-2026"}</strong></span>
                </>
              )}
            </button>

            {/* Role Badge in Header */}
            {currentMembership && (
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${getRoleBadgeClass(currentMembership.role)}`}>
                {currentMembership.title || getRoleLabel(currentMembership.role)}
              </span>
            )}
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-black">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}
