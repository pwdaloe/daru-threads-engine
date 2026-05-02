'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type TalentLead = {
  id: string
  postId: string
  name?: string
  accountName?: string
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
  }
}

type Post = {
  id: string
  title?: string
  content: string
  writingMode: string
  createdAt: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<TalentLead[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<TalentLead | null>(null)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    postId: '',
    name: '',
    accountName: '',
    email: '',
    whatsapp: '',
    location: '',
    skills: '',
    notes: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')

      // Fetch leads
      const leadsResponse = await fetch('/api/leads', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Fetch posts for dropdown
      const postsResponse = await fetch('/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const leadsData = await leadsResponse.json()
      const postsData = await postsResponse.json()

      if (!leadsResponse.ok) {
        setError(leadsData.error || 'Gagal memuat talent leads')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('token')
      const url = editingLead ? `/api/leads/${editingLead.id}` : '/api/leads'
      const method = editingLead ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
      setError('Gagal menyimpan talent lead. Silakan coba lagi.')
    }
  }

  const handleEdit = (lead: TalentLead) => {
    setEditingLead(lead)
    setFormData({
      postId: lead.postId,
      name: lead.name || '',
      accountName: lead.accountName || '',
      email: lead.email || '',
      whatsapp: lead.whatsapp || '',
      location: lead.location || '',
      skills: lead.skills || '',
      notes: lead.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus talent lead ini?')) return

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
      setError('Gagal menghapus talent lead. Silakan coba lagi.')
    }
  }

  const resetForm = () => {
    setFormData({
      postId: '',
      name: '',
      accountName: '',
      email: '',
      whatsapp: '',
      location: '',
      skills: '',
      notes: ''
    })
    setEditingLead(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Talent Leads</h1>
            <p className="mt-1 text-sm text-gray-600">
              Kelola kandidat talenta yang terkumpul dari engagement konten Threads.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Tambah Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-600">Memuat talent leads...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-red-800">{error}</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <li className="px-6 py-8 text-center text-gray-500">
                Belum ada talent leads. Klik "Tambah Lead" untuk memulai.
              </li>
            ) : (
              leads.map((lead) => (
                <li key={lead.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-medium text-gray-900 truncate">
                            {lead.name || 'Nama tidak tersedia'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            @{lead.accountName || 'Account tidak tersedia'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        {lead.email && (
                          <div>
                            <span className="font-medium">Email:</span> {lead.email}
                          </div>
                        )}
                        {lead.whatsapp && (
                          <div>
                            <span className="font-medium">WhatsApp:</span> {lead.whatsapp}
                          </div>
                        )}
                        {lead.location && (
                          <div>
                            <span className="font-medium">Lokasi:</span> {lead.location}
                          </div>
                        )}
                        {lead.skills && (
                          <div>
                            <span className="font-medium">Skills:</span> {lead.skills}
                          </div>
                        )}
                      </div>

                      {lead.notes && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {lead.notes}
                        </p>
                      )}

                      <div className="mt-2 text-xs text-gray-400">
                        Dibuat: {new Date(lead.createdAt).toLocaleDateString('id-ID')}
                        {lead.post && (
                          <span className="ml-4">
                            Dari post: {lead.post.writingMode.replace('_', ' ').toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                        {editingLead ? 'Edit Talent Lead' : 'Tambah Talent Lead'}
                      </h3>

                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Post Sumber *
                          </label>
                          <select
                            value={formData.postId}
                            onChange={(e) => setFormData({ ...formData, postId: e.target.value })}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            required
                          >
                            <option value="">Pilih post sumber...</option>
                            {posts.map((post) => (
                              <option key={post.id} value={post.id}>
                                {post.writingMode.replace('_', ' ').toLowerCase()} - {new Date(post.createdAt).toLocaleDateString('id-ID')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Lengkap
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Nama kandidat"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nama Account
                            </label>
                            <input
                              type="text"
                              value={formData.accountName}
                              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="@username"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="email@example.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              WhatsApp
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Lokasi
                            </label>
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Jakarta, Indonesia"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Skills
                            </label>
                            <input
                              type="text"
                              value={formData.skills}
                              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Python, React, AI/ML"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Catatan
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Catatan tambahan tentang kandidat..."
                          />
                        </div>
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
