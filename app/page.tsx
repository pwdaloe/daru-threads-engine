import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <section className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">Sunartha</p>
            <p className="mt-1 text-sm text-slate-500">Unlocking Possibilities Through Technology</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            Masuk Admin
          </Link>
        </section>
      </div>

      <section className="mx-auto grid min-h-[calc(100vh-81px)] max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">Inbound Portal</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Portal terpusat untuk kandidat, partner, dan prospek client Sunartha.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Dibuat untuk menangkap inbound interest secara lebih rapi, cepat, dan siap ditindaklanjuti oleh tim internal.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { value: '12+', label: 'Years of Experience' },
              { value: '100+', label: 'Clients' },
              { value: '150+', label: 'Projects' }
            ].map((item) => (
              <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="text-3xl font-semibold text-slate-950">{item.value}</div>
                <div className="mt-2 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Buka Form Join
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              Masuk Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#1e3a8a_100%)] p-8 text-white shadow-2xl shadow-sky-100/60">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-200">Apa yang Masuk ke Pipeline</p>
          <div className="mt-6 space-y-4">
            {[
              ['Calon Karyawan', 'Talenta yang tertarik bergabung di area teknologi, AI, dan bisnis.'],
              ['Mitra', 'Partner, vendor, komunitas, atau konsultan yang ingin membangun kolaborasi.'],
              ['Prospek Client', 'Perusahaan yang ingin berdiskusi kebutuhan ERP, data, cloud, atau AI.']
            ].map(([title, body]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <h2 className="text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-sky-50/90">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
