import Card from '../ui/Card'
import { TrendingUp } from 'lucide-react'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getISTDate(date) {
  const IST_OFFSET = 5.5 * 60 * 60 * 1000
  return new Date(date.getTime() + IST_OFFSET)
}

// Returns array of 7 day objects for current week (Mon–Sun IST)
function buildWeekDays() {
  const nowIST = getISTDate(new Date())
  const dow = nowIST.getUTCDay() // 0=Sun
  const daysFromMon = dow === 0 ? 6 : dow - 1
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(nowIST)
    d.setUTCDate(nowIST.getUTCDate() - daysFromMon + i)
    const yyyy = d.getUTCFullYear()
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    days.push({
      key: `${yyyy}-${mm}-${dd}`,
      dayLabel: DAY_LABELS[i],
      date: parseInt(dd),
      isFuture: d.getUTCFullYear() > nowIST.getUTCFullYear() ||
        (d.getUTCFullYear() === nowIST.getUTCFullYear() && d.getUTCMonth() > nowIST.getUTCMonth()) ||
        (d.getUTCFullYear() === nowIST.getUTCFullYear() && d.getUTCMonth() === nowIST.getUTCMonth() && d.getUTCDate() > nowIST.getUTCDate()),
      isToday: `${yyyy}-${mm}-${dd}` === `${String(nowIST.getUTCFullYear())}-${String(nowIST.getUTCMonth() + 1).padStart(2, '0')}-${String(nowIST.getUTCDate()).padStart(2, '0')}`,
      earnings: 0,
      rides: 0,
    })
  }
  return days
}

export default function WeeklyEarnings({ rides = [], loading = false }) {
  const days = buildWeekDays()

  // Map rides to days
  if (rides.length > 0) {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000
    rides.forEach((ride) => {
      const rIST = getISTDate(new Date(ride.createdAt))
      const yyyy = rIST.getUTCFullYear()
      const mm = String(rIST.getUTCMonth() + 1).padStart(2, '0')
      const dd = String(rIST.getUTCDate()).padStart(2, '0')
      const key = `${yyyy}-${mm}-${dd}`
      const day = days.find(d => d.key === key)
      if (day) {
        day.earnings += ride.fare
        day.rides += 1
      }
    })
  }

  const maxEarnings = Math.max(...days.map(d => d.earnings), 1)
  const weekTotal = days.reduce((s, d) => s + d.earnings, 0)
  const weekRides = days.reduce((s, d) => s + d.rides, 0)
  const activeDays = days.filter(d => d.earnings > 0).length

  return (
    <Card padding="lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-royal uppercase tracking-[0.12em]">This Week</p>
          <h3 className="text-lg font-extrabold text-navy tracking-tight mt-0.5">Daily Breakdown</h3>
        </div>
        {!loading && weekTotal > 0 && (
          <div className="text-right">
            <p className="text-xl font-extrabold text-navy">₹{Math.round(weekTotal).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-muted mt-0.5">{weekRides} rides · {activeDays} days active</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="skeleton h-3 w-6 rounded" />
              <div className="skeleton h-16 w-full rounded-xl" />
              <div className="skeleton h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day) => {
              const heightPct = day.earnings > 0 ? Math.max(12, Math.round((day.earnings / maxEarnings) * 100)) : 0
              return (
                <div key={day.key} className="flex flex-col items-center gap-1.5">
                  {/* Day label */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${day.isToday ? 'text-secondary' : 'text-muted'}`}>
                    {day.dayLabel}
                  </span>

                  {/* Bar container */}
                  <div className="relative w-full h-20 flex items-end justify-center">
                    {day.isFuture ? (
                      <div className="w-full h-2 rounded-full bg-slate-100" />
                    ) : day.earnings > 0 ? (
                      <div
                        className={`w-full rounded-xl transition-all duration-500 relative group cursor-default ${
                          day.isToday
                            ? 'bg-gradient-to-t from-royal to-royal-light shadow-sm shadow-royal/30'
                            : 'bg-gradient-to-t from-navy/10 to-royal/20 hover:from-royal/50 hover:to-royal-light/50'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          ₹{Math.round(day.earnings).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-2 rounded-full bg-slate-100" />
                    )}
                  </div>

                  {/* Date number */}
                  <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                    day.isToday
                      ? 'bg-royal text-white'
                      : day.earnings > 0
                      ? 'text-navy'
                      : 'text-muted/30'
                  }`}>
                    {day.date}
                  </span>

                  {/* Earnings label */}
                  <span className={`text-[10px] font-semibold text-center leading-tight ${
                    day.isFuture ? 'text-transparent' : day.earnings > 0 ? 'text-royal' : 'text-muted/30'
                  }`}>
                    {day.earnings > 0
                      ? day.earnings >= 1000
                        ? `₹${(day.earnings / 1000).toFixed(1)}k`
                        : `₹${Math.round(day.earnings)}`
                      : '—'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Bottom insights row */}
          {weekTotal > 0 && (
            <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-3 gap-3">
              {(() => {
                const bestDay = days.reduce((b, d) => d.earnings > b.earnings ? d : b, days[0])
                const avgDay = activeDays > 0 ? Math.round(weekTotal / activeDays) : 0
                return [
                  { label: 'Best Day', value: bestDay.earnings > 0 ? `${bestDay.dayLabel} ₹${Math.round(bestDay.earnings).toLocaleString('en-IN')}` : '—' },
                  { label: 'Daily Avg', value: avgDay > 0 ? `₹${avgDay.toLocaleString('en-IN')}` : '—' },
                  { label: 'Active Days', value: `${activeDays} / 7` },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl bg-background border border-border/40 p-3 text-center">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-extrabold text-navy mt-1">{value}</p>
                  </div>
                ))
              })()}
            </div>
          )}

          {weekTotal === 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted py-2">
              <TrendingUp className="w-4 h-4 text-slate-300" />
              <span>No rides this week yet</span>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
