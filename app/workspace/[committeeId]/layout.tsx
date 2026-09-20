"use client"

import React, { use, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WorkspaceLayout({
  params,
}: {
  children: React.ReactNode
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const committeeId = resolvedParams.committeeId
  const router = useRouter()

  useEffect(() => {
    router.replace(`/dashboard?ws=${encodeURIComponent(committeeId)}`)
  }, [committeeId, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white font-mono text-xs">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
        <p className="text-zinc-500">Redirecting to operational dashboard...</p>
      </div>
    </div>
  )
}
