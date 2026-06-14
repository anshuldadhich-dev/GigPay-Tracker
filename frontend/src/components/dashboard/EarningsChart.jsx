import { useState } from 'react'
import { Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart } from 'recharts'
import { TrendingUp, Star, Zap, BarChart2 } from 'lucide-react'
import Card from '../ui/Card'

const periods = ['6M', '3M', '1M']
const insightIcons = { trending: TrendingUp, star: Star, zap: Zap }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const earnings = payload.find((p) => p.dataKey === 'earnings')?.value
  const rides = payload[0]?.payload?.rides
  return (
    <div className="glass-warm rounded-2xl px-5 py-4 shadow-soft border border-border/60 text-sm min-w-[160px]">
      <p className="font-bold text-navy">{label}</p>
      <p className="text-royal font-bold text-lg mt-1">₹{earnings?.toLocaleString('en-IN')}</p>
      <p className="text-muted text-xs mt-1">{rides} rides</p>
    </div>
  )
}

export default function EarningsChart({ data = [], insights = [], loading = false }) {
  const [period, setPeriod] = useState('6M')

  const sliced = period === '3M' ? data.slice(-3) : period === '1M' ? data.slice(-1) : data
  const total = sliced.reduce((s, d) => s + d.earnings, 0)
  const growth = sliced.length >= 2
    ? ((sliced[sliced.length - 1].earnings - sliced[0].earnings) / sliced[0].earnings * 100).toFixed(1)
    : null

  if (!loading && data.length === 0) {
    return (
      <Card className="h-full" padding="lg">
        <p className="text-[11px] font-bold text-royal uppercase tracking-[0.12em]">Analytics</p>
        <h3 className="text-xl font-extrabold text-navy tracking-tight mt-1">Earnings Overview</h3>
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <BarChart2 className="w-12 h-12 text-border" />
          <p className="text-sm font-medium text-muted">No ride data yet.</p>
          <p className="text-xs text-muted">Add rides to see your earnings chart.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden" padding="lg">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-6">
        <div>
          <p className="text-[11px] font-bold text-royal uppercase tracking-[0.12em]">Analytics</p>
          <h3 className="text-xl font-extrabold text-navy tracking-tight mt-1">Earnings Overview</h3>
          <div className="flex items-baseline gap-3 mt-3">
            <p className="text-4xl font-extrabold text-navy tracking-tight">₹{total.toLocaleString('en-IN')}</p>
            {growth !== null && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full ring-1 ring-emerald-100">
                <TrendingUp className="w-3 h-3" /> {growth >= 0 ? '+' : ''}{growth}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1">Total revenue · {period} period</p>
        </div>

        <div className="flex bg-background p-1 rounded-xl gap-0.5 shrink-0 self-start border border-border/50">
          {periods.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200 btn-press ${
                period === p
                  ? 'bg-white text-navy shadow-sm ring-1 ring-border/60'
                  : 'text-muted hover:text-navy'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-72 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sliced} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#082B6B" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#082B6B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C98D73" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#D7A66A" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#E5DDD5" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} dy={8} />
            <YAxis yAxisId="earnings" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="rides" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#D4C8BC', fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2455B5', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Bar yAxisId="rides" dataKey="rides" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={16} />
            <Area yAxisId="earnings" type="monotone" dataKey="earnings" stroke="none" fill="url(#areaGrad)" />
            <Line yAxisId="earnings" type="monotone" dataKey="earnings" stroke="#082B6B" strokeWidth={3} dot={{ fill: '#fff', stroke: '#082B6B', strokeWidth: 3, r: 5 }} activeDot={{ r: 7, fill: '#2455B5', stroke: '#fff', strokeWidth: 3 }} animationDuration={800} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border/50">
          {insights.map(({ label, value, change, icon }) => {
            const Icon = insightIcons[icon]
            return (
              <div key={label} className="rounded-2xl bg-background p-4 hover:bg-navy/[0.03] transition-colors group border border-border/40">
                <div className="flex items-center gap-2 text-muted">
                  <Icon className="w-3.5 h-3.5 text-royal group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-lg font-extrabold text-navy mt-2">{value}</p>
                <p className="text-[11px] text-bronze font-semibold mt-0.5">{change}</p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
