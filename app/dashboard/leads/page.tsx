'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LEAD_SOURCE_LABELS, LEAD_TYPE_LABELS, LEAD_TYPE_OPTIONS } from '@/lib/leads'

type LeadType = 'CANDIDATE' | 'PARTNER' | 'CLIENT'

type TalentLead = {
  id: string
  postId?: string | null
  leadType: LeadType
  source: 'MANUAL' | 'PUBLIC_FORM'
  name?: string
  accountName?: string
  organization?: string
  email?: string
  whatsapp?: string
  location?: string
  skills?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  post?: {
    id: string
    title?: string
    content: string
    writingMode: string
    createdAt: string
  } | null
}

type Post = {
  id: string
  title?: string
  content: string
  writingMode: string
  createdAt: string
}

type LeadFormData = {
  postId: string
  leadType: LeadType
  name: string
  accountName: string
  organization: string
  email: string
  whatsapp: string
  location: string
  skills: string
  notes: string
}

const defaultFormData: LeadFormData = {
  postId: '',
  leadType: 'CANDIDATE',
  name: '',
  accountName: '',
  organization: '',
  email: '',
  whatsapp: '',
  location: '',
  skills: '',
  notes: ''
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<TalentLead[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | LeadType>('ALL')
  const [skillFilter, setSkillFilter] = useState('ALL')
  const [locationFilter, setLocationFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<TalentLead | null>(null)
  const [formData, setFormData] = useState<LeadFormData>(defaultFormData)
  const router = useRouter()

  async function fetchData() {
    try {
      const token = localStorage.getItem('token')
      const leadsResponse = await fetch('/api/leads', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const postsResponse = await fetch('/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const leadsData = await leadsResponse.json()
      const postsData = await postsResponse.json()

      if (!leadsResponse.ok) {
        setError(leadsData.error || 'Gagal memuat leads')
        return
      }

      if (!postsResponse.ok) {
        setError(postsData.error || 'Gagal memuat posts')
        return
      }

      setLeads(leadsData)
      setPosts(postsData)
    } catch {
      setError('Gagal memuat data. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    queueMicrotask(() => {
      void fetchData()
    })
  }, [router])

  const parseSkills = (skills?: string) =>
    (skills || '')
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)

  const skillOptions = useMemo(
    () =>
      Array.from(new Set(leads.flatMap((lead) => parseSkills(lead.skills)))).sort((a, b) =>
        a.localeCompare(b, 'id-ID')
      ),
    [leads]
  )

  const locationOptions = useMemo(
    () =>
      Array.from(
        new Set(
          leads
            .map((lead) => lead.location?.trim())
            .filter((location): location is string => Boolean(location))
        )
      ).sort((a, b) => a.localeCompare(b, 'id-ID')),
    [leads]
  )

  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesType = typeFilter === 'ALL' || lead.leadType === typeFilter
        const matchesSkill =
          skillFilter === 'ALL' || parseSkills(lead.skills).some((skill) => skill === skillFilter)
        const matchesLocation =
          locationFilter === 'ALL' || (lead.location?.trim() ?? '') === locationFilter

        return matchesType && matchesSkill && matchesLocation
      }),
    [leads, typeFilter, skillFilter, locationFilter]
  )

  const resetFilters = () => {
    setTypeFilter('ALL')
    setSkillFilter('ALL')
    setLocationFilter('ALL')
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditingLead(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  const handleEdit = (lead: TalentLead) => {
    setEditingLead(lead)
    setFormData({
      postId: lead.postId || '',
      leadType: lead.leadType,
      name: lead.name || '',
      accountName: lead.accountName || '',
      organization: lead.organization || '',
      email: lead.email || '',
      whatsapp: lead.whatsapp || '',
      location: lead.location || '',
      skills: lead.skills || '',
      notes: lead.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus lead ini?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchData()
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch {
      setError('Gagal menghapus lead. Silakan coba lagi.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads'
      const method = editingLead ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        postId: formData.postId || null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        await fetchData()
        setShowModal(false)
        resetForm()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Gagal menyimpan lead. Silakan coba lagi.')
    }
  }

  const formatSourcePost = (lead: TalentLead) => {
    if (!lead.post) return 'Tanpa post sumber'
    return lead.post.title || lead.post.writingMode.replaceAll('_', ' ').toLowerCase()
  }

  const typeCounts = useMemo(
    () => ({
      CANDIDATE: leads.filter((lead) => lead.leadType === 'CANDIDATE').length,
      PARTNER: leads.filter((lead) => lead.leadType === 'PARTNER').length,
      CLIENT: leads.filter((lead) => lead.leadType === 'CLIENT').length
    }),
    [leads]
  )

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Pipeline</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola calon karyawan, mitra, dan prospek client dari semua sumber inbound.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Tambah Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="text-gray-600">Memuat leads...</div>
        </div>
      ) : error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="text-red-800">{error}</div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Total Lead</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{leads.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Calon Karyawan</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{typeCounts.CANDIDATE}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Mitra</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{typeCounts.PARTNER}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Prospek Client</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{typeCounts.CLIENT}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Filter Leads</h2>
                <p className="text-sm text-slate-500">Fokuskan data berdasarkan tipe, skill, dan lokasi.</p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
              >
                Reset Filter
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTypeFilter('ALL')}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  typeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Semua
              </button>
              {LEAD_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTypeFilter(option.value)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    typeFilter === option.value ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Skills</label>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Skills</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Lokasi</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Lokasi</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              Menampilkan <span className="font-semibold text-slate-900">{filteredLeads.length}</span> dari{' '}
              <span className="font-semibold text-slate-900">{leads.length}</span> lead.
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tipe</th>
                    <th className="px-4 py-3 font-medium">Kontak Utama</th>
                    <th className="px-4 py-3 font-medium">Organisasi</th>
                    <th className="px-4 py-3 font-medium">Lokasi</th>
                    <th className="px-4 py-3 font-medium">Skills / Kebutuhan</th>
                    <th className="px-4 py-3 font-medium">Sumber</th>
                    <th className="px-4 py-3 font-medium">Dibuat</th>
                    <th className="px-4 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                        Tidak ada lead yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="align-top hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 inline-flex">
                            {LEAD_TYPE_LABELS[lead.leadType]}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">{lead.name || '-'}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {lead.accountName ? `@${lead.accountName}` : 'Account tidak tersedia'}
                          </div>
                          <div className="mt-2 text-sm text-slate-700">{lead.email || '-'}</div>
                          <div className="mt-1 text-xs text-slate-500">{lead.whatsapp || '-'}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {lead.organization || '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {lead.location || '-'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex max-w-xs flex-wrap gap-2">
                            {parseSkills(lead.skills).length === 0 ? (
                              <span className="text-slate-500">-</span>
                            ) : (
                              parseSkills(lead.skills).map((skill) => (
                                <span
                                  key={`${lead.id}-${skill}`}
                                  className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700"
                                >
                                  {skill}
                                </span>
                              ))
                            )}
                          </div>
                          {lead.notes && (
                            <div className="mt-2 max-w-xs text-xs text-slate-500 line-clamp-3">{lead.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div>{LEAD_SOURCE_LABELS[lead.source]}</div>
                          <div className="mt-1 text-xs text-slate-500">{formatSourcePost(lead)}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          {new Date(lead.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEdit(lead)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(lead.id)}
                              className="text-sm font-medium text-red-600 hover:text-red-900"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                      {editingLead ? 'Edit Lead' : 'Tambah Lead'}
                    </h3>

                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Tipe Lead *</label>
                          <select
                            value={formData.leadType}
                            onChange={(e) => setFormData({ ...formData, leadType: e.target.value as LeadType })}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                          >
                            {LEAD_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Post Sumber</label>
                          <select
                            value={formData.postId}
                            onChange={(e) => setFormData({ ...formData, postId: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Tanpa post sumber</option>
                            {posts.map((post) => (
                              <option key={post.id} value={post.id}>
                                {(post.title || post.writingMode.replaceAll('_', ' ').toLowerCase()).slice(0, 60)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Nama lead"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Account</label>
                          <input
                            type="text"
                            value={formData.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="@username"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Organisasi / Perusahaan</label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Nama perusahaan, komunitas, atau organisasi"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="email@example.com"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                          <input
                            type="tel"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="+62812..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Lokasi</label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Jakarta, Indonesia"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Skills / Fokus Kebutuhan</label>
                          <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Python, Partnership, ERP, AI Strategy"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Catatan</label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={3}
                          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Konteks tambahan, kebutuhan, atau next step..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingLead ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
