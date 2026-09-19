"use client"

import React, { useState, use } from "react"
import { store, useStoreState } from "@/lib/store"
import { hasPermission } from "@/lib/permissions"
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  Clock,
  X,
} from "lucide-react"

export default function EventsPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const events = state.events.filter((e) => e.committeeId === committeeId)
  const departments = state.departments.filter((d) => d.committeeId === committeeId)
  const currentMembership = state.members.find(
    (m) => m.committeeId === committeeId && m.userId === state.currentUser.id
  )

  // Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventDesc, setEventDesc] = useState("")
  const [eventVenue, setEventVenue] = useState("")
  const [eventDept, setEventDept] = useState("")
  const [eventStart, setEventStart] = useState("")
  const [eventEnd, setEventEnd] = useState("")

  const canCreateEvent = hasPermission(currentMembership?.role, "event:create")

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim() || !eventVenue.trim()) return

    store.createEvent({
      committeeId,
      departmentId: eventDept || undefined,
      title: eventTitle.trim(),
      description: eventDesc.trim() || undefined,
      venue: eventVenue.trim(),
      startTime: eventStart || new Date().toISOString(),
      endTime: eventEnd || new Date(Date.now() + 7200000).toISOString(),
    })

    setEventTitle("")
    setEventDesc("")
    setEventVenue("")
    setEventStart("")
    setEventEnd("")
    setCreateModalOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-850 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Event Operations & Schedule</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Coordinate flagship festivals, technical workshops, rehearsals, and general body committee meetings.
          </p>
        </div>

        {canCreateEvent && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-lime-300 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {events.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-neutral-850 bg-neutral-950 p-12 text-center space-y-3">
            <CalendarIcon className="h-10 w-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-bold text-white">No scheduled events</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Schedule an event, technical workshop, or meeting to coordinate committee activities.
            </p>
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6 space-y-4 hover:border-neutral-700 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-[10px] font-mono text-lime-400">
                    {evt.departmentName || "All-Committee Event"}
                  </span>

                  <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                    {evt.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight group-hover:text-lime-400 transition-colors">
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="border-t border-neutral-900 pt-3 space-y-1.5 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-neutral-500" />
                  <span>
                    {new Date(evt.startTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-white">Schedule Committee Event</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Technical Symposium, Stage Play Rehearsal"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-neutral-400">Description & Agenda</label>
                <textarea
                  rows={3}
                  placeholder="Event schedule, audience, and requirements..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Venue / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Hall B"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder-neutral-600 focus:border-lime-400 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Department</label>
                  <select
                    value={eventDept}
                    onChange={(e) => setEventDept(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  >
                    <option value="">All-Committee</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">Start Date / Time</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full rounded-lg border border-neutral-800 bg-black px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-neutral-400">End Date / Time</label>
                  <input
                    type="datetime-local"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
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
