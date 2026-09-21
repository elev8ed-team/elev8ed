"use client"

import React, { useState, useMemo } from 'react'
import { Crown, Users, Check, Search, X } from 'lucide-react'

export interface Member {
  id: string
  full_name: string
  role?: string
  department_id?: string | null
}

export interface Department {
  id: string
  name: string
}

// 6 Exact Hex Palettes aligned with app/dashboard/page.tsx
const DEPARTMENT_PALETTES = [
  { name: 'Red',   bg: '#201314', side: '#FF9592', heading: '#611623', text: '#FFD1D9' },
  { name: 'Cyan',  bg: '#101B20', side: '#4CCCE6', heading: '#004558', text: '#B6ECF7' },
  { name: 'Jade',  bg: '#121C18', side: '#1FD8A4', heading: '#114837', text: '#ADF0D4' },
  { name: 'Plum',  bg: '#201320', side: '#E796F3', heading: '#512454', text: '#F4D4F4' },
  { name: 'Amber', bg: '#1D180F', side: '#FFCA16', heading: '#4D3000', text: '#FFE7B3' },
  { name: 'Lime',  bg: '#151A10', side: '#BDE56C', heading: '#334423', text: '#E3F7BA' },
]

function getDeptPalette(deptId: string | null | undefined, departments: Department[]) {
  if (!deptId) return DEPARTMENT_PALETTES[0]
  const idx = departments.findIndex((d) => d.id === deptId)
  return DEPARTMENT_PALETTES[(idx >= 0 ? idx : 0) % DEPARTMENT_PALETTES.length]
}

interface MemberOrgPickerProps {
  members: Member[]
  departments: Department[]
  selectedMemberId: string | null
  onSelectMember: (memberId: string | null) => void
  allowUnassigned?: boolean
  className?: string
}

export function MemberOrgPicker({
  members,
  departments,
  selectedMemberId,
  onSelectMember,
  allowUnassigned = true,
  className = '',
}: MemberOrgPickerProps) {
  const [search, setSearch] = useState('')

  // Filter members by search query
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        m.full_name.toLowerCase().includes(q) ||
        (m.role && m.role.toLowerCase().includes(q))
    )
  }, [members, search])

  // Group members hierarchically
  const superCoreMembers = useMemo(() => {
    return filteredMembers.filter(
      (m) => m.role === 'super_core' || (!m.department_id && m.role !== 'executive')
    )
  }, [filteredMembers])

  const deptGroups = useMemo(() => {
    return departments.map((dept) => {
      const deptMembers = filteredMembers.filter(
        (m) => m.department_id === dept.id && m.role !== 'super_core'
      )
      // Sort so Department Heads appear first
      deptMembers.sort((a, b) => {
        if (a.role === 'department_head' && b.role !== 'department_head') return -1
        if (b.role === 'department_head' && a.role !== 'department_head') return 1
        return a.full_name.localeCompare(b.full_name)
      })
      return {
        dept,
        members: deptMembers,
      }
    })
  }, [departments, filteredMembers])

  const otherMembers = useMemo(() => {
    return filteredMembers.filter(
      (m) =>
        !m.department_id &&
        m.role !== 'super_core' &&
        !superCoreMembers.some((sc) => sc.id === m.id)
    )
  }, [filteredMembers, superCoreMembers])

  return (
    <div className={`space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Search member or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 pl-8 pr-8 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Unassigned Quick Selection */}
      {allowUnassigned && (
        <button
          type="button"
          onClick={() => onSelectMember(null)}
          className={`flex items-center justify-between w-full p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
            selectedMemberId === null
              ? 'border-zinc-400 bg-zinc-800 text-white font-semibold'
              : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400">
              ∅
            </div>
            <span>Unassigned (General Pool)</span>
          </div>
          {selectedMemberId === null && <Check className="h-3.5 w-3.5 text-zinc-200" />}
        </button>
      )}

      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
        {/* LEVEL 1: Super Core Leadership */}
        {superCoreMembers.length > 0 && (
          <div className="space-y-2 rounded-xl border border-amber-500/20 bg-amber-950/10 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Super Core Leadership
                </span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800/50 text-amber-300">
                Top Tier
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {superCoreMembers.map((member) => {
                const isSelected = selectedMemberId === member.id
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelectMember(member.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-900/30 text-white shadow-sm ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate leading-tight">
                          {member.full_name}
                        </div>
                        <div className="text-[9px] font-mono text-amber-400/80 uppercase">
                          {member.role ? member.role.replace(/_/g, ' ') : 'Leader'}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* LEVEL 2 & 3: Department Groups with Department Heads & Executives */}
        {deptGroups.map(({ dept, members: deptMembers }) => {
          const theme = getDeptPalette(dept.id, departments)

          return (
            <div
              key={dept.id}
              style={{ borderLeftColor: theme.side }}
              className="space-y-2 rounded-xl border border-zinc-800/80 border-l-[3px] bg-zinc-900/30 p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span
                    style={{ backgroundColor: theme.side }}
                    className="h-1.5 w-1.5 rounded-full shadow-sm"
                  />
                  <span
                    style={{
                      backgroundColor: theme.heading,
                      color: theme.side,
                      borderColor: theme.side + '40',
                    }}
                    className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  >
                    {dept.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {deptMembers.length} {deptMembers.length === 1 ? 'member' : 'members'}
                </span>
              </div>

              {deptMembers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {deptMembers.map((member) => {
                    const isSelected = selectedMemberId === member.id
                    const isDeptHead = member.role === 'department_head'

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => onSelectMember(member.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-white bg-zinc-800 text-white shadow-sm ring-1 ring-zinc-400'
                            : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <div
                            style={{
                              backgroundColor: theme.heading,
                              borderColor: theme.side + '40',
                              color: theme.side,
                            }}
                            className="h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                          >
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <div className="text-xs font-medium truncate leading-tight">
                              {member.full_name}
                            </div>
                            <div className="text-[9px] font-mono text-zinc-500 uppercase">
                              {isDeptHead ? 'Head of Dept' : member.role?.replace(/_/g, ' ') || 'Executive'}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-[11px] font-mono text-zinc-600 py-1 italic">
                  No members currently registered in this department.
                </div>
              )}
            </div>
          )
        })}

        {/* Other / Unassigned Department Members */}
        {otherMembers.length > 0 && (
          <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/20 p-3">
            <div className="flex items-center space-x-1.5 text-zinc-400">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                General Members
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {otherMembers.map((member) => {
                const isSelected = selectedMemberId === member.id
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onSelectMember(member.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white bg-zinc-800 text-white ring-1 ring-zinc-400'
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <div className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 shrink-0">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{member.full_name}</div>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">
                          {member.role?.replace(/_/g, ' ') || 'Member'}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 ml-1" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {filteredMembers.length === 0 && (
          <div className="text-center py-6 text-xs font-mono text-zinc-500">
            No matching members found for &ldquo;{search}&rdquo;
          </div>
        )}
      </div>
    </div>
  )
}

