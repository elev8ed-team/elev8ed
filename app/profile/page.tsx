"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { store, useStoreState } from "@/lib/store"
import { getRoleBadgeClass, getRoleLabel } from "@/lib/permissions"
import {
  Building2,
  Save,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const state = useStoreState()
  const currentUser = state.currentUser
  const committees = store.getUserCommittees(currentUser.id)

  // Form State
  const [fullName, setFullName] = useState(currentUser.fullName)
  const [college, setCollege] = useState(currentUser.college || "")
  const [course, setCourse] = useState(currentUser.course || "")
  const [year, setYear] = useState(currentUser.year || "")
  const [bio, setBio] = useState(currentUser.bio || "")
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return

    store.updateCurrentUser({
      fullName: fullName.trim(),
      college: college.trim(),
      course: course.trim(),
      year: year.trim(),
      bio: bio.trim(),
    })

    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 overflow-x-hidden selection:bg-lime-400/20 selection:text-lime-300">
      <div className="mx-auto max-w-4xl space-y-8 animate-fade-in-up">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-neutral-850 pb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Workspace</span>
          </button>

          <Link href="/dashboard" className="text-xs font-bold text-lime-400 hover:underline">
            Go to Active Dashboard →
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="rounded-3xl border border-neutral-850 bg-neutral-950 p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-2xl font-black text-lime-400 shadow-xl">
            {currentUser.fullName.slice(0, 1).toUpperCase()}
          </div>

          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-extrabold text-white">{currentUser.fullName}</h1>
            <p className="text-xs text-neutral-400 font-mono">{currentUser.email}</p>
            <p className="text-xs text-neutral-400 pt-1">
              {currentUser.college ? `${currentUser.college} · ` : ""}{currentUser.course} ({currentUser.year})
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 text-xs font-bold text-lime-400 bg-lime-400/10 border border-lime-400/20 rounded-xl">
            ✓ Profile attributes updated successfully.
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Left 2 Cols: Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="md:col-span-2 rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight">Student Profile Details</h2>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-neutral-400">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">College / Institution</label>
                <input
                  type="text"
                  placeholder="Apex Institute of Technology"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Course / Major</label>
                <input
                  type="text"
                  placeholder="Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-neutral-400">Academic Year</label>
              <input
                type="text"
                placeholder="3rd Year (Batch 2023-2027)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-neutral-400">Bio & Interests</label>
              <textarea
                rows={3}
                placeholder="Your technical interests, committee leadership background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400 px-5 py-2 text-xs font-bold text-black hover:bg-lime-300 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>

          {/* Right 1 Col: Committee Memberships */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="h-4 w-4 text-lime-400" />
              <span>Your Committees</span>
            </h2>

            <div className="space-y-3">
              {committees.map((comm) => {
                const membership = store.getUserMembership(comm.id, currentUser.id)
                return (
                  <Link
                    key={comm.id}
                    href={`/workspace/${comm.id}/overview`}
                    className="block p-3.5 rounded-xl border border-neutral-850 bg-black hover:border-neutral-700 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white group-hover:text-lime-400 transition-colors">
                        {comm.name}
                      </p>
                      <ExternalLink className="h-3 w-3 text-neutral-500 group-hover:text-white transition-colors" />
                    </div>

                    {membership && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${getRoleBadgeClass(membership.role)}`}>
                          {getRoleLabel(membership.role)}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">
                          {membership.departmentName || "All Depts"}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-neutral-900 pt-3">
              <Link
                href="/onboarding"
                className="block text-center rounded-lg border border-neutral-800 bg-neutral-900 py-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
              >
                + Join / Create Another Committee
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
