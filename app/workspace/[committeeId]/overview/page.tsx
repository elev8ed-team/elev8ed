"use client"

import React, { useState, use } from "react"
import Link from "next/link"
import { store, useStoreState } from "@/lib/store"
import { Task, Announcement, CommitteeMember } from "@/lib/types"
import { hasPermission } from "@/lib/permissions"
import {
  Users,
  Building2,
  CheckSquare,
  Calendar,
  UserPlus,
  PlusCircle,
  Megaphone,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
} from "lucide-react"

export default function WorkspaceOverviewPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const committee = state.committees.find((c) => c.id === committeeId)
  const membership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )
  const members = state.members.filter((m) => m.committeeId === committeeId)
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const tasks = state.tasks.filter((t) => t.committeeId === committeeId)
  const events = state.events.filter((e) => e.committeeId === committeeId)
  const announcements = state.announcements.filter((a) => a.committeeId === committeeId)
  const activities = state.activityLogs.filter((a) => a.committeeId === committeeId)

  // Working Modals State
  const [modalType, setModalType] = useState<"task" | "member" | "event" | "announcement" | null>(null)

  // Form States
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDesc, setNewTaskDesc] = useState("")
  const [newTaskDept, setNewTaskDept] = useState("")
  const [newTaskAssignee, setNewTaskAssignee] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<Task["priority"]>("medium")
  const [newTaskDue, setNewTaskDue] = useState("")

  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberDept, setNewMemberDept] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<CommitteeMember["role"]>("member")

  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDesc, setNewEventDesc] = useState("")
  const [newEventVenue, setNewEventVenue] = useState("")
  const [newEventStart, setNewEventStart] = useState("")
  const [newEventEnd, setNewEventEnd] = useState("")

  const [newAnnTitle, setNewAnnTitle] = useState("")
  const [newAnnContent, setNewAnnContent] = useState("")
  const [newAnnPriority, setNewAnnPriority] = useState<Announcement["priority"]>("normal")
  const [newAnnAudience, setNewAnnAudience] = useState<Announcement["audience"]>("all")

  if (!committee) return null

  // Computed metrics
  const activeTasks = tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled")
  const upcomingEvents = events.filter((e) => e.status === "upcoming")
  const canManage = hasPermission(membership?.role, "task:create")

  // Modal Submit Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    store.createTask({
      committeeId,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      departmentId: newTaskDept || undefined,
      assignedTo: newTaskAssignee || undefined,
      priority: newTaskPriority,
      dueDate: newTaskDue || undefined,
    })
    setNewTaskTitle("")
    setNewTaskDesc("")
    setModalType(null)
  }

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName.trim() || !newMemberEmail.trim()) return
    store.inviteMember({
      committeeId,
      fullName: newMemberName.trim(),
      email: newMemberEmail.trim(),
      departmentId: newMemberDept || undefined,
      role: newMemberRole,
    })
    setNewMemberName("")
    setNewMemberEmail("")
    setModalType(null)
  }

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim() || !newEventVenue.trim()) return
    store.createEvent({
      committeeId,
      title: newEventTitle.trim(),
      description: newEventDesc.trim(),
      venue: newEventVenue.trim(),
      startTime: newEventStart || new Date().toISOString(),
      endTime: newEventEnd || new Date(Date.now() + 7200000).toISOString(),
    })
    setNewEventTitle("")
    setNewEventDesc("")
    setNewEventVenue("")
    setModalType(null)
  }

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return
    store.createAnnouncement({
      committeeId,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      priority: newAnnPriority,
      audience: newAnnAudience,
    })
    setNewAnnTitle("")
    setNewAnnContent("")
    setModalType(null)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. COMMITTEE HERO HEADER */}
      <div className="rounded-3xl border border-neutral-850 bg-neutral-950 p-6 lg:p-8 relative overflow-hidden backdrop-blur">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-lime-400/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 border border-neutral-800 px-3 py-1 text-[10px] font-mono text-neutral-300">
                {committee.academicYear} BATCH
              </span>
              <span className="rounded-full bg-lime-400/10 border border-lime-400/20 px-3 py-1 text-[10px] font-mono text-lime-400">
                {committee.category}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {committee.name}
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {committee.description}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <>
                <button
                  onClick={() => setModalType("task")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Task</span>
                </button>

                <button
                  onClick={() => setModalType("member")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-850 transition-all"
                >
                  <UserPlus className="h-4 w-4 text-lime-400" />
                  <span>Invite Member</span>
                </button>

                <button
                  onClick={() => setModalType("announcement")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-850 transition-all"
                >
                  <Megaphone className="h-4 w-4 text-cyan-400" />
                  <span>Broadcast</span>
                </button>

                <button
                  onClick={() => setModalType("event")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-850 transition-all"
                >
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span>Schedule Event</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Total Members</span>
            <Users className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{members.length}</span>
            <span className="text-[10px] text-lime-400 font-mono">Active Roster</span>
          </div>
          <Link href={`/workspace/${committeeId}/members`} className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors">
            View member directory <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Departments</span>
            <Building2 className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{departments.length}</span>
            <span className="text-[10px] text-cyan-400 font-mono">Verticals</span>
          </div>
          <Link href={`/workspace/${committeeId}/departments`} className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors">
            Manage departments <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Active Tasks</span>
            <CheckSquare className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeTasks.length}</span>
            <span className="text-[10px] text-neutral-400 font-mono">of {tasks.length} total</span>
          </div>
          <Link href={`/workspace/${committeeId}/tasks`} className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors">
            Open task board <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Scheduled Events</span>
            <Calendar className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{upcomingEvents.length}</span>
            <span className="text-[10px] text-lime-400 font-mono">Upcoming</span>
          </div>
          <Link href={`/workspace/${committeeId}/events`} className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors">
            View event timeline <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

      </div>

      {/* 3. CORE TWO-COLUMN SECTION (Activity & Tasks/Events) */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left 2 Cols: Active Tasks & Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Priority Tasks */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Active Deliverables</h2>
                <p className="text-[11px] text-neutral-400">Current responsibilities across departments</p>
              </div>

              <Link
                href={`/workspace/${committeeId}/tasks`}
                className="text-xs font-semibold text-lime-400 hover:underline"
              >
                View all ({tasks.length})
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <div className="rounded-xl border border-neutral-900 bg-neutral-900/30 p-8 text-center space-y-2">
                <CheckSquare className="h-8 w-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-medium text-neutral-300">All tasks completed!</p>
                <p className="text-[11px] text-neutral-500">Create a task to keep operations moving forward.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-neutral-850 bg-black hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => store.updateTaskStatus(task.id, "completed")}
                        title="Mark Completed"
                        className="h-4 w-4 rounded border border-neutral-700 hover:border-lime-400 flex items-center justify-center shrink-0 transition-colors"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                          {task.departmentName && <span className="text-neutral-300">{task.departmentName}</span>}
                          {task.dueDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-neutral-500 font-mono">
                                <Clock className="h-2.5 w-2.5" /> Due {task.dueDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        task.priority === "urgent" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        task.priority === "high" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                        "bg-neutral-800 text-neutral-400"
                      }`}>
                        {task.priority}
                      </span>
                      <span className="capitalize text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Breakdown Grid */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Department Roster Distribution</h2>
                <p className="text-[11px] text-neutral-400">Allocated verticals and teams</p>
              </div>

              <Link
                href={`/workspace/${committeeId}/departments`}
                className="text-xs font-semibold text-lime-400 hover:underline"
              >
                Manage
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {departments.map((dept) => {
                const deptMembers = members.filter((m) => m.departmentId === dept.id)
                const deptTasks = tasks.filter((t) => t.departmentId === dept.id && t.status !== "completed")
                return (
                  <div key={dept.id} className="p-3.5 rounded-xl border border-neutral-850 bg-black space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dept.name}</span>
                      <span className="text-[10px] font-mono text-lime-400">{deptMembers.length} members</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">{dept.description || "Operational division"}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500 font-mono">
                      <span>{deptTasks.length} open tasks</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Announcements & Live Activity Feed */}
        <div className="space-y-6">
          
          {/* Latest Announcements */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-cyan-400" />
                <span>Notice Board</span>
              </h2>
              <Link href={`/workspace/${committeeId}/announcements`} className="text-xs font-semibold text-lime-400 hover:underline">
                View all
              </Link>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-neutral-500">No active notices.</p>
            ) : (
              <div className="space-y-3">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3.5 rounded-xl border border-neutral-850 bg-black space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{ann.title}</span>
                      {ann.priority === "urgent" && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold">URGENT</span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                    <p className="text-[9px] font-mono text-neutral-500 pt-1">By {ann.authorName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Activity Log */}
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-lime-400" />
                <span>Audit Stream</span>
              </h2>
              <Link href={`/workspace/${committeeId}/activity`} className="text-xs font-semibold text-lime-400 hover:underline">
                Full Log
              </Link>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 text-xs">
                  <div className="h-2 w-2 rounded-full bg-lime-400 mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-neutral-300">
                      <strong className="text-white">{log.actorName}</strong>{" "}
                      <span className="text-neutral-400">{log.action}</span>{" "}
                      <span className="text-neutral-200 font-medium">&ldquo;{log.entityTitle}&rdquo;</span>
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      {new Date(log.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* WORKING INTERACTIVE MODALS                                               */}
      {/* ========================================================================= */}

      {/* 1. Create Task Modal */}
      {modalType === "task" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Create Committee Task</h3>
              <button onClick={() => setModalType(null)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm Speaker Lodging, Finalize Hackathon Judges"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details and deliverables..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Department</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">General (All)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.user.fullName} ({m.title})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Task["priority"])}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Deadline</label>
                  <input
                    type="date"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Invite Member Modal */}
      {modalType === "member" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Invite Committee Member</h3>
              <button onClick={() => setModalType(null)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Mehra"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="rohan@apex.edu"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Assign Department</label>
                  <select
                    value={newMemberDept}
                    onChange={(e) => setNewMemberDept(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">General Roster</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Committee Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as CommitteeMember["role"])}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="head">Department Head</option>
                    <option value="admin">Committee Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300"
                >
                  Add Member to Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Announcement Modal */}
      {modalType === "announcement" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Broadcast Committee Notice</h3>
              <button onClick={() => setModalType(null)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Subject / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venue Change for General Body Meeting"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Notice Body</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write message to committee members..."
                  value={newAnnContent}
                  onChange={(e) => setNewAnnContent(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Audience</label>
                  <select
                    value={newAnnAudience}
                    onChange={(e) => setNewAnnAudience(e.target.value as Announcement["audience"])}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="all">Entire Committee</option>
                    <option value="department">Specific Department</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Priority Level</label>
                  <select
                    value={newAnnPriority}
                    onChange={(e) => setNewAnnPriority(e.target.value as Announcement["priority"])}
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
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-bold text-black hover:bg-cyan-300"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Schedule Event Modal */}
      {modalType === "event" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Schedule Committee Event</h3>
              <button onClick={() => setModalType(null)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Symposium, Hackathon Briefing"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  placeholder="Agenda and event summary..."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Venue</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Auditorium"
                  value={newEventVenue}
                  onChange={(e) => setNewEventVenue(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Start Date / Time</label>
                  <input
                    type="datetime-local"
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">End Date / Time</label>
                  <input
                    type="datetime-local"
                    value={newEventEnd}
                    onChange={(e) => setNewEventEnd(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-850">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-lime-400 px-4 py-2 text-xs font-bold text-black hover:bg-lime-300"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
