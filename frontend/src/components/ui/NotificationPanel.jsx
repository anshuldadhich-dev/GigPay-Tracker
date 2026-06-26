import { useEffect, useRef, useState } from 'react'
import { Bell, Target, TrendingUp, Award, Bike, X, CheckCheck } from 'lucide-react'
import api from '../../services/api'

function buildNotifications(profile, earnings, totalRides) {
  const notes = []

  if (profile && earnings) {
    const { goalDaily, goalWeekly, goalMonthly } = profile
    const { daily, weekly, monthly } = earnings

    const goals = [
      { key: 'daily',   label: 'Daily',   earned: daily,   target: goalDaily   },
      { key: 'weekly',  label: 'Weekly',  earned: weekly,  target: goalWeekly  },
      { key: 'monthly', label: 'Monthly', earned: monthly, target: goalMonthly },
    ]

    for (const g of goals) {
      if (g.target <= 0) continue
      const pct = (g.earned / g.target) * 100

      if (pct >= 100) {
        notes.push({
          id: `goal-done-${g.key}`,
          icon: Target,
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          title: `${g.label} goal reached!`,
          body: `You earned ₹${g.earned.toLocaleString('en-IN')} — target was ₹${g.target.toLocaleString('en-IN')}`,
          type: 'success',
        })
      } else if (pct >= 80) {
        const remaining = Math.round(g.target - g.earned)
        notes.push({
          id: `goal-close-${g.key}`,
          icon: TrendingUp,
          iconBg: 'bg-blue-100 dark:bg-blue-500/15',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: `${g.label} goal almost there`,
          body: `₹${remaining.toLocaleString('en-IN')} more to hit your ₹${g.target.toLocaleString('en-IN')} target`,
          type: 'info',
        })
      }
    }

    // No rides today
    if (earnings.daily === 0) {
      notes.push({
        id: 'no-rides-today',
        icon: Bike,
        iconBg: 'bg-orange-100 dark:bg-orange-500/15',
        iconColor: 'text-orange-500 dark:text-orange-400',
        title: 'No rides logged today',
        body: 'Add your rides to track daily earnings',
        type: 'warning',
      })
    }
  }

  // Ride milestones
  const MILESTONES = [10, 25, 50, 100, 200, 500]
  const hit = MILESTONES.filter(m => totalRides >= m).pop()
  if (hit) {
    notes.push({
      id: `milestone-${hit}`,
      icon: Award,
      iconBg: 'bg-purple-100 dark:bg-purple-500/15',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: `${hit} rides completed!`,
      body: `You've logged ${totalRides} rides total. Keep it up!`,
      type: 'milestone',
    })
  }

  return notes
}

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed_notifs') || '[]') } catch { return [] }
  })
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.allSettled([
      api.get('/auth/profile'),
      api.get('/ride/earnings-summary'),
      api.get('/ride'),
    ]).then(([profileRes, earningsRes, ridesRes]) => {
      const profile = profileRes.status === 'fulfilled' ? profileRes.value.data.data.user : null
      const earnings = earningsRes.status === 'fulfilled' ? earningsRes.value.data.data : null
      const totalRides = ridesRes.status === 'fulfilled' ? (ridesRes.value.data.totalRides || 0) : 0
      setNotes(buildNotifications(profile, earnings, totalRides))
    }).finally(() => setLoading(false))
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function dismiss(id) {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem('dismissed_notifs', JSON.stringify(next))
  }

  function dismissAll() {
    const next = notes.map(n => n.id)
    setDismissed(next)
    localStorage.setItem('dismissed_notifs', JSON.stringify(next))
  }

  const visible = notes.filter(n => !dismissed.includes(n.id))

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative p-2.5 rounded-xl bg-white dark:bg-[#1C2333] border border-border/60 dark:border-[#2A3650] hover:border-secondary/30 dark:hover:border-[#374B6E] hover:shadow-sm dark:hover:shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all btn-press"
        aria-label="Notifications"
      >
        <Bell className="w-[18px] h-[18px] text-primary dark:text-[#8B9DC3]" />
        {visible.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-[#1C2333] shadow-sm">
            {visible.length > 9 ? '9+' : visible.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#161B27] rounded-2xl shadow-xl dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)] border border-border/60 dark:border-[#2A3650] z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 dark:border-[#1F2A40]">
            <div>
              <p className="text-sm font-extrabold text-primary dark:text-[#C8D6F0]">Notifications</p>
              <p className="text-[10px] text-muted dark:text-[#6B7FA8] font-medium">{visible.length} unread</p>
            </div>
            {visible.length > 0 && (
              <button
                type="button"
                onClick={dismissAll}
                className="flex items-center gap-1 text-[11px] font-bold text-secondary dark:text-[#5B9BF8] hover:text-secondary-dark dark:hover:text-[#7DB8FF] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/30 dark:divide-[#1F2A40]">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-muted dark:text-[#8B9DC3]">Loading…</div>
            ) : visible.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-muted/30 dark:text-[#2A3650] mx-auto mb-2" />
                <p className="text-sm font-semibold text-muted dark:text-[#8B9DC3]">All caught up!</p>
                <p className="text-xs text-muted/70 dark:text-[#6B7FA8] mt-0.5">No new notifications</p>
              </div>
            ) : (
              visible.map(({ id, icon: Icon, iconBg, iconColor, title, body }) => (
                <div key={id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/70 dark:hover:bg-[#1C2333] transition-colors group">
                  <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-primary dark:text-[#C8D6F0] leading-snug">{title}</p>
                    <p className="text-[11px] text-muted dark:text-[#8B9DC3] mt-0.5 leading-relaxed">{body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(id)}
                    className="shrink-0 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-[#21293D] transition-all mt-0.5"
                  >
                    <X className="w-3 h-3 text-muted dark:text-[#8B9DC3]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
