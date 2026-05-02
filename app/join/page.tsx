'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LEAD_TYPE_OPTIONS } from '@/lib/leads'

type LeadType = 'CANDIDATE' | 'PARTNER' | 'CLIENT'

type PublicLeadForm = {
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

const defaultForm: PublicLeadForm = {
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

export default function JoinPage() {
  const [formData, setFormData] = useState<PublicLeadForm>(defaultForm)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/public-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus('error')
        setMessage(data.error || 'Gagal mengirim data.')
        return
      }

      setStatus('success')
      setMessage('Terima kasih. Data Anda sudah kami terima dan akan kami tindak lanjuti.')
      setFormData(defaultForm)
    } catch {
      setStatus('error')
      setMessage('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <section className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Sunartha</p>
            <p className="mt-1 text-sm text-slate-500">Unlocking Possibilities Through Technology</p>
          </div>
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Beranda
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
            >
              Masuk Admin
            </Link>
          </div>
        </section>
      </div>

      <section className="relative overflow-hidden border-b border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#0b3b8f_55%,#0f766e_100%)]">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">Join Pipeline</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Satu pintu untuk kandidat, mitra, dan prospek client.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-sky-50/85">
              Kalau Anda ingin bekerja sama, berdiskusi peluang, atau terhubung untuk inisiatif baru, isi form ini.
              Tim kami akan review dan follow up sesuai konteksnya.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { value: '12+', label: 'Years of Experience' },
                { value: '100+', label: 'Clients' },
                { value: '150+', label: 'Projects' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
                  <div className="text-3xl font-semibold">{item.value}</div>
                  <div className="mt-2 text-sm text-sky-50/80">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:max-w-xl">
            {[
              {
                title: 'Calon Karyawan',
                body: 'Untuk profesional yang tertarik bergabung di peran teknologi, AI, atau bisnis.'
              },
              {
                title: 'Mitra',
                body: 'Untuk komunitas, vendor, konsultan, atau partner yang ingin kolaborasi.'
              },
              {
                title: 'Prospek Client',
                body: 'Untuk perusahaan yang ingin diskusi kebutuhan digital, ERP, data, atau AI.'
              }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-sky-50/85">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-sky-700">Kenapa satu form?</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Supaya inbound yang masuk tidak tercecer.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Pendekatan ini meniru alur consultative intake Sunartha: semua request masuk terpusat, lalu dipilah cepat
                  berdasarkan konteks bisnisnya.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right text-sm text-emerald-700">
                <div>Review terpusat</div>
                <div>Follow-up lebih cepat</div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">1. Pilih konteks</p>
                <p className="mt-2 text-sm text-slate-600">Tentukan apakah Anda kandidat, partner, atau prospek client.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">2. Tinggalkan kontak</p>
                <p className="mt-2 text-sm text-slate-600">Minimal isi nama dan salah satu kanal kontak yang aktif.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-900">3. Tambahkan konteks</p>
                <p className="mt-2 text-sm text-slate-600">Masukkan skill, kebutuhan, atau tujuan kolaborasi secara singkat.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-sky-700">Yang biasa masuk ke tim kami</p>
            <div className="mt-5 space-y-4">
              {[
                'Talenta teknologi yang tertarik membangun solusi ERP, data, cloud, atau AI.',
                'Partner implementasi, komunitas, dan vendor yang ingin membuka peluang kolaborasi.',
                'Perusahaan yang ingin mulai diskusi asesmen kebutuhan dan konsultasi awal.'
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/70">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-700">Form Submission</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Kirim data Anda</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Kami akan menyimpan data ini ke pipeline internal untuk ditinjau oleh tim.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tipe Lead *</label>
              <select
                value={formData.leadType}
                onChange={(e) => setFormData({ ...formData, leadType: e.target.value as LeadType })}
                className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
              >
                {LEAD_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama *</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Nama Account</label>
                <input
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Organisasi / Perusahaan</label>
              <input
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Nama perusahaan, komunitas, atau organisasi"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
                <input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="+62812..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Lokasi</label>
                <input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Jakarta, Indonesia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Skills / Kebutuhan</label>
                <input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  placeholder="Python, collaboration, ERP, AI roadmap"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Catatan</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Ceritakan singkat konteks, kebutuhan, atau tujuan Anda menghubungi tim ini."
              />
            </div>

            {message && (
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  status === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'submitting' ? 'Mengirim...' : 'Kirim Data'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
