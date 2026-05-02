'use client'

import { useEffect, useState, useCallback } from 'react'

interface Post {
  id: string
  title?: string
  content: string
  status: string
  writingMode: string
  createdAt: string
  scheduledAt?: string | null
  postedAt?: string | null
  analytics?: {
    views: number
    likes: number
    replies: number
    reposts: number
  }
  _count?: {
    talentLeads: number
  }
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    totalLeads: 0
  })

  const fetchPosts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)

        // Calculate stats
        const totalPosts = data.length
        const publishedPosts = data.filter((p: Post) => p.status === 'POSTED').length
        const totalViews = data.reduce((sum: number, p: Post) => sum + (p.analytics?.views || 0), 0)
        const totalLeads = data.reduce((sum: number, p: Post) => sum + (p._count?.talentLeads || 0), 0)

        setStats({
          totalPosts,
          publishedPosts,
          totalViews,
          totalLeads
        })
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts()
  }, [fetchPosts])

  const formatNumber = (value: number) => value.toLocaleString('en-US')

  const writingModeLabels: Record<string, string> = {
    PERSONAL_BRANDING: 'Personal Branding',
    AI_TALENT_FUNNEL: 'AI Talent Funnel',
    HIRING: 'Hiring',
    BUSINESS_INSIGHT: 'Business Insight',
    REWRITE: 'Rewrite'
  }

  const getTrendDate = (post: Post) => {
    if (post.postedAt) return post.postedAt
    if (post.scheduledAt) return post.scheduledAt
    return post.createdAt
  }

  const monthlyTrend = posts.reduce<Record<string, { label: string; totalViews: number; postCount: number }>>((acc, post) => {
    const rawDate = getTrendDate(post)
    const date = new Date(rawDate)
    if (Number.isNaN(date.getTime())) {
      return acc
    }

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
    const views = post.analytics?.views ?? 0

    acc[key] = acc[key]
      ? {
          label,
          totalViews: acc[key].totalViews + views,
          postCount: acc[key].postCount + 1
        }
      : { label, totalViews: views, postCount: 1 }

    return acc
  }, {})

  const sortedTrendEntries = Object.entries(monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))

  const trendData = sortedTrendEntries.map(([key, value]) => ({
    key,
    ...value
  }))

  const trendScaleMax = 100000
  const trendAxisTicks = [0, 25000, 50000, 75000, 100000]

  const modeViews = posts.reduce<Record<string, number>>((acc, post) => {
    const mode = post.writingMode || 'OTHER'
    acc[mode] = (acc[mode] ?? 0) + (post.analytics?.views ?? 0)
    return acc
  }, {})

  const modeData = Object.entries(modeViews)
    .filter(([, views]) => views > 0)
    .map(([mode, views]) => ({ mode, label: writingModeLabels[mode] ?? mode, views }))

  const modeTotalViews = modeData.reduce((sum, item) => sum + item.views, 0)

  const mostRelevantMode = modeData.reduce((best, item) => {
    if (!best || item.views > best.views) return item
    return best
  }, modeData[0])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDEA': return 'bg-gray-100 text-gray-800'
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'POSTED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ringkasan aktivitas dan performa konten Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Posts
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.totalPosts)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Published
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.publishedPosts)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👁️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Views
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalViews.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">🎯</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Talent Leads
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {formatNumber(stats.totalLeads)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-5 lg:grid-cols-2 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Trend Bulanan</h2>
              <p className="text-sm text-gray-500">Total views per bulan berdasarkan tanggal publish, jadwal, atau tanggal dibuat.</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <div>Sumbu Y: total views</div>
              <div>Sumbu X: bulan</div>
            </div>
          </div>
          <div className="space-y-3">
            {trendData.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada data tren yang tersedia.</p>
            ) : (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)]">
                    <div className="relative hidden h-56 sm:block">
                      {trendAxisTicks.map((tick) => {
                        const bottom = (tick / trendScaleMax) * 100
                        return (
                          <div
                            key={`axis-${tick}`}
                            className="absolute left-0 right-0"
                            style={{ bottom: `${bottom}%`, transform: 'translateY(50%)' }}
                          >
                            <span className="text-xs text-slate-400">{formatNumber(tick)}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="relative">
                      {trendAxisTicks.map((tick) => {
                        const bottom = (tick / trendScaleMax) * 100
                        return (
                          <div
                            key={`grid-${tick}`}
                            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-slate-200"
                            style={{ bottom: `${bottom}%` }}
                          />
                        )
                      })}
                      <div className="grid h-56 grid-cols-2 items-end gap-4 border-b border-dashed border-slate-300 pb-3 sm:grid-cols-3 xl:grid-cols-6">
                  {trendData.map((item) => {
                    const height = item.totalViews > 0
                      ? Math.max((Math.min(item.totalViews, trendScaleMax) / trendScaleMax) * 100, 8)
                      : 0
                    return (
                      <div key={item.label} className="relative h-full">
                        <div className="flex h-full items-end justify-center">
                          <div
                            className="relative w-full max-w-20 rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-500 shadow-sm"
                            style={{
                              height: `${height}%`,
                              minHeight: item.totalViews > 0 ? '0.75rem' : '0'
                            }}
                            title={`${item.label}: ${formatNumber(item.totalViews)} views`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700">
                              {formatNumber(item.totalViews)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)]">
                    <div className="hidden sm:block" />
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                      {trendData.map((item) => (
                        <span key={`${item.label}-label`} className="text-center text-xs text-gray-600">
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                    <span>Total views: {formatNumber(trendData.reduce((sum, item) => sum + item.totalViews, 0))}</span>
                    <span>Bulan tercover: {trendData.length}</span>
                  </div>
                  <div className="mt-2">
                    Periode data: {trendData[0]?.label} — {trendData[trendData.length - 1]?.label}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Skala chart tetap: 0 sampai {formatNumber(trendScaleMax)} views.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mode Penulisan</h2>
            <p className="text-sm text-gray-500">Distribusi views per mode penulisan.</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative h-56 w-full lg:w-72">
              {modeData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Tidak ada data mode.
                </div>
              ) : (
                <div
                  className="h-full w-full rounded-full"
                  style={{
                    background: `conic-gradient(${modeData
                      .map((item, index) => {
                        const start = modeData
                          .slice(0, index)
                          .reduce((sum, current) => sum + current.views, 0)
                        const end = start + item.views
                        const startPct = (start / modeTotalViews) * 100
                        const endPct = (end / modeTotalViews) * 100
                        const color = [
                          '#6366f1',
                          '#ec4899',
                          '#14b8a6',
                          '#f59e0b',
                          '#22c55e'
                        ][index % 5]
                        return `${color} ${startPct}% ${endPct}%`
                      })
                      .join(', ')}`
                  }}
                />
              )}
              <div className="absolute inset-1/4 rounded-full bg-white" />
              <div className="absolute inset-1/3 rounded-full bg-white" />
            </div>
            <div className="grid gap-3 flex-1">
              {modeData.length === 0 ? null : modeData.map((item) => (
                <div key={item.mode} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{((item.views / modeTotalViews) * 100).toFixed(0)}%</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(item.views)}</p>
                </div>
              ))}
            </div>
          </div>
          {mostRelevantMode && (
            <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
              Mode paling relevan: <span className="font-semibold text-indigo-900">{mostRelevantMode.label}</span> dengan {formatNumber(mostRelevantMode.views)} views.
            </div>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Postingan Terbaru
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {posts.slice(0, 5).map((post) => (
            <li key={post.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {post.content.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    {post.analytics && (
                      <span className="text-sm text-gray-500">
                        👁️ {formatNumber(post.analytics.views)} ❤️ {formatNumber(post.analytics.likes)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
