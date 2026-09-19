"use client"

import React, { useState, use } from "react"
import { store, useStoreState } from "@/lib/store"
import { UserRole } from "@/lib/types"
import { getRoleBadgeClass, getRoleLabel, hasPermission } from "@/lib/permissions"
import {
  Search,
  UserPlus,
  Mail,
  Trash2,
  Check,
  Copy,
  X,
} from "lucide-react"

export default function MembersPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const members = state.members.filter((m) => m.committeeId === committeeId)
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState<string>("all")
  const [selectedRole, setSelectedRole] = useState<string>("all")

  // Modal State
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteDept, setInviteDept] = useState("")
  const [inviteRole, setInviteRole] = useState<UserRole>("member")
  const [inviteTitle, setInviteTitle] = useState("")
  const [tokenCopied, setTokenCopied] = useState(false)

  const canManageMembers = hasPermission(currentMembership?.role, "member:invite")
  const canChangeRoles = hasPermission(currentMembership?.role, "member:change_role")
  const canRemoveMembers = hasPermission(currentMembership?.role, "member:remove")

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDept = selectedDept === "all" || m.departmentId === selectedDept
    const matchesRole = selectedRole === "all" || m.role === selectedRole

    return matchesSearch && matchesDept && matchesRole
  })

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim() || !inviteEmail.trim()) return

    store.inviteMember({
      committeeId,
      fullName: inviteName.trim(),
      email: inviteEmail.trim(),
      departmentId: inviteDept || undefined,
      role: inviteRole,
      title: inviteTitle.trim() || undefined,
    })

    setInviteName("")
    setInviteEmail("")
    setInviteTitle("")
    setInviteModalOpen(false)
  }

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    store.updateMemberRole(committeeId, memberId, newRole)
  }

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the committee?")) {
      store.removeMember(committeeId, memberId)
    }
  }

  const inviteToken = store.getInvitations(committeeId)[0]?.token || "E8-ACM-2026"

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Committee Roster</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage structural hierarchy, department mapping, and membership access permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Copy Token Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteToken)
              setTokenCopied(true)
              setTimeout(() => setTokenCopied(false), 2000)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-mono text-neutral-300 hover:text-white transition-all"
          >
            {tokenCopied ? (
              <>
                <Check className="h-3.5 w-3.5 text-lime-400" />
                <span className="text-lime-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-500" />
                <span>Token: {inviteToken}</span>
              </>
            )}
          </button>

          {canManageMembers && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search roster by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-850 bg-neutral-950 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-neutral-700 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-xl border border-neutral-850 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 outline-none w-1/2 sm:w-auto"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="rounded-xl border border-neutral-850 bg-neutral-950 px-3 py-2 text-xs text-neutral-300 outline-none w-1/2 sm:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
            <option value="head">Department Heads</option>
            <option value="member">Members</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-2xl border border-neutral-850 bg-neutral-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-850 bg-black/40 text-[10px] font-mono uppercase text-neutral-400">
              <tr>
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Title / Designation</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Joined</th>
                {canManageMembers && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-500">
                    No members match the search query or filter.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-neutral-900/40 transition-colors">
                    
                    {/* User Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-850 font-bold text-xs text-white border border-neutral-700">
                          {member.user.fullName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.user.fullName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" />
                            {member.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5">
                      {member.departmentName ? (
                        <span className="inline-flex rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-200 border border-neutral-800">
                          {member.departmentName}
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-500 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Title */}
                    <td className="px-5 py-3.5 font-medium text-neutral-200">
                      {member.title}
                    </td>

                    {/* Role Badge / Changer */}
                    <td className="px-5 py-3.5">
                      {canChangeRoles && member.role !== "owner" ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${getRoleBadgeClass(member.role)}`}
                        >
                          <option value="admin" className="bg-neutral-900 text-white">Admin</option>
                          <option value="head" className="bg-neutral-900 text-white">Department Head</option>
                          <option value="member" className="bg-neutral-900 text-white">Member</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeClass(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-3.5 text-neutral-400 font-mono text-[10px]">
                      {new Date(member.joinedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    {canManageMembers && (
                      <td className="px-5 py-3.5 text-right">
                        {member.role !== "owner" && canRemoveMembers && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            title="Remove Member"
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    )}

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Add Member to Committee</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Iyer"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="maya.iyer@apex.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Custom Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Tech Lead, Logistics Associate"
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Department</label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">General Roster</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="head">Department Head</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300"
                >
                  Save & Add to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
