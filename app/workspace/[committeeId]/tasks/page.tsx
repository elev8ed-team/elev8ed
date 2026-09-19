"use client"

import React, { useState, use } from "react"
import { store, useStoreState } from "@/lib/store"
import { TaskPriority, TaskStatus } from "@/lib/types"
import { hasPermission } from "@/lib/permissions"
import {
  CheckSquare,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react"

export default function TasksPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const tasks = state.tasks.filter((t) => t.committeeId === committeeId)
  const members = state.members.filter((m) => m.committeeId === committeeId)
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )
  const currentUser = state.currentUser

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<"all" | "my" | "completed">("all")
  const [filterDept, setFilterDept] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskDept, setTaskDept] = useState("")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium")
  const [taskDueDate, setTaskDueDate] = useState("")

  const canCreateTask = hasPermission(currentMembership?.role, "task:create")
  const canDeleteTask = hasPermission(currentMembership?.role, "task:delete")

  // Filter Logic
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "my" && t.assignedTo !== currentUser.id) return false
    if (activeTab === "completed" && t.status !== "completed") return false
    if (activeTab === "all" && t.status === "completed") return false

    if (filterDept !== "all" && t.departmentId !== filterDept) return false
    if (filterPriority !== "all" && t.priority !== filterPriority) return false

    return true
  })

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    store.createTask({
      committeeId,
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      departmentId: taskDept || undefined,
      assignedTo: taskAssignee || undefined,
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
    })

    setTaskTitle("")
    setTaskDesc("")
    setTaskDueDate("")
    setCreateModalOpen(false)
  }

  const handleStatusToggle = (taskId: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = currentStatus === "completed" ? "todo" : "completed"
    store.updateTaskStatus(taskId, nextStatus)
  }

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    store.updateTaskStatus(taskId, newStatus)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Delete this task?")) {
      store.deleteTask(taskId)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Task Architecture</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Assign deliverables straight to individual members, set rigid deadlines, and observe progress in real time.
          </p>
        </div>

        {canCreateTask && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-neutral-850 bg-neutral-950 p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-neutral-850 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Active Deliverables ({tasks.filter((t) => t.status !== "completed").length})
          </button>

          <button
            onClick={() => setActiveTab("my")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "my"
                ? "bg-neutral-850 text-lime-400 shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Assigned to Me ({tasks.filter((t) => t.assignedTo === currentUser.id && t.status !== "completed").length})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-neutral-850 text-white shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Completed ({tasks.filter((t) => t.status === "completed").length})
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-neutral-850 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-neutral-850 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Stream / Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-12 text-center space-y-3">
            <CheckSquare className="h-10 w-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-white">No tasks found</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              There are no tasks matching the selected tab and filters.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const assigneeMember = members.find((m) => m.userId === task.assignedTo)
            const isCompleted = task.status === "completed"

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-neutral-850 bg-neutral-950 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-neutral-700 transition-all group"
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(task.id, task.status)}
                    className="mt-0.5 text-neutral-600 hover:text-lime-400 transition-colors shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-lime-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-neutral-600 hover:text-white" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <h3 className={`text-sm font-bold text-white tracking-tight ${isCompleted ? "line-through text-neutral-500" : ""}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono text-neutral-400">
                      {task.departmentName && (
                        <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-neutral-300">
                          {task.departmentName}
                        </span>
                      )}

                      {task.dueDate && (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Calendar className="h-3 w-3" /> Due {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Assignee, Priority, Status Dropdown & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  
                  {/* Assignee Avatar */}
                  <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                    <div className="h-6 w-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-[10px] text-white">
                      {assigneeMember ? assigneeMember.user.fullName.slice(0, 1) : "?"}
                    </div>
                    <span className="hidden sm:inline font-medium text-[11px]">
                      {assigneeMember ? assigneeMember.user.fullName : "Unassigned"}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    task.priority === "urgent" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    task.priority === "high" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                    task.priority === "medium" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                    "bg-neutral-800 text-neutral-400"
                  }`}>
                    {task.priority}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-white outline-none cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  {/* Delete Task */}
                  {canDeleteTask && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-neutral-600 hover:text-red-400 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* Create Task Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Create Deliverable Task</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Sponsorship Brochure, Print Participant Badges"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Task Instructions & Details</label>
                <textarea
                  rows={3}
                  placeholder="Requirements, file links, and notes..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Department</label>
                  <select
                    value={taskDept}
                    onChange={(e) => setTaskDept(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">General (All Committee)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Assign To</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
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
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Priority Level</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
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
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  />
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
                  Create Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
