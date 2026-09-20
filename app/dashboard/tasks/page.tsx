"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface Task {
  id: string
  title: string
  department: string
  status: 'backlog' | 'in_progress' | 'review' | 'done'
  priority: 'urgent' | 'medium' | 'low'
  assignee: string
  dueDate?: string
}

const DEFAULT_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Finalize auditorium bookings & sound engineer for annual fest',
    department: 'Logistics',
    status: 'in_progress',
    priority: 'urgent',
    assignee: 'Arjun K.',
    dueDate: 'Sep 24',
  },
  {
    id: 't-2',
    title: 'Review sponsorship deck & tier deliverables with Dean of Affairs',
    department: 'PR & Sponsor',
    status: 'review',
    priority: 'urgent',
    assignee: 'Priya M.',
    dueDate: 'Sep 26',
  },
  {
    id: 't-3',
    title: 'Deploy CertiSwift automated badge generator for workshop',
    department: 'Technical',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Dev S.',
    dueDate: 'Sep 28',
  },
  {
    id: 't-4',
    title: 'Draft social media campaign teaser video & carousel graphics',
    department: 'Creative & Design',
    status: 'backlog',
    priority: 'medium',
    assignee: 'Sneha R.',
    dueDate: 'Oct 02',
  },
  {
    id: 't-5',
    title: 'Procure stage badges, wristbands, and registration scanner units',
    department: 'Logistics',
    status: 'backlog',
    priority: 'low',
    assignee: 'Rohan T.',
    dueDate: 'Oct 05',
  },
  {
    id: 't-6',
    title: 'Submit quarterly budget expense sheet & receipts to treasurer',
    department: 'Finance',
    status: 'done',
    priority: 'medium',
    assignee: 'Ananya V.',
    dueDate: 'Sep 18',
  },
]

const COLUMNS: { id: Task['status']; label: string; countLabel: string }[] = [
  { id: 'backlog', label: 'Backlog', countLabel: 'Queue' },
  { id: 'in_progress', label: 'In Progress', countLabel: 'Active' },
  { id: 'review', label: 'Review', countLabel: 'Audit' },
  { id: 'done', label: 'Done', countLabel: 'Archived' },
]

function TasksContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('ws')

  const [workspaceName, setWorkspaceName] = useState('Workspace Tasks')
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [filterDept, setFilterDept] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDept, setNewDept] = useState('Technical')
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium')
  const [newAssignee, setNewAssignee] = useState('')
  const [newDueDate, setNewDueDate] = useState('')

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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      department: newDept,
      status: 'backlog',
      priority: newPriority,
      assignee: newAssignee.trim() || 'Core Team',
      dueDate: newDueDate || 'Soon',
    }

    setTasks([newTask, ...tasks])
    setNewTitle('')
    setNewAssignee('')
    setNewDueDate('')
    setIsModalOpen(false)
  }

  const moveTask = (taskId: string, direction: 'next' | 'prev') => {
    const order: Task['status'][] = ['backlog', 'in_progress', 'review', 'done']
    setTasks(
      tasks.map((task) => {
        if (task.id !== taskId) return task
        const currentIndex = order.indexOf(task.status)
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
        if (nextIndex >= 0 && nextIndex < order.length) {
          return { ...task, status: order[nextIndex] }
        }
        return task
      })
    )
  }

  const departments = ['all', ...Array.from(new Set(tasks.map((t) => t.department)))]

  const filteredTasks =
    filterDept === 'all' ? tasks : tasks.filter((t) => t.department === filterDept)

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              Kanban Pipeline
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-2">
            {workspaceName}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Department Filter Selector */}
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-600"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept} className="bg-zinc-900 text-white">
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow cursor-pointer"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Kanban 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id)

          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    {col.label}
                  </h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group rounded-xl border border-zinc-800/80 bg-zinc-900/80 p-4 space-y-3 hover:border-zinc-700 transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                        {task.department}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          task.priority === 'urgent'
                            ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                            : task.priority === 'medium'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-zinc-200 line-clamp-2">
                      {task.title}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-500 border-t border-zinc-800/40">
                      <span>👤 {task.assignee}</span>
                      {task.dueDate && <span>⏱ {task.dueDate}</span>}
                    </div>

                    {/* Step Movement Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => moveTask(task.id, 'prev')}
                        disabled={col.id === 'backlog'}
                        className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => moveTask(task.id, 'next')}
                        disabled={col.id === 'done'}
                        className="text-[10px] font-mono font-bold text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        Advance →
                      </button>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="h-32 flex items-center justify-center border border-dashed border-zinc-800/60 rounded-xl text-[11px] font-mono text-zinc-600">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 font-mono">
                Create Operational Task
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirm sponsorship contract"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="Logistics">Logistics</option>
                    <option value="Technical">Technical</option>
                    <option value="PR & Sponsor">PR & Sponsor</option>
                    <option value="Creative & Design">Creative & Design</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">
                    Assignee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Arjun K."
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400">
                    Due Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oct 05"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-zinc-950 hover:bg-zinc-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm font-mono text-zinc-500">Loading Kanban pipeline...</div>
      }
    >
      <TasksContent />
    </Suspense>
  )
}
