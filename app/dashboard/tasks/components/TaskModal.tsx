"use client"

import React, { useState } from 'react'
import { X, Trash2, Users } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import { CustomDropdown, DropdownOption } from './CustomDropdown'
import { MemberOrgPicker, Member, Department } from './MemberOrgPicker'

function formatDeadlineForInput(isoString: string | null | undefined): string {
  if (!isoString) return ''
  return isoString.split('T')[0].split(' ')[0]
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface TaskItem {
  id: string
  workspace_id: string
  tenure_id: string
  department_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigned_to: string | null
  created_by: string | null
  deadline: string | null
  created_at: string
  departments?: {
    id: string
    name: string
  } | null
  assigned_member?: {
    id: string
    full_name: string
  } | null
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  taskToEdit?: TaskItem | null
  initialStatus?: TaskStatus
  workspaceId: string
  tenureId: string
  departments: Department[]
  members: Member[]
  onTaskSaved: (task: TaskItem) => void
  onTaskDeleted?: (taskId: string) => void
}

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: 'urgent', label: 'Urgent', badge: 'High Alert' },
  { value: 'high', label: 'High', badge: 'P1' },
  { value: 'medium', label: 'Medium', badge: 'P2' },
  { value: 'low', label: 'Low', badge: 'P3' },
]

const STATUS_OPTIONS: DropdownOption[] = [
  { value: 'todo', label: 'To Do', badge: 'Queue' },
  { value: 'in_progress', label: 'In Progress', badge: 'Active' },
  { value: 'done', label: 'Done', badge: 'Completed' },
]

