import { MoreHorizontal, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import Card from '../ui/Card'
import PlatformLogo from '../ui/PlatformLogo'
import { recentRides as dummyRides } from '../../data/dummyData'

export default function RecentRidesTable({ rides, loading }) {
  const displayRides = rides || []

  return (
    <Card padding="lg" className="overflow-hidden">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-royal uppercase tracking-[0.12em]">Transactions</p>
          <h3 className="text-xl font-extrabold text-navy tracking-tight mt-1">Recent Rides</h3>
        </div>
        <button type="button" className="inline-flex items-center gap-1.5 text-sm font-bold text-navy hover:text-royal transition-colors group">
          View all
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">Loading rides…</div>
      ) : displayRides.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted text-sm">No rides yet. Add your first ride!</div>
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-border/60">
                {['Platform', 'Route', 'Fare', 'Date', ''].map((col) => (
                  <th key={col} className="text-left text-[10px] font-bold text-muted uppercase tracking-[0.1em] px-4 py-3 first:pl-2">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRides.map((ride) => (
                <tr
                  key={ride.id}
                  className="group border-b border-border/30 last:border-0 hover:bg-background transition-colors duration-150"
                >
                  <td className="px-4 py-4 first:pl-2">
                    <div className="flex items-center gap-2.5">
                      <PlatformLogo platform={ride.platform} size="sm" variant="dot" />
                      <PlatformLogo platform={ride.platform} size="sm" variant="chip" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-navy truncate max-w-[200px]">{ride.pickup}</p>
                    <p className="text-xs text-muted truncate max-w-[200px] mt-0.5">→ {ride.dropoff}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-base font-extrabold text-navy">₹{ride.fare}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ring-1 bg-emerald-50 text-emerald-700 ring-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      {ride.date
                        ? new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : ride.createdAt?.split(',')?.[0] || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-white ring-1 ring-border/50 transition-all"
                      aria-label="Options"
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
