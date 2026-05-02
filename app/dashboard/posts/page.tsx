'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Analytics = {
  views: number
  likes: number
  replies: number
  reposts: number
}

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
  content: string
  writingMode: string
  status: string
  createdAt: string
  scheduledAt?: string | null
  _count?: {
    talentLeads?: number
  }
  analytics?: Analytics | null
  talentLeads?: TalentLead[]
}

type SortField = 'createdAt' | 'views' | 'likes' | 'replies' | 'reposts'

type FormData = {
  title: string
  content: string
  writingMode: string
  status: string
  scheduledAt: string
  views: number
  likes: number
  replies: number
  reposts: number
}

type SavePostPayload = Omit<FormData, 'scheduledAt'> & {
  scheduledAt: string | null
  postId?: string
}

const defaultFormData: FormData = {
  title: '',
  content: '',
  writingMode: 'PERSONAL_BRANDING',
  status: 'IDEA',
  scheduledAt: '',
  views: 0,
  likes: 0,
  replies: 0,
  reposts: 0,
}

const writingModeOptions = [
  { value: 'PERSONAL_BRANDING', label: 'Personal Branding' },
  { value: 'AI_TALENT_FUNNEL', label: 'AI Talent Funnel' },
  { value: 'HIRING', label: 'Hiring' },
  { value: 'BUSINESS_INSIGHT', label: 'Business Insight' },
  { value: 'REWRITE', label: 'Rewrite' }
]

const statusOptions = [
  { value: 'IDEA', label: 'Idea' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'POSTED', label: 'Posted' }
]

const formatNumber = (value: number) => value.toLocaleString('en-US')

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [editPostId, setEditPostId] = useState<string | null>(null)
  const [formStatus, setFormStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | Post['status']>('ALL')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Gagal memuat konten')
          return
        }

        setPosts(data)
      } catch {
        setError('Gagal memuat konten. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [router])

  const sortedPosts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filteredPosts = posts.filter((post) => {
      const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter
      const matchesSearch =
        normalizedQuery.length === 0 ||
        (post.title ?? '')?.toLowerCase().includes(normalizedQuery) ||
        post.content.toLowerCase().includes(normalizedQuery)
      return matchesStatus && matchesSearch
    })

    return [...filteredPosts].sort((a, b) => {
      const getValue = (post: Post) => {
        if (sortBy === 'createdAt') {
          return new Date(post.createdAt).getTime()
        }
        return post.analytics?.[sortBy] ?? 0
      }

      const aValue = getValue(a)
      const bValue = getValue(b)
      if (aValue === bValue) return 0
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    })
  }, [posts, searchQuery, statusFilter, sortBy, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(field)
    setSortDirection('desc')
  }

  const handleFormChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(defaultFormData)
    setEditPostId(null)
    setFormStatus('idle')
  }

  const handleSavePost = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth/login')
      return
    }

    if (!formData.content || !formData.writingMode) {
      setFormStatus('error')
      return
    }

    setFormStatus('saving')
    const method = editPostId ? 'PATCH' : 'POST'
    const payload: SavePostPayload = {
      title: formData.title,
      content: formData.content,
      writingMode: formData.writingMode,
      status: formData.status,
      scheduledAt: formData.scheduledAt || null,
      views: formData.views,
      likes: formData.likes,
      replies: formData.replies,
      reposts: formData.reposts
    }

    if (editPostId) payload.postId = editPostId

    try {
      const response = await fetch('/api/posts', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        setFormStatus('error')
        return
      }

      if (editPostId) {
        const updatedPost = {
          ...data.post,
          analytics: data.analytics ?? data.post.analytics
        }
        setPosts((prev) => prev.map((post) => (post.id === editPostId ? updatedPost : post)))
      } else {
        setPosts((prev) => [data, ...prev])
      }

      setFormStatus('saved')
      resetForm()
    } catch {
      setFormStatus('error')
    }
  }

  const handleEdit = (post: Post) => {
    setEditPostId(post.id)
    setFormData({
      title: post.title ?? '',
      content: post.content,
      writingMode: post.writingMode,
      status: post.status,
      scheduledAt: post.scheduledAt ? post.scheduledAt.split('T')[0] : '',
      views: post.analytics?.views ?? 0,
      likes: post.analytics?.likes ?? 0,
      replies: post.analytics?.replies ?? 0,
      reposts: post.analytics?.reposts ?? 0
    })
    setFormStatus('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Konten</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tambah, edit, dan monitor konten Threads dengan metrik manual.
        </p>
      </div>

      {loading && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          Memuat daftar konten...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editPostId ? 'Edit Konten Threads' : 'Tambah Konten Threads Baru'}
            </h2>
            <p className="text-sm text-gray-500">
              Isi detail konten, status, jadwal, dan metrik secara manual.
            </p>
          </div>
          {editPostId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              Batal Edit
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Judul (opsional)</label>
            <input
              value={formData.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Judul konten"
            />

            <label className="block text-sm font-medium text-slate-700">Konten</label>
            <textarea
              value={formData.content}
              onChange={(e) => handleFormChange('content', e.target.value)}
              rows={5}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Tulis konten Threads di sini..."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mode Penulisan</label>
                <select
                  value={formData.writingMode}
                  onChange={(e) => handleFormChange('writingMode', e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {writingModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Jadwal Publikasi</label>
              <input
                type="date"
                value={formData.scheduledAt}
                onChange={(e) => handleFormChange('scheduledAt', e.target.value)}
                className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">Metrik Awal</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(['views', 'likes', 'replies', 'reposts'] as const).map((field) => (
                  <label key={field} className="block text-sm font-medium text-slate-700">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    <input
                      type="number"
                      min={0}
                      value={formData[field]}
                      onChange={(e) => handleFormChange(field, Number(e.target.value))}
                      className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSavePost}
                disabled={formStatus === 'saving'}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editPostId ? 'Update Konten' : 'Tambah Konten'}
              </button>
              {formStatus === 'saved' && <span className="text-sm text-green-600">Sukses disimpan</span>}
              {formStatus === 'error' && <span className="text-sm text-red-600">Periksa kembali data</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daftar Konten</h2>
            <p className="text-sm text-gray-500">Urutkan dan cari konten berdasarkan metrik, status, atau kata kunci.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau isi konten..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-[320px]"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | Post['status'])}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-[180px]"
            >
              <option value="ALL">Semua Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleSort(sortBy)}
              className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200"
            >
              {sortBy === 'createdAt' ? 'Tanggal' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} • {sortDirection}
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('views')}>
                  Views
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('likes')}>
                  Likes
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('replies')}>
                  Replies
                </th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('reposts')}>
                  Reposts
                </th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedPosts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium text-slate-900">{post.title || 'Tanpa judul'}</div>
                    <div className="mt-1 text-slate-900 line-clamp-2">{post.content}</div>
                  </td>
                  <td className="px-4 py-4 align-top text-slate-700">{post.status}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{post.writingMode}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{formatNumber(post.analytics?.views ?? 0)}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{formatNumber(post.analytics?.likes ?? 0)}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{formatNumber(post.analytics?.replies ?? 0)}</td>
                  <td className="px-4 py-4 align-top text-slate-700">{formatNumber(post.analytics?.reposts ?? 0)}</td>
                  <td className="px-4 py-4 align-top">
                    <button
                      type="button"
                      onClick={() => handleEdit(post)}
                      className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
