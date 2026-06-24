import { useEffect, useState } from 'react'
import { IndianRupee, Fuel, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '../../services/api'

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}k`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function TrendBadge({ thisMonth, lastMonth }) {
  if (!lastMonth || lastMonth === 0) return null
  const pct = ((thisMonth - lastMonth) / lastMonth) * 100
  const up = pct >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
      up
        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800/50'
        : 'bg-red-50 text-red-500 ring-1 ring-red-100 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800/50'
    }`}>
      <Icon className="w-3 h-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

function MarginRing({ value }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const filled = Math.min(Math.max(value, 0), 100)
  const dashArray = `${(filled / 100) * circ} ${circ}`
  const color = filled >= 70 ? '#10B981' : filled >= 40 ? '#C98D73' : '#EF4444'
  return (
    <svg width="72" height="72" className="shrink-0 -rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#EDE5DC" strokeWidth="5.5" />
      <circle
        cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5.5"
        strokeDasharray={dashArray} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.9s ease' }}
      />
    </svg>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[22px] p-6 bg-white border border-border/40 shadow-card animate-pulse dark:bg-gray-900 dark:border-gray-700/40">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton w-11 h-11 rounded-2xl" />
        <div className="skeleton w-14 h-5 rounded-full" />
      </div>
      <div className="skeleton h-8 w-28 rounded-xl mb-2" />
      <div className="skeleton h-3 w-20 rounded mb-4" />
      <div className="skeleton h-px w-full rounded mb-3" />
      <div className="flex justify-between">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-3 w-14 rounded" />
      </div>
    </div>
  )
}

export default function NetEarningsCards() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ride/financial-summary')
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const all      = data?.allTime   || {}
  const mon      = data?.thisMonth || {}
  const lmon     = data?.lastMonth || {}
  const todayVal = data?.today     || {}

  const marginColor =
    (all.margin || 0) >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
    (all.margin || 0) >= 40 ? 'text-bronze'       : 'text-red-500 dark:text-red-400'

  const cards = [
    {
      id: 'gross', label: 'Gross Earnings', sublabel: 'Total revenue from rides',
      value: fmt(all.gross || 0), monthValue: fmt(mon.gross || 0),
      todayValue: fmt(todayVal.gross || 0),
      trend: <TrendBadge thisMonth={mon.gross || 0} lastMonth={lmon.gross || 0} />,
      icon: IndianRupee,
      iconBg: 'bg-navy/8 dark:bg-white/10', iconColor: 'text-navy dark:text-gray-100',
      bar: 'from-navy to-royal',
      detail: `${all.rides || 0} total rides`,
    },
    {
      id: 'fuel', label: 'Fuel Expenses', sublabel: 'Total fuel cost logged',
      value: fmt(all.fuel || 0), monthValue: fmt(mon.fuel || 0),
      todayValue: fmt(todayVal.fuel || 0),
      trend: <TrendBadge thisMonth={mon.fuel || 0} lastMonth={lmon.fuel || 0} />,
      icon: Fuel,
      iconBg: 'bg-bronze/10', iconColor: 'text-bronze',
      bar: 'from-bronze to-gold',
      detail: 'from fuel logs',
    },
    {
      id: 'net', label: 'Net Earnings', sublabel: 'After deducting fuel costs',
      value: fmt(all.net || 0), monthValue: fmt(mon.net || 0),
      todayValue: fmt(todayVal.net || 0),
      trend: <TrendBadge thisMonth={mon.net || 0} lastMonth={lmon.net || 0} />,
      icon: (all.net || 0) >= 0 ? TrendingUp : TrendingDown,
      iconBg: (all.net || 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30',
      iconColor: (all.net || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
      bar: (all.net || 0) >= 0 ? 'from-emerald-400 to-emerald-500' : 'from-red-400 to-red-500',
      detail: 'gross − fuel',
    },
    {
      id: 'margin', label: 'Profit Margin', sublabel: 'Net ÷ Gross earnings',
      value: `${all.margin || 0}%`, monthValue: `${mon.margin || 0}%`,
      todayValue: `${todayVal.margin || 0}%`,
      trend: null,
      icon: PieChart,
      iconBg: 'bg-gold/10', iconColor: 'text-gold-dark',
      bar: 'from-gold to-bronze',
      detail: 'all time',
      isMargin: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className="group relative bg-white rounded-[22px] p-6 border border-border/50 shadow-card overflow-hidden card-premium hover:shadow-soft animate-fade-up dark:bg-gray-900 dark:border-gray-700/50"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {/* Accent bar */}
            <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${card.bar} rounded-t-[22px]`} />

            {/* Ambient orb */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-bronze/8 to-gold/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Icon + trend */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={2.2} />
              </div>
              {card.trend}
            </div>

            {/* Value */}
            {card.isMargin ? (
              <div className="flex items-center gap-3">
                <div>
                  <p className={`text-3xl font-extrabold tracking-tight ${marginColor}`}>{card.value}</p>
                  <p className="text-[13px] text-muted font-semibold mt-1 dark:text-gray-400">{card.label}</p>
                </div>
                <div className="ml-auto relative flex items-center justify-center">
                  <MarginRing value={all.margin || 0} />
                  <span className={`absolute text-[11px] font-extrabold ${marginColor}`}>{all.margin || 0}%</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[28px] font-extrabold text-navy tracking-tight leading-none dark:text-gray-100">{card.value}</p>
                <p className="text-[13px] text-muted font-semibold mt-1 dark:text-gray-400">{card.label}</p>
              </>
            )}

            {/* Divider */}
            <div className="my-4 h-px bg-border/50 dark:bg-gray-700/50" />

            {/* Bottom rows */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted font-medium dark:text-gray-400">This month</span>
                <span className="font-bold text-navy dark:text-gray-100">{card.monthValue}</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted font-medium dark:text-gray-400">Today</span>
                <span className="font-semibold text-royal">{card.todayValue}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-muted/50 uppercase tracking-wider font-bold dark:text-gray-500">{card.detail}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
