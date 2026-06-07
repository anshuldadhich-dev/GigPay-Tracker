import { Car, Wallet, TrendingUp, CalendarDays, ArrowUpRight } from 'lucide-react'

const icons = { car: Car, wallet: Wallet, trending: TrendingUp, calendar: CalendarDays }

const accents = {
  blue: { bg: 'bg-blue-50', text: 'text-primary', bar: 'from-primary to-primary-light', spark: '#1E3A8A', glow: 'group-hover:shadow-glow-blue' },
  teal: { bg: 'bg-teal-50', text: 'text-secondary', bar: 'from-secondary to-secondary-light', spark: '#14B8A6', glow: 'group-hover:shadow-glow-teal' },
  orange: { bg: 'bg-orange-50', text: 'text-accent', bar: 'from-accent to-accent-dark', spark: '#F97316', glow: 'group-hover:shadow-glow-orange' },
}

function Sparkline({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 100
  const h = 36
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`).join(' ')
  const areaPoints = `0,${h} ${points} ${w},${h}`

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StatCard({ label, value, change, trend, icon, sparkline, accent = 'teal' }) {
  const Icon = icons[icon] || Car
  const style = accents[accent] || accents.teal

  return (
    <div className={`group relative bg-white rounded-[22px] p-6 border border-border/40 shadow-card card-premium overflow-hidden ${style.glow}`}>
      <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${style.bar}`} />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-secondary/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center ring-1 ring-black/[0.04] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${style.text}`} strokeWidth={2.2} />
        </div>
        {change && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full animate-trend ${trend === 'up' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' : 'bg-red-50 text-red-600'}`}>
            <ArrowUpRight className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-[13px] text-muted font-semibold tracking-wide">{label}</p>
        <p className="text-[28px] font-extrabold text-primary mt-1 tracking-tight leading-none">{value}</p>
      </div>

      {sparkline && (
        <div className="relative mt-5 pt-4 border-t border-border/40 flex items-end justify-between">
          <Sparkline data={sparkline} color={style.spark} />
          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">7d trend</span>
        </div>
      )}
    </div>
  )
}
