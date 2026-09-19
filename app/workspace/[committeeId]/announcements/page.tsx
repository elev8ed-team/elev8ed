"use client"

import React, { useState, use } from "react"
import { store, useStoreState } from "@/lib/store"
import { Announcement } from "@/lib/types"
import { hasPermission } from "@/lib/permissions"
import {
  Megaphone,
  Plus,
  X,
} from "lucide-react"

export default function AnnouncementsPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const announcements = state.announcements.filter((a) => a.committeeId === committeeId)
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annDept, setAnnDept] = useState("")
  const [annPriority, setAnnPriority] = useState<Announcement["priority"]>("normal")
  const [annAudience, setAnnAudience] = useState<Announcement["audience"]>("all")

  const canBroadcast = hasPermission(currentMembership?.role, "announcement:create")

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle.trim() || !annContent.trim()) return

    store.createAnnouncement({
      committeeId,
      departmentId: annAudience === "department" ? annDept || undefined : undefined,
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      audience: annAudience,
    })

    setAnnTitle("")
    setAnnContent("")
    setCreateModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Notice & Broadcast Board</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Publish official announcements, meeting minutes, and circulars to the entire committee or specific divisions.
          </p>
        </div>

        {canBroadcast && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Broadcast</span>
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4 max-w-4xl">
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-12 text-center space-y-3">
            <Megaphone className="h-10 w-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-white">No active announcements</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Broadcast critical information or meeting details directly to members.
            </p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-3 hover:border-neutral-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {ann.title}
                  </h3>
                  {ann.priority === "urgent" && (
                    <span className="rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase">
                      Urgent
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                  <span className="rounded bg-neutral-900 px-2 py-0.5 border border-neutral-800 text-neutral-300">
                    {ann.audience === "department" ? `Dept: ${ann.departmentName || "Specific"}` : "All Committee"}
                  </span>
                  <span>•</span>
                  <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-neutral-300 whitespace-pre-wrap">
                {ann.content}
              </p>

              <div className="border-t border-neutral-900 pt-3 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="font-medium text-neutral-400">
                  Posted by <strong className="text-white">{ann.authorName}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Broadcast Announcement</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Briefing for Flagship Fest"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write clear instructions or announcement details..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Target Audience</label>
                  <select
                    value={annAudience}
                    onChange={(e) => setAnnAudience(e.target.value as Announcement["audience"])}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="all">Entire Committee</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>

                {annAudience === "department" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-neutral-400">Select Department</label>
                    <select
                      value={annDept}
                      onChange={(e) => setAnnDept(e.target.value)}
                      className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="">Select Department...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Priority</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as Announcement["priority"])}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
