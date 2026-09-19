"use client"

import React, { useState, use } from "react"
import { store, useStoreState } from "@/lib/store"
import { hasPermission } from "@/lib/permissions"
import {
  Building2,
  Plus,
  Users,
  CheckSquare,
  Trash2,
  X,
  UserCheck,
} from "lucide-react"

export default function DepartmentsPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const members = state.members.filter((m) => m.committeeId === committeeId)
  const tasks = state.tasks.filter((t) => t.committeeId === committeeId)
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [deptDesc, setDeptDesc] = useState("")
  const [deptHeadId, setDeptHeadId] = useState("")

  const canCreateDept = hasPermission(currentMembership?.role, "department:create")
  const canDeleteDept = hasPermission(currentMembership?.role, "department:delete")

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptName.trim()) return

    store.createDepartment(
      committeeId,
      deptName.trim(),
      deptDesc.trim() || undefined,
      deptHeadId || undefined
    )

    setDeptName("")
    setDeptDesc("")
    setDeptHeadId("")
    setCreateModalOpen(false)
  }

  const handleDeleteDepartment = (deptId: string, name: string) => {
    if (confirm(`Are you sure you want to delete the "${name}" department?`)) {
      store.deleteDepartment(deptId)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Departments & Verticals</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize committee operations into focused teams with dedicated leadership and responsibility streams.
          </p>
        </div>

        {canCreateDept && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {/* Department Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => {
          const deptMembers = members.filter((m) => m.departmentId === dept.id)
          const deptTasks = tasks.filter((t) => t.departmentId === dept.id)
          const completedTasks = deptTasks.filter((t) => t.status === "completed")
          const headMember = members.find((m) => m.userId === dept.headId || (m.departmentId === dept.id && m.role === "head"))

          return (
            <div
              key={dept.id}
              className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 text-lime-400 font-bold">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                      {dept.name}
                    </h3>
                  </div>

                  {canDeleteDept && (
                    <button
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      title="Delete Department"
                      className="text-neutral-600 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px]">
                  {dept.description || "Operational vertical maintaining committee projects."}
                </p>

                {/* Head of Department */}
                <div className="rounded-xl border border-neutral-900 bg-black p-2.5 flex items-center gap-2.5 text-xs">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-bold text-neutral-200">
                    <UserCheck className="h-3 w-3 text-cyan-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-500 block">Department Head</span>
                    <span className="font-bold text-white truncate block">
                      {headMember ? headMember.user.fullName : "Head Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Metrics */}
              <div className="border-t border-neutral-900 pt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{deptMembers.length} Members</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{completedTasks.length}/{deptTasks.length} Done</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Department Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Initialize New Department</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Media & Photography, Sponsorship, Hackathons"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Scope / Description</label>
                <textarea
                  rows={3}
                  placeholder="Responsibilities and goals for this department..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Assign Head of Department</label>
                <select
                  value={deptHeadId}
                  onChange={(e) => setDeptHeadId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="">Leave Unassigned for Now</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.fullName} ({m.title})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
