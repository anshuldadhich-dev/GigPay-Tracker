import { useState } from 'react'
import { ChevronLeft, ChevronRight, Flame, CalendarCheck } from 'lucide-react'
import Card from '../ui/Card'
import { activeDays, highEarningDays } from '../../data/dummyData'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function ActivityCalendar() {
  const [month] = useState(5)
  const [year] = useState(2026)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <Card dark className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold">Ride Activity</h3>
          <p className="text-sm text-slate-400 mt-0.5">June productivity overview</p>
        </div>
        <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
          <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold px-2 min-w-[80px] text-center">{MONTHS[month].slice(0, 3)}</span>
          <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center gap-2 text-secondary-light">
            <CalendarCheck className="w-4 h-4" />
            <span className="text-xs font-medium">Active Days</span>
          </div>
          <p className="text-2xl font-extrabold mt-1">{activeDays.length}</p>
        </div>
        <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
          <div className="flex items-center gap-2 text-accent">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Peak Days</span>
          </div>
          <p className="text-2xl font-extrabold mt-1">{highEarningDays.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-[10px] text-slate-500 font-bold py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {cells.map((day, i) => {
          const isActive = day && activeDays.includes(day)
          const isPeak = day && highEarningDays.includes(day)
          return (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-xs rounded-xl transition-all font-medium ${
                !day ? '' : isPeak
                  ? 'bg-accent text-white shadow-md shadow-accent/30 scale-105'
                  : isActive
                    ? 'bg-secondary text-white'
                    : 'text-slate-500 hover:bg-white/8'
              }`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <span className="text-[10px] text-slate-400">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="text-[10px] text-slate-400">Peak earnings</span>
        </div>
      </div>
    </Card>
  )
}
