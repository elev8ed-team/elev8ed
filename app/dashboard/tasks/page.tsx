"use client"

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

import { FilterBar, SortField, SortDirection } from './components/FilterBar'
import { TaskCard } from './components/TaskCard'
import { TaskModal, TaskItem, TaskStatus, TaskPriority } from './components/TaskModal'
import { Department, Member } from './components/MemberOrgPicker'

interface WorkspaceDetails {
  id: string
  name: string
  slug: string
}

const COLUMNS: { id: TaskStatus; label: string; countLabel: string }[] = [
  { id: 'todo', label: 'To Do', countLabel: 'Queue' },
  { id: 'in_progress', label: 'In Progress', countLabel: 'Active' },
  { id: 'done', label: 'Done', countLabel: 'Completed' },
]

// Priority weight mapping for sorting
const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function TasksContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('ws')

  const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null)
  const [workspaceName, setWorkspaceName] = useState('Workspace Tasks')
  const [tenureId, setTenureId] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters, Search, and Sorting State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [filterDept, setFilterDept] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createColumnStatus, setCreateColumnStatus] = useState<TaskStatus>('todo')
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null)

  // Smooth Card Animation & Drag-and-Drop Tracking
  const [movingOutTaskId, setMovingOutTaskId] = useState<string | null>(null)
  const [movingDirection, setMovingDirection] = useState<'next' | 'prev' | null>(null)
  const [enteringTaskIds, setEnteringTaskIds] = useState<Set<string>>(new Set())
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  // Fetch Tasks for current workspace and active tenure
  const fetchTasks = useCallback(async (wsId: string, tId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          id,
          workspace_id,
          tenure_id,
          department_id,
          title,
          description,
          status,
          priority,
          assigned_to,
          created_by,
          deadline,
          created_at,
          departments (
            id,
            name
          ),
          assigned_member:members!tasks_assigned_to_fkey (
            id,
            full_name
          )
        `)
        .eq('workspace_id', wsId)
        .eq('tenure_id', tId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks from Supabase:', error)
      } else if (data) {
        setTasks(data as unknown as TaskItem[])
      }
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err)
    }
  }, [])

  // 1. Initialize Workspace, Tenure, Departments, Members
  useEffect(() => {
    async function loadWorkspaceAndData() {
      setLoading(true)
      try {
        let ws: WorkspaceDetails | null = null

        if (slug) {
          const { data } = await supabase
            .from('workspaces')
            .select('id, name, slug')
            .eq('slug', slug)
            .maybeSingle()
          if (data) ws = data
        }

        // Fallback: If slug was omitted or not matched, pick first workspace in database
        if (!ws) {
          const { data: firstWs } = await supabase
            .from('workspaces')
            .select('id, name, slug')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle()
          if (firstWs) ws = firstWs
        }

        if (!ws) {
          setWorkspaceName(slug ? slug.replace(/-/g, ' ') : 'Workspace Tasks')
          setLoading(false)
          return
        }

        setWorkspace(ws)
        setWorkspaceName(ws.name)

        // 2. Fetch Active Tenure
        const { data: tenureData } = await supabase
          .from('tenures')
          .select('id, year_label, is_active')
          .eq('workspace_id', ws.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        let currentTenureId = tenureData?.id

        if (!currentTenureId) {
          const { data: latestTenure } = await supabase
            .from('tenures')
            .select('id, year_label')
            .eq('workspace_id', ws.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          currentTenureId = latestTenure?.id
        }

        setTenureId(currentTenureId || null)

        // 3. Fetch Departments
        const { data: deptsData } = await supabase
          .from('departments')
          .select('id, name')
          .eq('workspace_id', ws.id)
          .order('created_at', { ascending: true })

        setDepartments(deptsData || [])

        // 4. Fetch Members with role and department
        const { data: membersData } = await supabase
          .from('members')
          .select('id, full_name, role, department_id')
          .eq('workspace_id', ws.id)
          .order('full_name', { ascending: true })

        setMembers((membersData || []) as Member[])

        // 5. Initial Tasks Fetch
        if (currentTenureId) {
          await fetchTasks(ws.id, currentTenureId)
        }
      } catch (err) {
        console.error('Error initializing workspace tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWorkspaceAndData()
  }, [slug, fetchTasks])

  // 2. Setup Realtime Subscription on Supabase tasks
  useEffect(() => {
    if (!workspace?.id || !tenureId) return

    const channel = supabase
      .channel(`kanban-tasks-${workspace.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `workspace_id=eq.${workspace.id}`,
        },
        () => {
          fetchTasks(workspace.id, tenureId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [workspace?.id, tenureId, fetchTasks])

  // 3. Smooth Advance and Back Transitions (eliminates teleportation)
  const handleMoveTask = async (taskId: string, direction: 'next' | 'prev') => {
    const order: TaskStatus[] = ['todo', 'in_progress', 'done']
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask) return

    const currentIndex = order.indexOf(targetTask.status)
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= order.length) return

    const newStatus = order[nextIndex]

    // Step 1: Start exit animation on source column
    setMovingOutTaskId(taskId)
    setMovingDirection(direction)

    // Wait 150ms for CSS exit slide
    await new Promise((resolve) => setTimeout(resolve, 150))

    // Step 2: Transition state (using View Transitions if supported)
    const applyStateChange = () => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      )
      setMovingOutTaskId(null)
      setMovingDirection(null)
      setEnteringTaskIds((prev) => new Set(prev).add(taskId))
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      ;(document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(applyStateChange)
    } else {
      applyStateChange()
    }

    setTimeout(() => {
      setEnteringTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 350)

    // Step 3: Mutate Supabase
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task status:', error)
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetTask.status } : t))
      )
      alert(`Failed to update task: ${error.message}`)
    }
  }

  // 4. Drag-and-Drop Handler
  const handleDropTask = async (taskId: string, targetStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask || targetTask.status === targetStatus) return

    const applyDrop = () => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t))
      )
      setEnteringTaskIds((prev) => new Set(prev).add(taskId))
    }

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      ;(document as unknown as { startViewTransition: (cb: () => void) => void }).startViewTransition(applyDrop)
    } else {
      applyDrop()
    }

    setTimeout(() => {
      setEnteringTaskIds((prev) => {
        const next = new Set(prev)
        next.delete(taskId)
        return next
      })
    }, 350)

    const { error } = await supabase
      .from('tasks')
      .update({ status: targetStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error dropping task into column:', error)
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: targetTask.status } : t))
      )
      alert(`Failed to update task: ${error.message}`)
    }
  }

  // 5. Sort Toggles Handler
  const handleToggleSort = (field: 'priority' | 'deadline') => {
    if (sortField !== field) {
      setSortField(field)
      // Due Date defaults to 'asc' (Soonest / Closest deadlines first!)
      // Priority defaults to 'desc' (Urgent -> High -> Medium -> Low)
      setSortDirection(field === 'deadline' ? 'asc' : 'desc')
    } else {
      if (field === 'deadline') {
        if (sortDirection === 'asc') {
          setSortDirection('desc')
        } else {
          setSortField(null)
        }
      } else {
        if (sortDirection === 'desc') {
          setSortDirection('asc')
        } else {
          setSortField(null)
        }
      }
    }
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterDept('all')
    setFilterAssignee('all')
    setSortField(null)
    setSortDirection('desc')
  }

  // 6. Filter, Search, and Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    }

    // Filter by Department
    if (filterDept !== 'all') {
      result = result.filter((t) => t.department_id === filterDept)
    }

    // Filter by Assignee
    if (filterAssignee === 'unassigned') {
      result = result.filter((t) => t.assigned_to === null)
    } else if (filterAssignee !== 'all') {
      result = result.filter((t) => t.assigned_to === filterAssignee)
    }

    // Sort
    if (sortField === 'priority') {
      result.sort((a, b) => {
        const weightA = PRIORITY_WEIGHTS[a.priority] || 0
        const weightB = PRIORITY_WEIGHTS[b.priority] || 0
        return sortDirection === 'desc' ? weightB - weightA : weightA - weightB
      })
    } else if (sortField === 'deadline') {
      result.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        const timeA = new Date(a.deadline).getTime()
        const timeB = new Date(b.deadline).getTime()
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA
      })
    }

    return result
  }, [tasks, searchQuery, filterDept, filterAssignee, sortField, sortDirection])

  // Overall Velocity / Completion Progress Metric
  const totalTasksCount = tasks.length
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length
  const completionPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-sm font-mono text-zinc-500">
        Loading operational Kanban pipeline...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="border-b border-zinc-800/80 pb-5 space-y-4">
        {/* Top Row: Workspace Heading, Velocity Meter & "+ New Task" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
                Kanban Pipeline
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Live Sync
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {workspaceName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Operational Velocity / Completion Progress Bar */}
            {totalTasksCount > 0 && (
              <div className="flex items-center gap-3 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3.5 py-2 shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-mono">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Velocity
                    </span>
                    <span className="text-zinc-200 font-bold">
                      {completedTasksCount} / {totalTasksCount} ({completionPercent}%)
                    </span>
                  </div>
                  <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCreateColumnStatus('todo')
                setIsCreateOpen(true)
              }}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Unified Filter Bar directly below the Heading (Left-Aligned) */}
        <FilterBar
          departments={departments}
          members={members}
          selectedDepartment={filterDept}
          onDepartmentChange={setFilterDept}
          selectedAssignee={filterAssignee}
          onAssigneeChange={setFilterAssignee}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortField={sortField}
          sortDirection={sortDirection}
          onToggleSort={handleToggleSort}
          onResetFilters={handleResetFilters}
          totalTasksCount={tasks.length}
          filteredTasksCount={filteredAndSortedTasks.length}
        />
      </div>

      {/* Kanban 3-Column Board with HTML5 Drag-and-Drop and Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => {
          const colTasks = filteredAndSortedTasks.filter((t) => t.status === col.id)
          const isOverThisCol = dragOverColumn === col.id

          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOverColumn !== col.id) {
                  setDragOverColumn(col.id)
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverColumn(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverColumn(null)
                const taskId = e.dataTransfer.getData('text/plain')
                if (taskId) {
                  handleDropTask(taskId, col.id)
                }
              }}
              className={`flex flex-col rounded-2xl border p-4 space-y-4 min-h-[550px] transition-all duration-150 ${
                isOverThisCol
                  ? 'border-zinc-500 bg-zinc-800/40 ring-1 ring-zinc-500/50 shadow-lg'
                  : 'border-zinc-800/80 bg-zinc-900/30'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                    {col.label}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    {col.countLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateColumnStatus(col.id)
                      setIsCreateOpen(true)
                    }}
                    className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    departments={departments}
                    currentColumnId={col.id}
                    onMoveTask={handleMoveTask}
                    onEditTask={(t) => setTaskToEdit(t)}
                    isMovingOut={movingOutTaskId === task.id ? movingDirection : null}
                    isEntering={enteringTaskIds.has(task.id)}
                  />
                ))}

                {colTasks.length === 0 && (
                  <div className="h-36 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-xl text-center p-4 space-y-2.5">
                    <span className="text-[11px] font-mono text-zinc-500">
                      No tasks in {col.label.toLowerCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateColumnStatus(col.id)
                        setIsCreateOpen(true)
                      }}
                      className="text-[11px] font-mono text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      + Add to {col.label}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Unified Task Modal for Creating or Editing/Deleting Tasks */}
      {(isCreateOpen || Boolean(taskToEdit)) && (
        <TaskModal
          key={taskToEdit ? `edit-${taskToEdit.id}` : `create-${createColumnStatus}`}
          isOpen={isCreateOpen || Boolean(taskToEdit)}
          onClose={() => {
            setIsCreateOpen(false)
            setTaskToEdit(null)
          }}
          taskToEdit={taskToEdit}
          initialStatus={createColumnStatus}
          workspaceId={workspace?.id || ''}
          tenureId={tenureId || ''}
          departments={departments}
          members={members}
          onTaskSaved={(savedTask) => {
            setTasks((prev) => {
              const exists = prev.some((t) => t.id === savedTask.id)
              if (exists) {
                return prev.map((t) => (t.id === savedTask.id ? savedTask : t))
              }
              return [savedTask, ...prev]
            })
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t.id !== deletedId))
          }}
        />
      )}
    </div>
  )
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm font-mono text-zinc-500">
          Loading Kanban pipeline...
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  )
}
