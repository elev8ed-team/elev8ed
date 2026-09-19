"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { store } from "@/lib/store"
import { UserRole } from "@/lib/types"

const DEFAULT_DEPARTMENTS = [
  "Technical",
  "Design & Creatives",
  "Public Relations & Media",
  "Logistics & Operations",
  "Sponsorship & Finance",
  "Content & Editorial",
]

const LEADERSHIP_ROLES: { role: UserRole; title: string; desc: string }[] = [
  { role: "owner", title: "President / Chairperson", desc: "Full executive control over all departments & settings" },
  { role: "admin", title: "Vice Chair / Core Admin", desc: "Manages departments, tasks, rosters & operations" },
  { role: "head", title: "Department Head", desc: "Leads specific department tasks and members" },
]

export default function CreateWorkspacePage() {
  const router = useRouter()
  
  // Form State
  const [orgName, setOrgName] = useState("")
  const [collegeName, setCollegeName] = useState("")
  const [academicYear, setAcademicYear] = useState("2026-2027")
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner")
  const [category, setCategory] = useState("Technical & Computing")
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS)
  const [customDept, setCustomDept] = useState("")
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDepartment = (dept: string) => {
    if (departments.includes(dept)) {
      if (departments.length === 1) {
        setError("Your committee must have at least one department.")
        return
      }
      setDepartments(departments.filter((d) => d !== dept))
    } else {
      setError(null)
      setDepartments([...departments, dept])
    }
  }

  const addCustomDepartment = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customDept.trim()
    if (!trimmed) return
    if (departments.map((d) => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      setError("This department is already added.")
      return
    }
    setError(null)
    setDepartments([...departments, trimmed])
    setCustomDept("")
  }

  const handleDeployWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim() || !collegeName.trim()) {
      setError("Please fill in all required organization details.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create real committee in Elev8ed store
      const newCommittee = store.createCommittee({
        name: orgName.trim(),
        college: collegeName.trim(),
        category,
        academicYear,
        departmentNames: departments,
        founderRole: selectedRole,
      })

      // Route directly into the newly created committee workspace
      setTimeout(() => {
        router.push(`/workspace/${newCommittee.id}/overview`)
      }, 500)
    } catch (err) {
      console.error(err)
      setError("Failed to provision workspace. Please check your inputs and try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden selection:bg-white/20">
      {/* Background Structural Grid */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-neutral-850 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <span className="text-neutral-700">/</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
              <span className="text-xs font-mono font-bold tracking-wider text-neutral-300">
                PROVISIONING WIZARD
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
              STAGE 02 // WORKSPACE DEPLOYMENT
            </span>
          </div>
        </div>
      </header>

      {/* Main Provisioning Container */}
      <main className="mx-auto max-w-3xl w-full px-6 py-10 flex-1">
        <div className="space-y-8 animate-fade-in-up">
          
          {/* Header Title */}
          <div className="space-y-2 border-b border-neutral-900 pb-6">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              Configure Your Committee
            </h1>
            <p className="text-xs leading-relaxed text-neutral-400">
              Set up your student organization structure, initialize departments, and configure administrative access.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleDeployWorkspace} className="space-y-8">
            
            {/* Step 1: Organization Credentials */}
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-mono font-bold text-neutral-300 border border-neutral-800">
                    1
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight">Organization Profile</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">REQUIRED</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                    Committee / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IEEE Student Branch, Rotaract Club, Cultural Council"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                    College / University Institution
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Institute of Technology, Stanford, MIT"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white focus:border-neutral-500 focus:outline-none transition-colors"
                  >
                    <option value="Technical & Computing">Technical & Computing</option>
                    <option value="Cultural & Arts">Cultural & Arts</option>
                    <option value="Sports & Athletics">Sports & Athletics</option>
                    <option value="Social & Community Service">Social & Community Service</option>
                    <option value="Academic & Professional">Academic & Professional</option>
                    <option value="Media & Publications">Media & Publications</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-neutral-300 uppercase tracking-wider">
                    Academic Year Batch
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2026-2027"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Department Infrastructure */}
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-mono font-bold text-neutral-300 border border-neutral-800">
                    2
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight">Department Architecture</h2>
                </div>
                <span className="text-[10px] font-mono text-lime-400">
                  {departments.length} ACTIVE DEPARTMENTS
                </span>
              </div>

              <p className="text-xs text-neutral-400">
                Click to enable or disable standard departments, or add your custom verticals below.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {DEFAULT_DEPARTMENTS.map((dept) => {
                  const isSelected = departments.includes(dept)
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-lime-400 text-black border-lime-400 font-bold shadow-sm"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-neutral-200"
                      }`}
                    >
                      <span>{isSelected ? "✓" : "+"}</span>
                      {dept}
                    </button>
                  )
                })}
              </div>

              {/* Custom departments added by user */}
              {departments.filter((d) => !DEFAULT_DEPARTMENTS.includes(d)).length > 0 && (
                <div className="pt-2 border-t border-neutral-900">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Custom Verticals:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {departments
                      .filter((d) => !DEFAULT_DEPARTMENTS.includes(d))
                      .map((dept) => (
                        <span
                          key={dept}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-lime-400 border border-lime-400/30"
                        >
                          {dept}
                          <button
                            type="button"
                            onClick={() => toggleDepartment(dept)}
                            className="ml-1 text-neutral-500 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Add Custom Department Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom department (e.g. Robotics, Gaming, Hospitality)..."
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomDepartment(e)
                    }
                  }}
                  className="flex-1 rounded-lg border border-neutral-800 bg-black px-3.5 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={addCustomDepartment}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Step 3: Leadership Role Allocation */}
            <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-mono font-bold text-neutral-300 border border-neutral-800">
                    3
                  </span>
                  <h2 className="text-sm font-bold text-white tracking-tight">Your Executive Role</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">ADMINISTRATIVE ACCESS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {LEADERSHIP_ROLES.map((item) => {
                  const isChosen = selectedRole === item.role
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                        isChosen
                          ? "bg-neutral-900 border-lime-400 text-white shadow"
                          : "bg-black border-neutral-850 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                      }`}
                    >
                      <span className={`text-xs font-bold ${isChosen ? "text-lime-400" : ""}`}>{item.title}</span>
                      <span className="text-[10px] text-neutral-500 mt-1 leading-relaxed">{item.desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Deploy Trigger CTA */}
            <div className="flex items-center justify-between pt-2">
              <Link
                href="/onboarding"
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-lime-400 px-6 text-xs font-bold text-black shadow-lg transition-all hover:bg-lime-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Provisioning Workspace..." : "Deploy Workspace & Launch Dashboard →"}
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-[10px] text-neutral-600">
        Elev8Ed Operating Infrastructure · Campus Workspace Engine
      </footer>
    </div>
  )
}
