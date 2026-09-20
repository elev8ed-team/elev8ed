"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface Member {
  id: string
  name: string
  email: string
  role: 'super_core' | 'department_head' | 'member'
  department: string
  status: 'active' | 'invited'
}

interface Applicant {
  id: string
  name: string
  email: string
  departmentApplied: string
  stage: 'applied' | 'interview' | 'accepted' | 'rejected'
  appliedDate: string
  portfolioUrl?: string
}

const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Nevedhya Nair',
    email: 'president@organization.edu',
    role: 'super_core',
    department: 'Leadership & Strategy',
    status: 'active',
  },
  {
    id: 'm-2',
    name: 'Aditya Sharma',
    email: 'tech.head@organization.edu',
    role: 'department_head',
    department: 'Technical & Web',
    status: 'active',
  },
  {
    id: 'm-3',
    name: 'Simran Kaur',
    email: 'creative.head@organization.edu',
    role: 'department_head',
    department: 'Creative & Design',
    status: 'active',
  },
  {
    id: 'm-4',
    name: 'Kabir Mehta',
    email: 'pr.head@organization.edu',
    role: 'department_head',
    department: 'PR & Sponsorships',
    status: 'active',
  },
  {
    id: 'm-5',
    name: 'Tanvi Joshi',
    email: 'logistics.core@organization.edu',
    role: 'member',
    department: 'Logistics & Ops',
    status: 'active',
  },
]

const DEFAULT_APPLICANTS: Applicant[] = [
  {
    id: 'a-1',
    name: 'Aarav Patel',
    email: 'aarav.p@campus.edu',
    departmentApplied: 'Technical & Web',
    stage: 'interview',
    appliedDate: 'Sep 19',
    portfolioUrl: 'github.com/aaravp',
  },
  {
    id: 'a-2',
    name: 'Meera Rao',
    email: 'meera.r@campus.edu',
    departmentApplied: 'Creative & Design',
    stage: 'applied',
    appliedDate: 'Sep 18',
    portfolioUrl: 'behance.net/meera',
  },
  {
    id: 'a-3',
    name: 'Dhruv Singhania',
    email: 'dhruv.s@campus.edu',
    departmentApplied: 'PR & Sponsorships',
    stage: 'accepted',
    appliedDate: 'Sep 16',
  },
]

function RecruitmentContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('ws')

  const [workspaceName, setWorkspaceName] = useState('Workspace Team')
  const [activeTab, setActiveTab] = useState<'members' | 'pipeline'>('members')
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS)
  const [applicants, setApplicants] = useState<Applicant[]>(DEFAULT_APPLICANTS)
  const [copiedInvite, setCopiedInvite] = useState(false)

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteDept, setInviteDept] = useState('Technical & Web')
  const [inviteRole, setInviteRole] = useState<Member['role']>('member')

  useEffect(() => {
    async function loadWorkspace() {
      if (!slug) return
      const { data } = await supabase
        .from('workspaces')
        .select('name')
        .eq('slug', slug)
        .single()
      if (data?.name) {
        setWorkspaceName(data.name)
      }
    }
    loadWorkspace()
  }, [slug])

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/signup?token=E8-${slug || 'CORP'}-2026`
    navigator.clipboard.writeText(inviteUrl)
    setCopiedInvite(true)
    setTimeout(() => setCopiedInvite(false), 2000)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      department: inviteDept,
      status: 'invited',
    }

    setMembers([...members, newMember])
    setInviteEmail('')
    setIsInviteOpen(false)
  }

  const updateApplicantStage = (applicantId: string, newStage: Applicant['stage']) => {
    setApplicants(
      applicants.map((app) => (app.id === applicantId ? { ...app, stage: newStage } : app))
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              Personnel & Recruitment
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-2">
            {workspaceName}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={copyInviteLink}
            className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            {copiedInvite ? 'Copied Invite Link ✓' : 'Copy Invite Link'}
          </button>
          <button
            onClick={() => setIsInviteOpen(true)}
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow cursor-pointer"
          >
            + Add Member
          </button>
        </div>
      </div>

      {/* Segment Switcher */}
      <div className="flex items-center space-x-2 border-b border-zinc-800/60 pb-3">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            activeTab === 'members'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Active Team ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-zinc-800 text-white border border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Recruitment Pipeline ({applicants.length})
        </button>
      </div>

      {/* VIEW A: Active Members Table */}
      {activeTab === 'members' && (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800/80 bg-zinc-950/60 text-zinc-400 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Cycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-200">{member.name}</div>
                        <div className="text-[11px] font-mono text-zinc-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-300">
                      {member.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {member.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono ${
                          member.status === 'active'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-500 text-[11px]">
                      2026-2027
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: Recruitment Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['applied', 'interview', 'accepted'] as const).map((stage) => {
            const stageApplicants = applicants.filter((a) => a.stage === stage)
            const stageLabels: Record<string, string> = {
              applied: 'New Applications',
              interview: 'Interview Scheduled',
              accepted: 'Approved / Inducted',
            }

            return (
              <div
                key={stage}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4 min-h-[400px]"
              >
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    {stageLabels[stage]}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {stageApplicants.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-4 space-y-3 shadow-sm hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                          {app.departmentApplied}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {app.appliedDate}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-zinc-100">{app.name}</p>
                        <p className="text-xs font-mono text-zinc-500">{app.email}</p>
                      </div>

                      {app.portfolioUrl && (
                        <div className="text-[11px] font-mono text-zinc-400">
                          Portfolio: <span className="text-zinc-200 underline">{app.portfolioUrl}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                        {stage !== 'accepted' && (
                          <button
                            onClick={() =>
                              updateApplicantStage(
                                app.id,
                                stage === 'applied' ? 'interview' : 'accepted'
                              )
                            }
                            className="text-[11px] font-mono font-bold text-zinc-300 hover:text-white cursor-pointer"
                          >
                            {stage === 'applied' ? 'Advance to Interview →' : 'Accept & Induct ✓'}
                          </button>
                        )}
                        {stage === 'accepted' && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            Inducted into Team
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageApplicants.length === 0 && (
                    <div className="h-28 flex items-center justify-center border border-dashed border-zinc-800/60 rounded-xl text-[11px] font-mono text-zinc-600">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Add Team Member
              </h3>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">
                  Member Email
                </label>
                <input
                  type="email"
                  placeholder="student@campus.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">
                    Department
                  </label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="Technical & Web">Technical & Web</option>
                    <option value="Creative & Design">Creative & Design</option>
                    <option value="PR & Sponsorships">PR & Sponsorships</option>
                    <option value="Logistics & Ops">Logistics & Ops</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">
                    Assigned Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Member['role'])}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="member">Member</option>
                    <option value="department_head">Department Head</option>
                    <option value="super_core">Super Core</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200 cursor-pointer"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecruitmentPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm font-mono text-zinc-500">Loading personnel directory...</div>
      }
    >
      <RecruitmentContent />
    </Suspense>
  )
}
