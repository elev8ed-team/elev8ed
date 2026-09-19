"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { store } from "@/lib/store"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    const userCommittees = store.getUserCommittees()
    if (userCommittees.length > 0) {
      router.replace(`/workspace/${userCommittees[0].id}/overview`)
    } else {
      router.replace("/onboarding")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
        <p className="text-xs font-mono text-neutral-400">Loading your committee workspace...</p>
      </div>
    </div>
  )
}
