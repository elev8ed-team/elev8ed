"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function WorkspaceIndexPage({
  params,
}: {
  params: Promise<{ committeeId: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()

  useEffect(() => {
    router.replace(`/workspace/${resolvedParams.committeeId}/overview`)
  }, [resolvedParams.committeeId, router])

  return null
}
