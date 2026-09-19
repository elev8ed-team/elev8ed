"use client"

import React, { use } from "react"
import { useStoreState } from "@/lib/store"
import { ActivityLog } from "@/lib/types"
import {
  CheckCircle2,
  Users,
  Building2,
  Calendar,
  Megaphone,
  Layers,
} from "lucide-react"

export default function ActivityLogPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId

  const state = useStoreState()
  const activities = state.activityLogs.filter((a) => a.committeeId === committeeId)

  const getEntityIcon = (type: ActivityLog["entityType"]) => {
    switch (type) {
      case "task":
        return <CheckCircle2 className="h-4 w-4 text-lime-400" />
      case "member":
        return <Users className="h-4 w-4 text-cyan-400" />
      case "department":
        return <Building2 className="h-4 w-4 text-fuchsia-400" />
      case "event":
        return <Calendar className="h-4 w-4 text-amber-400" />
      case "announcement":
        return <Megaphone className="h-4 w-4 text-blue-400" />
      default:
        return <Layers className="h-4 w-4 text-neutral-400" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Bar */}
      <div className="border-b border-neutral-850 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">Central Audit Stream</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Immutable historical log of all operational events, roster changes, task executions, and broadcasts.
        </p>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-neutral-850 bg-neutral-950 p-6">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-xs">
            No activity records recorded yet.
          </div>
        ) : (
          <div className="relative border-l border-neutral-800 ml-4 space-y-6 py-2">
            {activities.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                {/* Node Dot */}
                <div className="absolute -left-2.5 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 border border-neutral-750 group-hover:border-lime-400 transition-colors">
                  {getEntityIcon(log.entityType)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <p className="text-xs text-neutral-200">
                      <strong className="text-white font-bold">{log.actorName}</strong>{" "}
                      <span className="text-neutral-400">{log.action}</span>{" "}
                      <span className="text-lime-300 font-semibold">&ldquo;{log.entityTitle}&rdquo;</span>
                    </p>

                    <span className="text-[10px] font-mono text-neutral-500">
                      {new Date(log.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span className="inline-block uppercase text-[9px] font-mono tracking-widest text-neutral-600">
                    ENTITY // {log.entityType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
