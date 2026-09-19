"use client"

import React, { useState, use } from "react"
import { useRouter } from "next/navigation"
import { store, useStoreState } from "@/lib/store"
import { hasPermission } from "@/lib/permissions"
import {
  Save,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react"

export default function CommitteeSettingsPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId
  const router = useRouter()

  const state = useStoreState()
  const committee = state.committees.find((c) => c.id === committeeId)
  const membership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )

  const [name, setName] = useState(committee?.name || "")
  const [description, setDescription] = useState(committee?.description || "")
  const [college, setCollege] = useState(committee?.college || "")
  const [academicYear, setAcademicYear] = useState(committee?.academicYear || "")
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)

  if (!committee) return null

  const canEdit = hasPermission(membership?.role, "committee:edit")
  const isOwner = membership?.role === "owner"
  const inviteToken = store.getInvitations(committeeId)[0]?.token || "E8-ACM-2026"

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    store.updateCommittee(committeeId, {
      name: name.trim(),
      description: description.trim(),
      college: college.trim(),
      academicYear: academicYear.trim(),
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleDeleteCommittee = () => {
    if (confirm(`CRITICAL: Are you sure you want to permanently delete "${committee.name}"? This removes all departments, tasks, and member records.`)) {
      store.deleteCommittee(committeeId)
      const remaining = store.getUserCommittees()
      if (remaining.length > 0) {
        router.push(`/workspace/${remaining[0].id}/overview`)
      } else {
        router.push("/onboarding")
      }
    }
  }

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="border-b border-neutral-850 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">Committee Configuration</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Update organizational metadata, invitation access codes, and administration parameters.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 text-xs font-bold text-lime-400 bg-lime-400/10 border border-lime-400/20 rounded-xl">
          ✓ Committee profile configuration saved successfully.
        </div>
      )}

      {/* General Settings Form */}
      <form onSubmit={handleSave} className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white tracking-tight">Organization Profile</h2>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-neutral-400">Committee Name</label>
          <input
            type="text"
            required
            disabled={!canEdit}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-neutral-400">Description & Mission</label>
          <textarea
            rows={3}
            disabled={!canEdit}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-neutral-400">Institution / University</label>
            <input
              type="text"
              disabled={!canEdit}
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none disabled:opacity-50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase text-neutral-400">Academic Year Batch</label>
            <input
              type="text"
              disabled={!canEdit}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {canEdit && (
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>

      {/* Access Code Card */}
      <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-3">
        <h2 className="text-sm font-bold text-white tracking-tight">Active Roster Access Token</h2>
        <p className="text-xs text-neutral-400">
          Share this token with new student recruits to let them join this committee instantly during onboarding.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <div className="px-3.5 py-2 rounded-lg bg-black border border-neutral-800 font-mono text-xs font-bold text-lime-400">
            {inviteToken}
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(inviteToken)
              setTokenCopied(true)
              setTimeout(() => setTokenCopied(false), 2000)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-850 transition-all"
          >
            {tokenCopied ? <Check className="h-3.5 w-3.5 text-lime-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{tokenCopied ? "Token Copied!" : "Copy Token"}</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="text-sm font-bold tracking-tight">Danger Zone</h2>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Permanently decommission this committee container. All department structures, task pipelines, and member access logs will be obliterated.
          </p>

          <button
            type="button"
            onClick={handleDeleteCommittee}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Committee Permanently</span>
          </button>
        </div>
      )}

    </div>
  )
}
