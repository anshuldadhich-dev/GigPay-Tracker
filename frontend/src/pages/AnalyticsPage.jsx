import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, BarChart3, IndianRupee, Car,
  Fuel, Target, Route, Award, Zap, AlertCircle,
} from 'lucide-react'
import Card from '../components/ui/Card'
import api from '../services/api'

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '3months', label: '3 Months' },
  { key: 'year', label: 'This Year' },
  { key: 'all', label: 'All Time' },
]

const PLATFORM_COLORS = {
  Uber: '#000000',
  Ola: '#08B14A',
  Rapido: '#FFC800',
  InDrive: '#374151',
  'Namma Yatri': '#7C3AED',
  Unknown: '#94A3B8',
}
const FALLBACK_COLORS = ['#14B8A6', '#F97316', '#6366F1', '#EC4899', '#F59E0B', '#10B981']

function getPlatformColor(platform, index) {
  return PLATFORM_COLORS[platform] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-IN')
}

function SkeletonCard() {
  return (
    <div className="rounded-[22px] p-6 bg-card dark:bg-gray-900 border border-border/40 dark:border-gray-700/40 shadow-card animate-pulse">
      <div className="skeleton h-4 w-28 rounded mb-4" />
      <div className="skeleton h-8 w-36 rounded" />
      <div className="skeleton h-3 w-20 rounded mt-2" />
    </div>
  )
}

function KpiCard({ label, value, sub, icon: Icon, color, bg, border }) {
  return (
    <div className={`relative rounded-[22px] p-6 bg-white dark:bg-gray-900 border ${border} shadow-card overflow-hidden group card-premium`}>
      <div className={`absolute top-0 inset-x-0 h-[3px] ${color}`} />
      <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-current" />
      </div>
      <p className="text-2xl font-extrabold text-primary dark:text-gray-100 tracking-tight">{value}</p>
      <p className="text-[13px] text-muted dark:text-gray-400 font-semibold mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function GoalBar({ label, achieved, goal, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-primary dark:text-gray-100">{label}</span>
        <span className="text-muted dark:text-gray-400 text-xs font-medium">₹{fmt(achieved)} / ₹{fmt(goal)}</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted dark:text-gray-400">
        <span>{percentage}% achieved</span>
        <span className={percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
          {percentage >= 100 ? 'Goal reached!' : `₹${fmt(goal - achieved)} remaining`}
        </span>
      </div>
    </div>
  )
}

function DailyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-soft border border-white/60 text-sm min-w-[140px]">
      <p className="font-bold text-primary dark:text-gray-100 text-xs mb-1">{label}</p>
      <p className="text-secondary dark:text-teal-300 font-extrabold text-base">₹{fmt(payload[0]?.value || 0)}</p>
      {payload[0]?.payload?.rides && (
        <p className="text-muted dark:text-gray-400 text-xs mt-0.5">{payload[0].payload.rides} rides</p>
      )}
    </div>
  )
}

function DowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-soft border border-white/60 text-sm min-w-[140px]">
      <p className="font-bold text-primary dark:text-gray-100 text-xs mb-1">{label}</p>
      <p className="text-secondary dark:text-teal-300 font-extrabold text-base">₹{fmt(d?.earnings || 0)}</p>
      <p className="text-muted dark:text-gray-400 text-xs mt-0.5">{d?.rides} rides · avg ₹{fmt(d?.avgEarnings || 0)}</p>
    </div>
  )
}

function MonthlyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-soft border border-white/60 text-sm min-w-[140px]">
      <p className="font-bold text-primary dark:text-gray-100 text-xs mb-1">{label} {d?.year}</p>
      <p className="text-secondary dark:text-teal-300 font-extrabold text-base">₹{fmt(d?.earnings || 0)}</p>
      <p className="text-muted dark:text-gray-400 text-xs mt-0.5">{d?.rides} rides</p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass rounded-2xl px-4 py-3 shadow-soft border border-white/60 text-sm">
      <p className="font-bold text-primary dark:text-gray-100 text-xs">{d.name}</p>
      <p className="text-secondary dark:text-teal-300 font-extrabold text-base mt-1">₹{fmt(d.value)}</p>
      <p className="text-muted dark:text-gray-400 text-xs">{d.payload.percentage}% · {d.payload.rides} rides</p>
    </div>
  )
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon className="w-7 h-7 text-slate-300 dark:text-gray-500" />
      </div>
      <p className="text-sm font-semibold text-muted dark:text-gray-400">{title}</p>
      <p className="text-xs text-muted dark:text-gray-400">{sub}</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/ride/analytics?period=${p}`)
      setData(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAnalytics(period) }, [period, fetchAnalytics])

  const ov = data?.overview
  const goal = data?.goalProgress
  const daily = data?.dailyTrend || []
  const platforms = data?.platformBreakdown || []
  const dow = data?.dayOfWeekAnalysis || []
  const monthly = data?.monthlyTrend || []
  const routes = data?.topRoutes || []

  // Format date label for x-axis
  const formatDateTick = (dateStr) => {
    const [, m, d] = dateStr.split('-')
    return `${parseInt(d)} ${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m)]}`
  }

  return (
    <div className="space-y-6 pb-20 max-w-[1440px] mx-auto">

      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center animate-float">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Analytics</h1>
              <p className="text-slate-300 text-sm mt-0.5">Deep dive into your earnings, routes & performance</p>
            </div>
          </div>
          {/* Period tabs */}
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 btn-press ${
                  period === p.key
                    ? 'bg-white dark:bg-gray-900 text-primary dark:text-gray-100 shadow-md'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-scale-in dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
              <KpiCard
                label="Gross Earnings"
                value={`₹${fmt(ov?.grossIncome || 0)}`}
                sub={`${ov?.totalRides || 0} rides`}
                icon={IndianRupee}
                color="bg-gradient-to-r from-secondary to-secondary-light"
                bg="bg-teal-50 text-secondary dark:bg-teal-900/30 dark:text-teal-300"
                border="border-teal-100/60 dark:border-teal-800/40"
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '60ms' }}>
              <KpiCard
                label="Total Rides"
                value={ov?.totalRides || 0}
                sub={ov?.totalRides > 0 ? `₹${fmt(ov.avgPerRide)} avg/ride` : 'No rides yet'}
                icon={Car}
                color="bg-gradient-to-r from-primary to-primary-light"
                bg="bg-blue-50 text-primary dark:bg-blue-900/30 dark:text-blue-300"
                border="border-blue-100/60 dark:border-blue-800/40"
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <KpiCard
                label="Net Profit"
                value={`₹${fmt(ov?.profit || 0)}`}
                sub={`${ov?.profitMargin || 0}% margin after fuel`}
                icon={TrendingUp}
                color="bg-gradient-to-r from-emerald-400 to-emerald-500"
                bg="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                border="border-emerald-100/60 dark:border-emerald-800/40"
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '180ms' }}>
              <KpiCard
                label="Fuel Cost"
                value={`₹${fmt(ov?.totalFuelCost || 0)}`}
                sub="logged in this period"
                icon={Fuel}
                color="bg-gradient-to-r from-accent to-accent-dark"
                bg="bg-orange-50 text-accent dark:bg-orange-900/30 dark:text-orange-400"
                border="border-orange-100/60 dark:border-orange-800/40"
              />
            </div>
          </>
        )}
      </div>

      {/* Daily Trend + Goal Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Daily Trend Chart */}
        <div className="xl:col-span-2 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Card className="h-full" padding="lg">
            <div className="mb-5">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">Trend</p>
              <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Daily Earnings</h3>
            </div>
            {loading ? (
              <div className="h-64 skeleton rounded-2xl" />
            ) : daily.length === 0 ? (
              <EmptyState icon={TrendingUp} title="No data for this period" sub="Add rides to see the trend" />
            ) : (
              <div className="h-64 sm:h-72 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDateTick}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                      interval="preserveStartEnd"
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                    />
                    <Tooltip content={<DailyTooltip />} cursor={{ stroke: '#14B8A6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#14B8A6"
                      strokeWidth={3}
                      fill="url(#aGrad)"
                      dot={{ fill: '#fff', stroke: '#14B8A6', strokeWidth: 2.5, r: 4 }}
                      activeDot={{ r: 6, fill: '#14B8A6', stroke: '#fff', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>

        {/* Goal Progress */}
        <div className="animate-fade-up" style={{ animationDelay: '260ms' }}>
          <Card className="h-full" padding="lg">
            <div className="mb-5">
              <p className="text-[11px] font-bold text-accent uppercase tracking-[0.12em]">Goals</p>
              <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Progress</h3>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">Always shows today / this week / this month</p>
            </div>
            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-2.5 w-full rounded-full" /></div>)}
              </div>
            ) : (
              <div className="space-y-6">
                <GoalBar
                  label="Today"
                  achieved={goal?.daily?.achieved || 0}
                  goal={goal?.daily?.goal || 1500}
                  percentage={goal?.daily?.percentage || 0}
                  color="bg-gradient-to-r from-secondary to-secondary-light"
                />
                <GoalBar
                  label="This Week"
                  achieved={goal?.weekly?.achieved || 0}
                  goal={goal?.weekly?.goal || 8000}
                  percentage={goal?.weekly?.percentage || 0}
                  color="bg-gradient-to-r from-primary to-primary-light"
                />
                <GoalBar
                  label="This Month"
                  achieved={goal?.monthly?.achieved || 0}
                  goal={goal?.monthly?.goal || 30000}
                  percentage={goal?.monthly?.percentage || 0}
                  color="bg-gradient-to-r from-accent to-accent-dark"
                />
                <div className="pt-2 border-t border-border/40 dark:border-gray-700/40 flex items-center gap-2 text-xs text-muted dark:text-gray-400">
                  <Target className="w-3.5 h-3.5 text-secondary dark:text-teal-300 shrink-0" />
                  <span>Change goals in <span className="font-semibold text-primary dark:text-gray-100">Settings</span></span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Platform Breakdown + Day-of-Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Platform Breakdown */}
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Card className="h-full" padding="lg">
            <div className="mb-5">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">Breakdown</p>
              <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Platform Earnings</h3>
            </div>
            {loading ? (
              <div className="h-56 skeleton rounded-2xl" />
            ) : platforms.length === 0 ? (
              <EmptyState icon={BarChart3} title="No platform data" sub="Add rides with a platform to see breakdown" />
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Donut */}
                <div className="h-52 w-52 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platforms}
                        dataKey="earnings"
                        nameKey="platform"
                        cx="50%"
                        cy="50%"
                        outerRadius={88}
                        innerRadius={52}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {platforms.map((p, i) => (
                          <Cell key={p.platform} fill={getPlatformColor(p.platform, i)} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Table */}
                <div className="flex-1 min-w-0 space-y-3 w-full">
                  {platforms.map((p, i) => (
                    <div key={p.platform} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getPlatformColor(p.platform, i) }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-primary dark:text-gray-100 truncate">{p.platform}</span>
                          <span className="text-sm font-extrabold text-primary dark:text-gray-100 shrink-0">₹{fmt(p.earnings)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.percentage}%`, backgroundColor: getPlatformColor(p.platform, i) }} />
                          </div>
                          <span className="text-xs text-muted dark:text-gray-400 shrink-0">{p.rides} rides</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Day of Week */}
        <div className="animate-fade-up" style={{ animationDelay: '360ms' }}>
          <Card className="h-full" padding="lg">
            <div className="mb-5">
              <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">Pattern</p>
              <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Best Days to Drive</h3>
            </div>
            {loading ? (
              <div className="h-56 skeleton rounded-2xl" />
            ) : dow.every((d) => d.rides === 0) ? (
              <EmptyState icon={Award} title="No data for this period" sub="Add more rides to see weekly patterns" />
            ) : (
              <div className="h-56 sm:h-64 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dow} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={28}>
                    <defs>
                      <linearGradient id="dowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0D9488" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                    <Tooltip content={<DowTooltip />} cursor={{ fill: '#F1F5F9' }} />
                    <Bar dataKey="earnings" fill="url(#dowGrad)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="animate-fade-up" style={{ animationDelay: '420ms' }}>
        <Card padding="lg">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">History</p>
              <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Monthly Earnings Trend</h3>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">Last 12 months — all rides included</p>
            </div>
            {monthly.length > 0 && (
              <div className="text-right shrink-0">
                <p className="text-xs text-muted dark:text-gray-400">Best Month</p>
                <p className="text-sm font-bold text-primary dark:text-gray-100 mt-0.5">
                  {(() => {
                    const best = monthly.reduce((b, m) => m.earnings > b.earnings ? m : b)
                    return `${best.month} ${best.year}`
                  })()}
                </p>
                <p className="text-xs text-secondary dark:text-teal-300 font-semibold">
                  ₹{fmt(monthly.reduce((b, m) => m.earnings > b.earnings ? m : b).earnings)}
                </p>
              </div>
            )}
          </div>
          {loading ? (
            <div className="h-64 skeleton rounded-2xl" />
          ) : monthly.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No monthly data yet" sub="Start adding rides to track monthly trends" />
          ) : (
            <div className="h-64 sm:h-72 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={32}>
                  <defs>
                    <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                  <Tooltip content={<MonthlyTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Bar dataKey="earnings" fill="url(#mGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Top Routes */}
      <div className="animate-fade-up" style={{ animationDelay: '480ms' }}>
        <Card padding="lg">
          <div className="mb-5">
            <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">Routes</p>
            <h3 className="text-lg font-extrabold text-primary dark:text-gray-100 tracking-tight mt-0.5">Most Frequent Routes</h3>
            <p className="text-xs text-muted dark:text-gray-400 mt-1">Top 8 routes in the selected period</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-border/40 dark:border-gray-700/40">
                  <div className="skeleton h-4 w-6 rounded" />
                  <div className="flex-1 skeleton h-4 rounded" />
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : routes.length === 0 ? (
            <EmptyState icon={Route} title="No routes in this period" sub="Add rides to see your top routes" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider border-b border-border dark:border-gray-700">
                    <th className="pb-3 pr-3 w-8">#</th>
                    <th className="pb-3 pr-4">Route</th>
                    <th className="pb-3 pr-4 text-center">Trips</th>
                    <th className="pb-3 text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 dark:divide-gray-700/40">
                  {routes.map((r, i) => (
                    <tr key={`${r.pickup}-${r.dropoff}-${i}`} className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="py-3.5 pr-3">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold ${i === 0 ? 'bg-yellow-50 text-yellow-600' : i === 1 ? 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-300' : i === 2 ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400' : 'bg-slate-50 dark:bg-gray-800/60 text-muted dark:text-gray-400'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-primary dark:text-gray-100 truncate max-w-[120px] sm:max-w-[200px]">{r.pickup}</span>
                          <Zap className="w-3 h-3 text-slate-300 dark:text-gray-500 shrink-0" />
                          <span className="text-muted dark:text-gray-400 truncate max-w-[120px] sm:max-w-[200px]">{r.dropoff}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
                          {r.count}×
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-extrabold text-primary dark:text-gray-100">₹{fmt(r.totalEarnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

    </div>
  )
}
