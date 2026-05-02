'use client'

import { useState } from 'react'

type WritingMode = 'PERSONAL_BRANDING' | 'AI_TALENT_FUNNEL' | 'HIRING' | 'BUSINESS_INSIGHT' | 'REWRITE'

const WRITING_MODES = {
  PERSONAL_BRANDING: {
    label: 'Personal Branding',
    description: 'Postingan untuk membangun personal branding Daru'
  },
  AI_TALENT_FUNNEL: {
    label: 'AI Talent Funnel',
    description: 'Postingan untuk menarik talenta AI'
  },
  HIRING: {
    label: 'Hiring',
    description: 'Postingan untuk rekrutmen posisi tertentu'
  },
  BUSINESS_INSIGHT: {
    label: 'Business Insight',
    description: 'Insight bisnis dan AI yang berharga'
  },
  REWRITE: {
    label: 'Rewrite',
    description: 'Rewrite konten yang sudah ada dengan gaya Daru'
  }
}

export default function GeneratePage() {
  const [writingMode, setWritingMode] = useState<WritingMode>('PERSONAL_BRANDING')
  const [topic, setTopic] = useState('')
  const [existingContent, setExistingContent] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [tokenUsage, setTokenUsage] = useState<{ promptTokens: number; completionTokens: number; totalTokens: number } | null>(null)

  const handleGenerate = async () => {
    if (!topic && writingMode !== 'REWRITE') {
      setError('Topik diperlukan untuk mode penulisan ini')
      return
    }

    if (writingMode === 'REWRITE' && !existingContent) {
      setError('Konten yang akan di-rewrite diperlukan')
      return
    }

    setLoading(true)
    setError('')
    setGeneratedContent('')
    setTokenUsage(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          writingMode,
          topic,
          existingContent
        })
      })

      const data = await response.json()

      if (response.ok) {
        setGeneratedContent(data.content)
        setTokenUsage(data.usage)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: generatedContent,
          writingMode,
          status: 'DRAFT'
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError('Gagal menyimpan postingan')
      }
    } catch {
      setError('Terjadi kesalahan saat menyimpan')
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
        <p className="mt-1 text-sm text-gray-600">
          Hasilkan konten Threads dengan gaya Daru menggunakan AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode Penulisan
            </label>
            <select
              value={writingMode}
              onChange={(e) => setWritingMode(e.target.value as WritingMode)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black bg-white"
            >
              {Object.entries(WRITING_MODES).map(([key, mode]) => (
                <option key={key} value={key}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {WRITING_MODES[writingMode].description}
            </p>
          </div>

          {writingMode !== 'REWRITE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topik
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                placeholder="Masukkan topik yang ingin dibahas..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black bg-white min-h-[120px]"
              />
            </div>
          )}

          {writingMode === 'REWRITE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konten yang Akan Di-rewrite
              </label>
              <textarea
                value={existingContent}
                onChange={(e) => setExistingContent(e.target.value)}
                rows={6}
                placeholder="Tempel konten yang ingin di-rewrite dengan gaya Daru..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sedang menghasilkan...' : 'Hasilkan Konten'}
          </button>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten yang Dihasilkan
            </label>
            <div className="relative">
              <textarea
                value={generatedContent}
                readOnly
                rows={12}
                placeholder="Konten akan muncul di sini setelah dihasilkan..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-black"
              />
              {generatedContent && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleSave}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded"
                  >
                    {saved ? 'Tersimpan!' : 'Simpan'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {tokenUsage && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-indigo-900">
                    📊 Penggunaan Token
                  </h3>
                  <div className="mt-2 text-sm text-indigo-800">
                    <ul className="space-y-1">
                      <li><strong>Prompt Tokens:</strong> {tokenUsage.promptTokens}</li>
                      <li><strong>Completion Tokens:</strong> {tokenUsage.completionTokens}</li>
                      <li><strong>Total Tokens:</strong> {tokenUsage.totalTokens}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {generatedContent && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Tips untuk Postingan yang Efektif
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Pastikan postingan sesuai dengan tone Daru yang santai dan reflektif</li>
                      <li>Gunakan hashtag yang relevan untuk meningkatkan reach</li>
                      <li>Sertakan call-to-action yang soft untuk engagement</li>
                      <li>Periksa kembali sebelum publish untuk memastikan kualitas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}