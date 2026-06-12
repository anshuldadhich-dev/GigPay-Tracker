import { useState, useEffect } from 'react'
import FloatingActionButton from '../components/ui/FloatingActionButton'
import DashboardHero from '../components/dashboard/DashboardHero'
import EarningsChart from '../components/dashboard/EarningsChart'
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap'
import PlatformEarnings from '../components/dashboard/PlatformEarnings'
import RecentRidesTable from '../components/dashboard/RecentRidesTable'
import ReportsSection from '../components/dashboard/ReportsSection'
import WeeklyEarnings from '../components/dashboard/WeeklyEarnings'
import NetEarningsCards from '../components/dashboard/NetEarningsCards'
import api from '../services/api'

const PLATFORM_COLORS = {
  Uber: '#000000',
  Ola: '#08B14A',
  Rapido: '#FFC800',
  InDrive: '#111111',
  'Namma Yatri': '#5B21B6',
}

// Parse "7 Jun 2026, 10:30:00 am" → { month: 'Jun', monthNum: 6, year: 2026 }
const parseMonthYear = (createdAt) => {
  const parts = createdAt?.split(' ') || []
  const monthStr = parts[1]
  const yearStr = parts[2]?.replace(',', '')
  if (!monthStr || !yearStr) return null
  const monthNum = new Date(`${monthStr} 1 2000`).getMonth() + 1
  return { month: monthStr, monthNum, year: parseInt(yearStr) }
}

const computeStreak = (rides) => {
  if (rides.length === 0) return 0
  const MONTHS = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 }
  const rideDays = new Set()
  rides.forEach((ride) => {
    const parts = ride.createdAt?.split(' ') || []
    const day = parts[0]?.padStart(2, '0')
    const month = String(MONTHS[parts[1]] || 0).padStart(2, '0')
    const year = parts[2]?.replace(',', '')
    if (day && month !== '00' && year) rideDays.add(`${year}-${month}-${day}`)
  })
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (rideDays.has(key)) streak++
    else break
  }
  return streak
}

const computeMonthlyChartData = (rides) => {
  const map = {}
  rides.forEach((ride) => {
    const parsed = parseMonthYear(ride.createdAt)
    if (!parsed) return
    const key = `${parsed.monthNum}-${parsed.year}`
    if (!map[key]) map[key] = { month: parsed.month, monthNum: parsed.monthNum, year: parsed.year, earnings: 0, rides: 0 }
    map[key].earnings += ride.fare
    map[key].rides += 1
  })
  return Object.values(map)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.monthNum - b.monthNum)
    .slice(-6)
}

export default function DashboardPage() {
  const [rides, setRides] = useState([])
  const [platformData, setPlatformData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ridesRes, platformRes] = await Promise.all([
          api.get('/ride'),
          api.get('/ride/platform-summary'),
        ])

        const ridesData = ridesRes.data.data || []
        setRides(ridesData)

        const rawPlatform = platformRes.data.data || []
        const total = rawPlatform.reduce((s, p) => s + p.totalEarnings, 0)
        setPlatformData(
          rawPlatform.map((p) => ({
            platform: p.platform,
            amount: Math.round(p.totalEarnings),
            rides: p.totalRides,
            percentage: total > 0 ? Math.round((p.totalEarnings / total) * 100) : 0,
            color: PLATFORM_COLORS[p.platform] || '#64748B',
          }))
        )
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Today's rides (IST)
  const todayStr = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const todayRides = rides.filter((r) => r.createdAt?.startsWith(todayStr))
  const todayEarnings = todayRides.reduce((s, r) => s + r.fare, 0)

  // All-time totals (used for chart insights)
  const grossAll = rides.reduce((s, r) => s + r.fare, 0)

  // Monthly chart data from rides
  const monthlyChartData = computeMonthlyChartData(rides)

  // Chart insights
  const avgPerRide = rides.length > 0 ? Math.round(grossAll / rides.length) : 0
  const bestMonth = monthlyChartData.length > 0
    ? monthlyChartData.reduce((best, m) => m.earnings > best.earnings ? m : best)
    : null
  const last = monthlyChartData[monthlyChartData.length - 1]
  const prev = monthlyChartData[monthlyChartData.length - 2]
  const growthRate = last && prev && prev.earnings > 0
    ? ((last.earnings - prev.earnings) / prev.earnings * 100).toFixed(1)
    : null

  const chartInsights = [
    { label: 'Avg. per Ride', value: rides.length > 0 ? `₹${avgPerRide.toLocaleString('en-IN')}` : '—', change: `${rides.length} total rides`, icon: 'trending' },
    { label: 'Best Month', value: bestMonth ? bestMonth.month : '—', change: bestMonth ? `₹${Math.round(bestMonth.earnings).toLocaleString('en-IN')}` : 'No data yet', icon: 'star' },
    { label: 'Growth Rate', value: growthRate !== null ? `${growthRate >= 0 ? '+' : ''}${growthRate}%` : '—', change: 'vs last month', icon: 'zap' },
  ]

  const todaySummaryReal = {
    rides: todayRides.length,
    earnings: `₹${todayEarnings.toLocaleString('en-IN')}`,
    bestPlatform: platformData[0]?.platform || '—',
    streak: computeStreak(rides),
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 max-w-[1440px] mx-auto">
      <DashboardHero todaySummary={todaySummaryReal} loading={loading} />

      <section>
        <NetEarningsCards />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        <div className="xl:col-span-3 min-w-0">
          <EarningsChart data={monthlyChartData} insights={chartInsights} loading={loading} />
        </div>
        <div className="xl:col-span-2 min-w-0">
          <ActivityHeatmap rides={rides} />
        </div>
      </section>

      <section>
        <WeeklyEarnings rides={rides} loading={loading} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 min-w-0">
          <PlatformEarnings data={platformData} loading={loading} />
        </div>
        <div className="lg:col-span-3 min-w-0">
          <RecentRidesTable rides={rides.slice(0, 8)} loading={loading} />
        </div>
      </section>

      <section>
        <ReportsSection rides={rides} />
      </section>

      <FloatingActionButton />
    </div>
  )
}
