import { Link } from 'react-router-dom'
import { Plus, Download, TrendingUp, Car, Flame, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardHero({ todaySummary, loading }) {
  const { user } = useAuth()
  const summary = todaySummary || {}
  const displayName = user?.name?.split(' ')[0] || 'Rider'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const metrics = [
    { icon: Car,        label: "Today's Rides",  value: loading ? '–' : String(summary.rides ?? 0),            sub: 'trips' },
    { icon: TrendingUp, label: 'Earnings',        value: loading ? '–' : (summary.earnings ?? '₹0'),            sub: 'gross' },
    { icon: Flame,      label: 'Top Platform',   value: loading ? '–' : (summary.bestPlatform ?? '—'),          sub: 'today' },
    { icon: Zap,        label: 'Streak',          value: loading ? '–' : String(summary.streak ?? 0),           sub: 'days' },
  ]

  return (
    <div className="hero-mesh rounded-[28px] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden animate-fade-up">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.025] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-bronze/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gold/6 rounded-full blur-2xl" />
        <div className="absolute inset-0 opacity-[0.035] dot-grid" />
      </div>

      {/* Decorative top border */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-bronze/60 to-transparent" />

      <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-end">
        {/* Left: Greeting + CTAs */}
        <div>
          {/* Date pill */}
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] rounded-full px-4 py-1.5 text-[11px] font-semibold text-white/70 mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            {today}
          </div>

          {/* Greeting */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight leading-[1.1]">
            {greeting},{' '}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-light to-bronze">
              {displayName}!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 mt-4 text-sm sm:text-[15px] max-w-md leading-relaxed">
            You&apos;ve completed{' '}
            <span className="text-white font-bold">{loading ? '…' : (summary.rides ?? 0)} rides</span>{' '}
            today earning{' '}
            <span className="text-gold font-bold">{loading ? '…' : (summary.earnings ?? '₹0')}</span>.{' '}
            Keep it up!
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              to="/rides/add"
              className="inline-flex items-center gap-2.5 bg-white text-navy hover:bg-white/90 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-black/20 btn-press hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Ride
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.13] text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all btn-press backdrop-blur-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Right: Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {metrics.map(({ icon: Icon, label, value, sub }, i) => (
            <div
              key={label}
              className="bg-white/[0.07] border border-white/[0.09] backdrop-blur-sm rounded-2xl p-4 hover:bg-white/[0.11] transition-all duration-300 card-premium group min-w-[116px] animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{value}</p>
              <p className="text-[11px] text-white/50 mt-0.5 font-medium">{label}</p>
              <p className="text-[10px] text-white/25 uppercase tracking-wider font-bold">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
