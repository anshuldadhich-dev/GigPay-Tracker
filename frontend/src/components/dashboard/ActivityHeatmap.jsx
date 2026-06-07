import { useState } from 'react'
import { Activity, Calendar } from 'lucide-react'
import Card from '../ui/Card'

const LEVELS = [
  'bg-white/5 hover:bg-white/10',
  'bg-secondary/25 hover:bg-secondary/35',
  'bg-secondary/45 hover:bg-secondary/55',
  'bg-secondary/65 hover:bg-secondary/75',
  'bg-secondary hover:bg-secondary-light shadow-sm shadow-secondary/30',
]

const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']

const MONTH_MAP = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 }
const pad = (n) => String(n).padStart(2, '0')

const computeHeatmapData = (rides) => {
  // Build YYYY-MM-DD → count map from ride createdAt strings
  const countMap = {}
  rides.forEach((ride) => {
    const parts = ride.createdAt?.split(' ') || []
    const day = parts[0]?.padStart(2, '0')
    const month = String(MONTH_MAP[parts[1]] || 0).padStart(2, '0')
    const year = parts[2]?.replace(',', '')
    if (day && month !== '00' && year) {
      const key = `${year}-${month}-${day}`
      countMap[key] = (countMap[key] || 0) + 1
    }
  })

  const toLevel = (count) => count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4

  // Start grid from Monday 25 weeks ago
  const today = new Date()
  const dow = today.getDay()
  const daysToMon = dow === 0 ? 6 : dow - 1
  const start = new Date(today)
  start.setDate(today.getDate() - daysToMon - 25 * 7)

  const grid = []
  const monthLabels = []
  const cur = new Date(start)
  let lastMonth = -1

  for (let w = 0; w < 26; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const key = `${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`
      const count = countMap[key] || 0
      week.push({ level: toLevel(count), count, date: key })
      if (d === 0) {
        const m = cur.getMonth()
        monthLabels.push(m !== lastMonth ? cur.toLocaleDateString('en-IN', { month: 'short' }) : '')
        lastMonth = m
      }
      cur.setDate(cur.getDate() + 1)
    }
    grid.push(week)
  }

  return { grid, monthLabels }
}

export default function ActivityHeatmap({ rides = [] }) {
  const [hovered, setHovered] = useState(null)
  const { grid, monthLabels } = computeHeatmapData(rides)

  const allCells = grid.flat()
  const totalActive = allCells.filter((c) => c.level > 0).length
  const peakDays = allCells.filter((c) => c.level === 4).length

  return (
    <Card dark className="h-full flex flex-col" padding="lg">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-bold text-secondary-light uppercase tracking-[0.12em]">Productivity</p>
          <h3 className="text-xl font-extrabold mt-1">Ride Activity</h3>
          <p className="text-sm text-white/40 mt-0.5">Last 6 months · daily rides</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-dark rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-extrabold">{totalActive}</p>
            <p className="text-[9px] text-white/40 font-bold uppercase">Active</p>
          </div>
          <div className="glass-dark rounded-xl px-3 py-2 text-center">
            <p className="text-lg font-extrabold text-accent">{peakDays}</p>
            <p className="text-[9px] text-white/40 font-bold uppercase">Peak</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto -mx-1 px-1 pb-1">
        <div className="min-w-[520px]">
          <div className="flex gap-[3px] mb-2 pl-8">
            {monthLabels.map((m, i) => (
              <span key={i} className="text-[9px] text-white/30 font-semibold" style={{ width: '14px', minWidth: '14px' }}>
                {m}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-[3px] justify-between py-0.5 w-7 shrink-0">
              {DAYS.map((d, i) => (
                <span key={i} className="text-[8px] text-white/25 font-medium h-[13px] leading-[13px]">{d}</span>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((cell, di) => {
                    const key = `${wi}-${di}`
                    return (
                      <div
                        key={key}
                        className={`w-[13px] h-[13px] rounded-[3px] transition-all duration-150 cursor-pointer ${LEVELS[cell.level]} ${hovered === key ? 'ring-2 ring-white/40 scale-125' : ''}`}
                        onMouseEnter={() => setHovered(key)}
                        onMouseLeave={() => setHovered(null)}
                        title={cell.count > 0 ? `${cell.count} ride${cell.count > 1 ? 's' : ''} · ${cell.date}` : `No rides · ${cell.date}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-2 text-[10px] text-white/35 font-medium">
          <Activity className="w-3.5 h-3.5" />
          Less
          <div className="flex gap-[3px] mx-1">
            {LEVELS.map((cls, i) => (
              <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${cls.split(' ')[0]}`} />
            ))}
          </div>
          More
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35">
          <Calendar className="w-3 h-3" />
          {grid.length} weeks tracked
        </div>
      </div>
    </Card>
  )
}
