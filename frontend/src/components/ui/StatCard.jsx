import { Car, Wallet, TrendingUp, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const icons = { car: Car, wallet: Wallet, trending: TrendingUp, calendar: CalendarDays }

const accents = {
  navy: {
    bg: 'bg-navy/8',
    text: 'text-navy',
    bar: 'from-navy to-royal',
    spark: '#082B6B',
    badge: 'bg-navy/8 text-navy ring-1 ring-navy/15',
  },
  royal: {
    bg: 'bg-royal/8',
    text: 'text-royal',
    bar: 'from-royal to-royal-light',
    spark: '#2455B5',
    badge: 'bg-royal/8 text-royal ring-1 ring-royal/15',
  },
  bronze: {
    bg: 'bg-bronze/10',
    text: 'text-bronze',
    bar: 'from-bronze to-gold',
    spark: '#C98D73',
    badge: 'bg-bronze/10 text-bronze ring-1 ring-bronze/20',
  },
  gold: {
    bg: 'bg-gold/10',
    text: 'text-gold',
    bar: 'from-gold to-bronze',
    spark: '#D7A66A',
    badge: 'bg-gold/10 text-gold ring-1 ring-gold/20',
  },
  // Legacy aliases
  blue:   { bg: 'bg-navy/8',   text: 'text-navy',   bar: 'from-navy to-royal',   spark: '#082B6B', badge: 'bg-navy/8 text-navy ring-1 ring-navy/15' },
  teal:   { bg: 'bg-royal/8',  text: 'text-royal',  bar: 'from-royal to-royal-light', spark: '#2455B5', badge: 'bg-royal/8 text-royal ring-1 ring-royal/15' },
  orange: { bg: 'bg-bronze/10',text: 'text-bronze', bar: 'from-bronze to-gold',   spark: '#C98D73', badge: 'bg-bronze/10 text-bronze ring-1 ring-bronze/20' },
}

function Sparkline({ data, color }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 100, h = 36
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`)
    .join(' ')
  const areaPoints = `0,${h} ${points} ${w},${h}`

  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  sparkline,
  accent = 'royal',
}) {
  const Icon = icons[icon] || Car
  const style = accents[accent] || accents.royal
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-[22px] p-6 border border-border/50 dark:border-gray-700/50 shadow-card card-premium overflow-hidden hover:shadow-soft">
      {/* top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${style.bar} rounded-t-[22px]`} />

      {/* ambient orb */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-bronze/6 to-gold/4 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl ${style.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${style.text}`} strokeWidth={2.2} />
        </div>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-1 rounded-full animate-trend ${
            trend === 'up'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-800/50'
              : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 ring-1 ring-red-100 dark:ring-red-800/50'
          }`}>
            <TrendIcon className="w-3 h-3" />
            {change}
          </span>
        )}
      </div>

      <div className="relative mt-5">
        <p className="text-[12px] text-muted dark:text-gray-400 font-semibold tracking-wide uppercase">{label}</p>
        <p className="text-[28px] font-extrabold text-navy dark:text-gray-100 mt-1 tracking-tight leading-none">{value}</p>
      </div>

      {sparkline && (
        <div className="relative mt-5 pt-4 border-t border-border/40 dark:border-gray-700/40 flex items-end justify-between">
          <Sparkline data={sparkline} color={style.spark} />
          <span className="text-[10px] text-muted dark:text-gray-400 font-semibold uppercase tracking-wider">7d trend</span>
        </div>
      )}
    </div>
  )
}
