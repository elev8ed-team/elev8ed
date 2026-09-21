"use client"

import React, { useState } from 'react'
import { TaskItem, TaskStatus } from './TaskModal'
import { Department } from './MemberOrgPicker'

// 6 Exact Hex Palettes aligned with app/dashboard/page.tsx
const DEPARTMENT_PALETTES = [
  { name: 'Red',   bg: '#201314', side: '#FF9592', heading: '#611623', text: '#FFD1D9' },
  { name: 'Cyan',  bg: '#101B20', side: '#4CCCE6', heading: '#004558', text: '#B6ECF7' },
  { name: 'Jade',  bg: '#121C18', side: '#1FD8A4', heading: '#114837', text: '#ADF0D4' },
  { name: 'Plum',  bg: '#201320', side: '#E796F3', heading: '#512454', text: '#F4D4F4' },
  { name: 'Amber', bg: '#1D180F', side: '#FFCA16', heading: '#4D3000', text: '#FFE7B3' },
  { name: 'Lime',  bg: '#151A10', side: '#BDE56C', heading: '#334423', text: '#E3F7BA' },
]

function getDepartmentTheme(departmentId: string | null, departments: Department[]) {
  if (!departmentId) return DEPARTMENT_PALETTES[0]
  const index = departments.findIndex((d) => d.id === departmentId)
  const safeIndex = index >= 0 ? index : 0
  return DEPARTMENT_PALETTES[safeIndex % DEPARTMENT_PALETTES.length]
}

function getDeadlineStatus(deadline: string | null, status: TaskStatus): {
  type: 'overdue' | 'today' | 'tomorrow' | 'upcoming' | null
  label: string
} {
  if (!deadline || status === 'done') return { type: null, label: '' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(deadline)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays)
    return {
      type: 'overdue',
      label: daysAgo === 1 ? 'Overdue 1d' : `Overdue ${daysAgo}d`,
    }
  } else if (diffDays === 0) {
    return { type: 'today', label: 'Due Today' }
  } else if (diffDays === 1) {
    return { type: 'tomorrow', label: 'Due Tomorrow' }
  }
  return { type: 'upcoming', label: '' }
}

interface TaskCardProps {
  task: TaskItem
  departments: Department[]
  currentColumnId: TaskStatus
  onMoveTask: (taskId: string, direction: 'next' | 'prev') => void
  onEditTask: (task: TaskItem) => void
  isMovingOut?: 'next' | 'prev' | null
  isEntering?: boolean
}

export function TaskCard({
  task,
  departments,
  currentColumnId,
  onMoveTask,
  onEditTask,
  isMovingOut = null,
  isEntering = false,
}: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const theme = getDepartmentTheme(task.department_id, departments)
  const deadlineInfo = getDeadlineStatus(task.deadline, task.status)

  // Compute animation classes for professional non-teleporting movement
  let animClass = 'opacity-100 translate-x-0 scale-100 transition-all duration-200 ease-out'
  if (isMovingOut === 'next') {
    animClass = 'opacity-0 translate-x-12 scale-95 transition-all duration-200 ease-out pointer-events-none'
  } else if (isMovingOut === 'prev') {
    animClass = 'opacity-0 -translate-x-12 scale-95 transition-all duration-200 ease-out pointer-events-none'
  } else if (isEntering) {
    animClass = 'animate-in fade-in-0 slide-in-from-left-4 duration-300 ease-out'
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => {
        setIsDragging(false)
      }}
      onClick={() => onEditTask(task)}
      style={{
        backgroundColor: theme.bg,
        borderLeftColor: theme.side,
      }}
      className={`group rounded-xl border border-zinc-800/80 border-l-[4px] p-4 space-y-3 hover:border-zinc-700 hover:scale-[1.01] transition-all shadow-sm flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative ${animClass} ${
        isDragging ? 'opacity-40 scale-95 ring-2 ring-zinc-500' : ''
      }`}
    >
      <div className="space-y-2">
        {/* Top Row: Department Badge, Priority, and Overdue Alert */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 truncate">
            <span
              style={{ backgroundColor: theme.side }}
              className="h-1.5 w-1.5 rounded-full shadow-sm shrink-0"
            />
            <span
              style={{
                backgroundColor: theme.heading,
                color: theme.side,
                borderColor: theme.side + '40',
              }}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border truncate max-w-[130px]"
            >
              {task.departments?.name || 'General'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Overdue / Imminent Deadline Badge */}
            {deadlineInfo.type === 'overdue' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950 border border-red-800/70 text-red-300 font-bold flex items-center gap-1 animate-pulse">
                ⚠️ {deadlineInfo.label}
              </span>
            )}
            {deadlineInfo.type === 'today' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800/70 text-amber-300 font-bold flex items-center gap-1">
                ⏱ {deadlineInfo.label}
              </span>
            )}
            {deadlineInfo.type === 'tomorrow' && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold flex items-center gap-1">
                ⏱ {deadlineInfo.label}
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                task.priority === 'urgent'
                  ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                  : task.priority === 'high'
                  ? 'bg-orange-950/60 text-orange-400 border border-orange-800/40'
                  : task.priority === 'medium'
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {task.priority}
            </span>
          </div>
        </div>

        {/* Title Styled with Theme Text Color */}
        <p
          style={{ color: theme.text }}
          className="text-xs font-semibold line-clamp-2 leading-relaxed group-hover:underline decoration-zinc-600 underline-offset-2"
        >
          {task.title}
        </p>

        {/* Optional Description */}
        {task.description && (
          <p className="text-[11px] text-zinc-400 line-clamp-2 font-mono">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer: Assignee, Due Date, and Transition Buttons */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/50">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
          <span className="truncate max-w-[140px]">
            👤 {task.assigned_member?.full_name || 'Unassigned'}
          </span>
          {task.deadline && (
            <span className="text-[10px] text-zinc-500 shrink-0">
              ⏱ {new Date(task.deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Step Movement Actions ('todo' <-> 'in_progress' <-> 'done') */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveTask(task.id, 'prev')
            }}
            disabled={currentColumnId === 'todo'}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800/60"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors hidden sm:inline">
              drag or
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMoveTask(task.id, 'next')
              }}
              disabled={currentColumnId === 'done'}
              style={currentColumnId !== 'done' ? { color: theme.side } : undefined}
              className="text-[10px] font-mono font-bold text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-800/60"
            >
              Advance →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
