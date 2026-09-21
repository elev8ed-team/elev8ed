"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

interface CertificateTemplate {
  id: string
  title: string
  issuer: string
  issuedCount: number
  lastIssued: string
  status: 'active' | 'draft'
}

const TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-1',
    title: 'CertiSwift Workshop Completion Credential',
    issuer: 'Technical & Web Department',
    issuedCount: 142,
    lastIssued: 'Sep 18, 2026',
    status: 'active',
  },
  {
    id: 'cert-2',
    title: 'Annual Hackathon Finalist Honor',
    issuer: 'Elev8Ed Organizing Core',
    issuedCount: 36,
    lastIssued: 'Aug 29, 2026',
    status: 'active',
  },
  {
    id: 'cert-3',
    title: 'Tenure Merit Certificate (2025-2026 Cycle)',
    issuer: 'Executive Council',
    issuedCount: 24,
    lastIssued: 'May 12, 2026',
    status: 'active',
  },
]

function VaultContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('ws')

  const [workspaceName, setWorkspaceName] = useState('Workspace Vault')
  const [recipientName, setRecipientName] = useState('Devendra Sharma')
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(TEMPLATES[0])
  const [copiedLink, setCopiedLink] = useState(false)

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

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(`https://elev8ed.app/verify/E8-CERT-${Date.now().toString(36).toUpperCase()}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
              CertiSwift Vault
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-2">
            {workspaceName}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={copyVerifyLink}
            className="rounded-lg bg-zinc-900 border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? 'Verification Link Copied ✓' : 'Copy Verify URL'}
          </button>
          <button
            onClick={() => alert('Batch certificate generation triggered!')}
            className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-zinc-200 transition-colors shadow cursor-pointer"
          >
            + Issue Batch
          </button>
        </div>
      </div>

      {/* Main Grid: Template Selector + Live Certificate Canvas Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Template List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            Active Credential Templates
          </h2>

          <div className="space-y-3">
            {TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`rounded-xl border p-4.5 space-y-2 cursor-pointer transition-all ${
                  selectedTemplate.id === tmpl.id
                    ? 'border-white bg-zinc-900/80 shadow-md'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                    {tmpl.issuer}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {tmpl.issuedCount} Issued
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-100">{tmpl.title}</h3>
                <p className="text-[11px] font-mono text-zinc-500">Last activity: {tmpl.lastIssued}</p>
              </div>
            ))}
          </div>

          {/* Test Recipient Input */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4 space-y-2 mt-4">
            <label className="text-[11px] font-mono uppercase text-zinc-400">
              Live Preview Recipient
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Candidate Name"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
            />
          </div>
        </div>

        {/* Right Column: High-Fidelity Certificate Mockup (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 flex flex-col justify-between space-y-8 relative overflow-hidden">
          
          {/* Certificate Inner Canvas */}
          <div className="rounded-xl border-2 border-zinc-800 bg-zinc-950 p-8 sm:p-10 space-y-6 relative shadow-2xl">
            {/* Corner Accents */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-zinc-600" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-zinc-600" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-zinc-600" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-zinc-600" />

            <div className="text-center space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Official Credential of Achievement
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
                {selectedTemplate.title}
              </h2>
            </div>

            <div className="text-center space-y-1 pt-4">
              <p className="text-xs text-zinc-400 font-mono">This document is proudly presented to</p>
              <h3 className="text-2xl font-bold text-white tracking-wide border-b border-zinc-800 pb-2 inline-block px-8">
                {recipientName || 'Recipient Name'}
              </h3>
            </div>

            <p className="text-center text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              In recognition of active participation, exemplary performance, and outstanding contributions during the 2026-2027 operational cycle.
            </p>

            {/* Signature & Verification Hash Footer */}
            <div className="flex items-end justify-between pt-8 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-500">
              <div className="space-y-1">
                <div className="h-0.5 w-24 bg-zinc-700" />
                <span>Authorized Signatory</span>
              </div>

              <div className="text-right space-y-0.5">
                <div className="text-zinc-400 font-bold">SHA-256 VERIFIED</div>
                <div className="text-zinc-600">ID: E8-CERT-2026-9F8A</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-zinc-500 border-t border-zinc-800/60 pt-4">
            <span>CertiSwift Automated Engine v2.4</span>
            <span className="text-zinc-300">Format: Cryptographic PDF / Vector SVG</span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default function VaultPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm font-mono text-zinc-500">Loading credential vault...</div>
      }
    >
      <VaultContent />
    </Suspense>
  )
}
