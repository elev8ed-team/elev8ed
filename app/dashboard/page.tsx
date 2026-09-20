"use client"

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface WorkspaceDetails {
  id: string
  name: string
  slug: string
}

interface Department {
  id: string
  name: string
}

// 1. Your Exact 6 Hex Palettes (Configured for immediate Dark Mode elegance!)
const DEPARTMENT_PALETTES = [
  { name: 'Red',   bg: '#201314', side: '#FF9592', heading: '#611623', text: '#FFD1D9' },
  { name: 'Cyan',  bg: '#101B20', side: '#4CCCE6', heading: '#004558', text: '#B6ECF7' },
  { name: 'Jade',  bg: '#121C18', side: '#1FD8A4', heading: '#114837', text: '#ADF0D4' },
  { name: 'Plum',  bg: '#201320', side: '#E796F3', heading: '#512454', text: '#F4D4F4' },
  { name: 'Amber', bg: '#1D180F', side: '#FFCA16', heading: '#4D3000', text: '#FFE7B3' },
  { name: 'Lime',  bg: '#151A10', side: '#BDE56C', heading: '#334423', text: '#E3F7BA' },
]

function FigmaDashboardContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('ws')
  
  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorkspaceAndDepts() {
      if (!slug) return

      // Fetch Workspace
      const { data: wsData } = await supabase
        .from('workspaces')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

      if (wsData) {
        setWorkspace(wsData)

        // Fetch Real Database Departments!
        const { data: deptsData } = await supabase
          .from('departments')
          .select('id, name')
          .eq('workspace_id', wsData.id)
          .order('created_at', { ascending: true })

        if (deptsData && deptsData.length > 0) {
          setDepartments(deptsData)
        } else {
          // Fallback if older test workspace had no departments
          setDepartments([
            { id: '1', name: 'Creative & Design' },
            { id: '2', name: 'Technical & Web' },
            { id: '3', name: 'PR & Sponsorships' },
            { id: '4', name: 'Logistics & Ops' },
          ])
        }
      }
      setLoading(false)
    }
    loadWorkspaceAndDepts()
  }, [slug])

  if (loading) {
    return <div className="p-10 text-sm font-mono text-zinc-500">Loading operational command center...</div>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              2026-2027 Cycle
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-2">
            {workspace?.name || 'Workspace Dashboard'}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
            + Invite Member
          </button>
          <button className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow">
            New Task
          </button>
        </div>
      </div>

      {/* TOP ROW: Figma Mockup 2-Column Grid (Action List + Wave Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Priority Action Feed (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">Priority Action Feed</h2>
            <span className="text-[11px] font-mono text-zinc-500">Live Sync</span>
          </div>
          
          <div className="space-y-3.5">
            {[
              { title: 'Finalize auditorium bookings for annual fest', dept: 'Logistics', status: 'Urgent' },
              { title: 'Review sponsorship deck with Vice President', dept: 'PR & Sponsor', status: 'Review' },
              { title: 'Deploy CertiSwift template for workshop attendees', dept: 'Technical', status: 'In Progress' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <div className="flex items-center space-x-3 pr-4">
                  <div className="h-2 w-2 rounded-full bg-zinc-400 shrink-0" />
                  <span className="text-sm font-medium text-zinc-200 truncate">{item.title}</span>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 shrink-0">
                  {item.dept}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <a href="#kanban" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              View All Tasks →
            </a>
          </div>
        </div>

        {/* Right Card: Activity Pulse Wave Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">Operational Pulse</h2>
            <span className="text-xs font-mono text-zinc-400">+24% velocity</span>
          </div>

          {/* Glowing Wave Chart */}
          <div className="my-8 relative h-36 w-full flex items-end justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 80 Q 50 20, 100 60 T 200 40 T 300 10 L 300 100 L 0 100 Z" fill="url(#waveGrad)" />
              <path d="M 0 80 Q 50 20, 100 60 T 200 40 T 300 10" fill="none" stroke="#71717a" strokeWidth="2.5" />
              <path d="M 0 80 Q 50 20, 100 60 T 200 40 T 300 10" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-pulse" />
            </svg>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 z-10 text-xs text-zinc-500 font-mono">
            <span>WEEK 1</span>
            <span>WEEK 2</span>
            <span>WEEK 3</span>
            <span className="text-zinc-300 font-bold">CURRENT</span>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Department Matrices Grid (Exact Hexes + Modulo + Left Border Accent) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Department Matrices
          </h2>
          <span className="text-xs font-mono text-zinc-500">{departments.length} Active Teams</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, idx) => {
            // Modulo circling logic: 7th dept gets palette index 0 again!
            const theme = DEPARTMENT_PALETTES[idx % DEPARTMENT_PALETTES.length]

            return (
              <div
                key={dept.id || idx}
                style={{
                  backgroundColor: theme.bg,
                  borderLeftColor: theme.side,
                }}
                className="group relative rounded-xl border border-zinc-800/50 border-l-[5px] p-5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer flex flex-col justify-between min-h-[170px]"
              >
                <div>
                  {/* Top Row: Color Dot & Saturated Heading Background Pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      style={{ backgroundColor: theme.side }}
                      className="h-2 w-2 rounded-full shadow-sm"
                    />
                    <span
                      style={{ 
                        backgroundColor: theme.heading, 
                        color: theme.side,
                        borderColor: theme.side + '40'
                      }}
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                    >
                      Active Matrix
                    </span>
                  </div>

                  {/* Title glowing with pastel text hex */}
                  <h3
                    style={{ color: theme.text }}
                    className="text-lg font-black tracking-tight group-hover:underline decoration-2 underline-offset-4"
                  >
                    {dept.name}
                  </h3>
                  
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">
                    Manage kanban boards, recruitment streams, and operational logistics.
                  </p>
                </div>

                {/* Bottom Action Hover */}
                <div
                  style={{ color: theme.side }}
                  className="mt-6 flex items-center justify-end text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity font-mono"
                >
                  Enter Matrix <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default function DashboardOverviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm font-mono text-zinc-500">Loading Figma layout...</div>}>
      <FigmaDashboardContent />
    </Suspense>
  )
}