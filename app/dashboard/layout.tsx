"use client"

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Logo } from '../../components/Logo'

function IconRailContent() {
  const searchParams = useSearchParams()
  const currentSlug = searchParams.get('ws') || ''

  return (
    <aside className="w-16 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between items-center py-6 shrink-0 z-10">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-6">
        {/* Brand Icon */}
        <a href="/workspace" className="flex items-center justify-center text-white hover:text-zinc-300 transition-colors">
            <Logo className="w-10 h-10" />
        </a>

        <div className="h-px w-6 bg-zinc-800" />

        {/* Navigation Rail (Figma Style: Active tab gets solid highlight) */}
        <nav className="flex flex-col space-y-3">
          {[
            { id: 'overview', label: 'Dashboard', icon: '✦', active: true },
            { id: 'kanban', label: 'Tasks', icon: '❖', active: false },
            { id: 'recruitment', label: 'Recruitment', icon: '◈', active: false },
            { id: 'vault', label: 'Certificates', icon: '▣', active: false },
          ].map((item) => (
            <button
              key={item.id}
              title={item.label}
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg font-bold transition-all ${
                item.active 
                  ? 'bg-white text-zinc-950 shadow-md scale-105' 
                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              {item.icon}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center space-y-4">
        <a
          href="/workspace"
          title="Switch Workspace"
          className="h-9 w-9 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
        >
          WS
        </a>
        <a
          href="/auth/signout"
          title="Sign Out"
          className="h-9 w-9 rounded-lg border border-red-900/30 bg-red-950/20 flex items-center justify-center text-xs font-bold text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
        >
          ✕
        </a>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-white font-sans">
      <Suspense fallback={<aside className="w-16 border-r border-zinc-800 bg-zinc-950 animate-pulse" />}>
        <IconRailContent />
      </Suspense>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950/50 p-6 sm:p-10">
        {children}
      </main>
    </div>
  )
}