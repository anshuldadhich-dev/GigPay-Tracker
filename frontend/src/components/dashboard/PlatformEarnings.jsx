import { TrendingUp } from 'lucide-react'
import Card from '../ui/Card'
import PlatformLogo from '../ui/PlatformLogo'
import { platformEarnings as dummyData } from '../../data/dummyData'

function RingProgress({ percentage, color, size = 52 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percentage / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

export default function PlatformEarnings({ data, loading }) {
  const earnings = data || []
  const total = earnings.reduce((s, p) => s + p.amount, 0)
  const maxAmount = Math.max(...earnings.map((p) => p.amount), 1)

  return (
    <Card className="h-full" padding="lg">
      <div className="mb-6">
        <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">Revenue</p>
        <h3 className="text-xl font-extrabold text-primary tracking-tight mt-1">Platform Performance</h3>
        <p className="text-2xl font-extrabold text-primary mt-2">
          {loading ? '…' : `₹${total.toLocaleString('en-IN')}`}
        </p>
        <p className="text-xs text-muted">Combined earnings across platforms</p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">Loading…</div>
      ) : earnings.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">No rides yet. Add your first ride!</div>
      ) : (
        <>
          <div className="flex items-end gap-2 h-24 mb-6 px-1">
            {earnings.map(({ platform, amount, color }) => (
              <div key={platform} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full rounded-t-xl transition-all duration-500 group-hover:opacity-80"
                  style={{ height: `${(amount / maxAmount) * 100}%`, minHeight: '20%', backgroundColor: color, opacity: 0.85 }}
                />
                <span className="text-[10px] font-bold text-muted">{platform}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {earnings.map(({ platform, amount, percentage, color, rides, growth }) => (
              <div
                key={platform}
                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/60 border border-border/40 hover:border-secondary/30 hover:bg-white hover:shadow-sm transition-all duration-300 card-premium group"
              >
                <div className="relative shrink-0">
                  <RingProgress percentage={percentage} color={color} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <PlatformLogo platform={platform} size="sm" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-primary">{platform}</p>
                    <p className="font-extrabold text-primary">₹{amount.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-muted font-medium">{rides} rides</p>
                    {growth && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" /> {growth}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-slate-200/60 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
