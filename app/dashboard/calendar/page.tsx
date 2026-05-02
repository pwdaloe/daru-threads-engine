'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title?: string
  status: string
  scheduledAt?: string | null
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
          setError(data.error || 'Gagal memuat kalender')
          return
        }

        setPosts(data)
      } catch {
        setError('Gagal memuat kalender. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [router])

  const scheduledPosts = posts.filter((post) => post.scheduledAt)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalender Konten</h1>
        <p className="mt-1 text-sm text-gray-600">
          Lihat postingan yang telah dijadwalkan berdasarkan tanggal publikasi.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-600">Memuat kalender...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : scheduledPosts.length === 0 ? (
        <div className="text-gray-600">Belum ada postingan yang dijadwalkan.</div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((post) => (
            <div key={post.id} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">{new Date(post.scheduledAt!).toLocaleDateString('id-ID')}</p>
                  <h2 className="text-lg font-semibold text-gray-900">{post.title || 'Postingan tanpa judul'}</h2>
                </div>
                <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-800 text-sm">{post.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
