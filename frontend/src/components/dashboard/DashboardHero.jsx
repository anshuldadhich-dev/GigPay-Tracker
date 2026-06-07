import { Link } from 'react-router-dom'
import { Plus, Download, TrendingUp, Car, Flame, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardHero({ todaySummary, loading }) {
  const { user } = useAuth()
  const summary = todaySummary || {}
  const displayName = user?.name || 'Rider'

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const metrics = [
    { icon: Car, label: "Today's Rides", value: loading ? '…' : String(summary.rides ?? 0), sub: 'trips' },
    { icon: TrendingUp, label: 'Earnings', value: loading ? '…' : (summary.earnings ?? '₹0'), sub: 'gross' },
    { icon: Flame, label: 'Top Platform', value: loading ? '…' : (summary.bestPlatform ?? '—'), sub: 'today' },
    { icon: Zap, label: 'Streak', value: loading ? '…' : String(summary.streak ?? 0), sub: 'days' },
  ]

  return (
    <div className="hero-mesh rounded-[28px] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden animate-fade-up">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] dot-grid" />
      </div>

      <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-end">
        <div>
          <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            {today}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight leading-[1.1]">
            {greeting},<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-secondary-light">
              {displayName}!
            </span>
          </h1>

          <p className="text-white/60 mt-4 text-sm sm:text-base max-w-md leading-relaxed">
            You've completed{' '}
            <span className="text-white font-semibold">{loading ? '…' : (summary.rides ?? 0)} rides</span>{' '}
            today earning{' '}
            <span className="text-accent font-bold">{loading ? '…' : (summary.earnings ?? '₹0')}</span>.{' '}
            Keep it up!
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              to="/rides/add"
              className="inline-flex items-center gap-2.5 bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-black/20 btn-press hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Add Ride
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2.5 glass-dark hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-semibold transition-all btn-press"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          {metrics.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="glass-dark rounded-2xl p-4 hover:bg-white/[0.1] transition-all duration-300 card-premium group min-w-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4 text-secondary-light" />
              </div>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight">{value}</p>
              <p className="text-[11px] text-white/50 mt-0.5 font-medium">{label}</p>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
