"use client"

import React from 'react'
import { ArrowUpDown, Calendar, X, Filter, Search } from 'lucide-react'
import { CustomDropdown, DropdownOption } from './CustomDropdown'
import { Department, Member } from './MemberOrgPicker'

export type SortField = 'priority' | 'deadline' | null
export type SortDirection = 'asc' | 'desc'

interface FilterBarProps {
  departments: Department[]
  members: Member[]
  selectedDepartment: string
  onDepartmentChange: (deptId: string) => void
  selectedAssignee: string
  onAssigneeChange: (assigneeId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  sortField: SortField
  sortDirection: SortDirection
  onToggleSort: (field: 'priority' | 'deadline') => void
  onResetFilters: () => void
  totalTasksCount: number
  filteredTasksCount: number
}

export function FilterBar({
  departments,
  members,
  selectedDepartment,
  onDepartmentChange,
  selectedAssignee,
  onAssigneeChange,
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onToggleSort,
  onResetFilters,
  totalTasksCount,
  filteredTasksCount,
}: FilterBarProps) {
  // Build Department Options
  const departmentOptions: DropdownOption[] = [
    { value: 'all', label: 'All Departments' },
    ...departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })),
  ]

  // Build Assignee Options
  const assigneeOptions: DropdownOption[] = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned Only' },
    ...members.map((member) => ({
      value: member.id,
      label: member.full_name,
      badge: member.role ? member.role.replace(/_/g, ' ') : undefined,
    })),
  ]

  const isFiltered =
    selectedDepartment !== 'all' ||
    selectedAssignee !== 'all' ||
    Boolean(searchQuery.trim()) ||
    sortField !== null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      {/* Left-aligned Filters Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center space-x-1.5 text-zinc-500 mr-1 text-xs font-mono">
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Search Bar Input */}
        <div className="relative min-w-[160px] max-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/90 pl-8 pr-7 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-2 text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 1. Department Filter Dropdown */}
        <CustomDropdown
          prefix="Dept:"
          value={selectedDepartment}
          options={departmentOptions}
          onChange={onDepartmentChange}
          className="min-w-[150px]"
        />

        {/* 2. Assignee Filter Dropdown */}
        <CustomDropdown
          prefix="Lead:"
          value={selectedAssignee}
          options={assigneeOptions}
          onChange={onAssigneeChange}
          className="min-w-[150px]"
        />

        {/* 3. Sort by Priority Toggle */}
        <button
          type="button"
          onClick={() => onToggleSort('priority')}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-mono transition-all cursor-pointer ${
            sortField === 'priority'
              ? 'border-zinc-500 bg-zinc-800 text-white shadow-sm font-semibold'
              : 'border-zinc-800/80 bg-zinc-900/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
          title="Toggle sorting by Priority"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
          <span>Priority</span>
          {sortField === 'priority' && (
            <span className="text-[10px] text-zinc-300 font-bold ml-0.5">
              {sortDirection === 'asc' ? '↑ Low-Urgent' : '↓ Urgent-Low'}
            </span>
          )}
        </button>

        {/* 4. Sort by Due Date Toggle */}
        <button
          type="button"
          onClick={() => onToggleSort('deadline')}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-mono transition-all cursor-pointer ${
            sortField === 'deadline'
              ? 'border-zinc-500 bg-zinc-800 text-white shadow-sm font-semibold'
              : 'border-zinc-800/80 bg-zinc-900/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
          }`}
          title="Toggle sorting by Due Date"
        >
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>Due Date</span>
          {sortField === 'deadline' && (
            <span className="text-[10px] text-zinc-300 font-bold ml-0.5">
              {sortDirection === 'asc' ? '↑ Soonest' : '↓ Latest'}
            </span>
          )}
        </button>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs font-mono text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            title="Reset all filters and sorting"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right-side Active Results Meta */}
      <div className="text-[11px] font-mono text-zinc-500">
        Showing <span className="text-zinc-300 font-bold">{filteredTasksCount}</span> of{' '}
        <span>{totalTasksCount}</span> tasks
      </div>
    </div>
  )
}
