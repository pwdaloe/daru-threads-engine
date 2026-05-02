'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type TalentLead = {
  id: string
  name: string
  email: string
  source: string
  notes: string
}

type Post = {
  id: string
  title?: string
  talentLeads?: TalentLead[]
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<TalentLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Gagal memuat talent leads')
          return
        }

        const allLeads = data.reduce((acc: TalentLead[], post: Post) => {
          if (post.talentLeads?.length) {
            return [...acc, ...post.talentLeads.map((lead) => ({ ...lead }))]
          }
          return acc
        }, [])

        setLeads(allLeads)
      } catch {
        setError('Gagal memuat talent leads. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [router])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Talent Leads</h1>
        <p className="mt-1 text-sm text-gray-600">
          Daftar kontak talenta yang terkumpul dari engagement konten.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-600">Memuat lead...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : leads.length === 0 ? (
        <div className="text-gray-600">Belum ada lead talenta untuk ditampilkan.</div>
      ) : (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.email}</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-800 text-sm">{lead.source}</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">{lead.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