export function TaskModal({
  isOpen,
  onClose,
  taskToEdit,
  initialStatus = 'todo',
  workspaceId,
  tenureId,
  departments,
  members,
  onTaskSaved,
  onTaskDeleted,
}: TaskModalProps) {
  const isEditing = Boolean(taskToEdit)

  const [title, setTitle] = useState(taskToEdit?.title || '')
  const [description, setDescription] = useState(taskToEdit?.description || '')
  const [departmentId, setDepartmentId] = useState<string>(
    taskToEdit?.department_id || (departments[0]?.id ?? ''),
  )
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'medium')
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || initialStatus)
  const [assignedTo, setAssignedTo] = useState<string | null>(taskToEdit?.assigned_to || null)
  const [deadline, setDeadline] = useState(formatDeadlineForInput(taskToEdit?.deadline))

  const [showOrgPicker, setShowOrgPicker] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const dateInputRef = React.useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const departmentOptions: DropdownOption[] = [
    { value: '', label: 'General' },
    ...departments.map((d) => ({
      value: d.id,
      label: d.name,
    })),
  ]

  const selectedMember = members.find((m) => m.id === assignedTo)
  const assigneeDisplayName =
    selectedMember?.full_name ||
    (taskToEdit && taskToEdit.assigned_to === assignedTo
      ? taskToEdit.assigned_member?.full_name
      : null) ||
    'Unassigned'
  const assigneeInitial =
    assigneeDisplayName !== 'Unassigned'
      ? assigneeDisplayName.charAt(0).toUpperCase()
      : '∅'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      let parsedDeadline: string | null = null
      if (deadline) {
        try {
          const d = new Date(deadline)
          if (!isNaN(d.getTime())) {
            parsedDeadline = d.toISOString()
          }
        } catch {
          parsedDeadline = null
        }
      }

      if (isEditing && taskToEdit) {
        // UPDATE existing task
        const updatePayload = {
          title: title.trim(),
          description: description.trim() || null,
          department_id: departmentId || null,
          priority,
          status,
          assigned_to: assignedTo,
          deadline: parsedDeadline,
        }

        const { data, error } = await supabase
          .from('tasks')
          .update(updatePayload)
          .eq('id', taskToEdit.id)
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
          .single()

        if (error) {
          console.error('Error updating task:', error)
          alert(`Failed to update task: ${error.message}`)
          return
        }

        if (data) {
          onTaskSaved(data as unknown as TaskItem)
        }
      } else {
        // INSERT new task
        const insertPayload = {
          workspace_id: workspaceId,
          tenure_id: tenureId,
          department_id: departmentId || (departments[0]?.id ?? null),
          title: title.trim(),
          description: description.trim() || null,
          status: status || initialStatus || ('todo' as const),
          priority,
          assigned_to: assignedTo,
          deadline: parsedDeadline,
        }

        const { data, error } = await supabase
          .from('tasks')
          .insert(insertPayload)
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
          .single()

        if (error) {
          console.error('Error creating task:', error)
          alert(`Failed to create task: ${error.message}`)
          return
        }

        if (data) {
          onTaskSaved(data as unknown as TaskItem)
        }
      }

      onClose()
    } catch (err) {
      console.error('Unexpected error submitting task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!taskToEdit) return

    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskToEdit.id)

      if (error) {
        console.error('Error deleting task:', error)
        alert(`Failed to delete task: ${error.message}`)
        return
      }

      if (onTaskDeleted) {
        onTaskDeleted(taskToEdit.id)
      }
      onClose()
    } catch (err) {
      console.error('Unexpected error deleting task:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {isEditing ? 'Task Details' : 'New Operational Task'}
            </span>
            {isEditing && (
              <span className="text-[11px] font-mono text-zinc-500">
                #{taskToEdit?.id.slice(0, 8)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Finalize sponsorship deck with Dean"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all font-sans"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Description / Notes
            </label>
            <textarea
              placeholder="Add deliverables, requirements, or contextual notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 transition-all font-sans resize-none"
            />
          </div>

          {/* Custom Dropdowns Row: Department, Priority, and Status (if editing) */}
          <div className={`grid gap-3 ${isEditing ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <CustomDropdown
              label="Department"
              value={departmentId}
              options={departmentOptions}
              onChange={(val) => setDepartmentId(val)}
              placeholder="Select department"
              className="w-full"
            />

            <CustomDropdown
              label="Priority"
              value={priority}
              options={PRIORITY_OPTIONS}
              onChange={(val) => setPriority(val as TaskPriority)}
              className="w-full"
            />

            {isEditing && (
              <CustomDropdown
                label="Kanban Stage"
                value={status}
                options={STATUS_OPTIONS}
                onChange={(val) => setStatus(val as TaskStatus)}
                className="w-full"
              />
            )}
          </div>

          {/* Due Date & Assignee Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Due Date
              </label>
              <div 
                onClick={() => {
                  try {
                    dateInputRef.current?.showPicker?.()
                  } catch {
                    dateInputRef.current?.focus()
                  }
                }}
                className="relative cursor-pointer"
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onClick={(e) => {
                    try {
                      e.currentTarget.showPicker?.()
                    } catch {}
                  }}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600 [color-scheme:dark] transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Current Assignee Card & Toggle Org Picker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Assigned Lead
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-between p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs font-mono truncate">
                  <div className="flex items-center space-x-2 truncate">
                    <div className="h-5 w-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-300 shrink-0">
                      {assigneeInitial}
                    </div>
                    <span className="truncate text-zinc-200">
                      {assigneeDisplayName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOrgPicker(!showOrgPicker)}
                  className={`px-3 py-2 rounded-xl border text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    showOrgPicker
                      ? 'border-white bg-white text-zinc-950 font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {showOrgPicker ? 'Done' : 'Select'}
                </button>
              </div>
            </div>
          </div>

          {/* Hierarchical Member Org Picker (Tiered Graph View) */}
          {showOrgPicker && (
            <div className="pt-2 animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase text-zinc-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-zinc-400" />
                  Hierarchical Org Matrix (Select Assignee)
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {members.length} members in workspace
                </span>
              </div>
              <MemberOrgPicker
                members={members}
                departments={departments}
                selectedMemberId={assignedTo}
                onSelectMember={(mId) => {
                  setAssignedTo(mId)
                }}
              />
            </div>
          )}

          {/* Action Buttons & Delete */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  confirmDelete
                    ? 'border-red-500 bg-red-950 text-red-300 animate-pulse font-bold'
                    : 'border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-900/50'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{confirmDelete ? 'Confirm Delete?' : 'Delete Task'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 px-3.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-white px-4 py-1.5 text-xs font-mono font-bold text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

