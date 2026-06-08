import { useRef } from 'react'
import { Search, ChevronDown, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'
import Card from '../ui/Card'

const PLATFORMS = ['All', 'Uber', 'Ola', 'Rapido']
const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest fare' },
  { value: 'lowest', label: 'Lowest fare' },
]

const selectCls =
  'appearance-none pl-3.5 pr-9 py-2.5 rounded-xl border border-border/60 bg-white text-sm font-semibold text-primary focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 transition-all cursor-pointer hover:border-secondary/30'
const dateCls =
  'px-3.5 py-2.5 rounded-xl border border-border/60 bg-white text-sm font-medium text-primary focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 transition-all hover:border-secondary/30'

export default function RideFilters({
  search, onSearch,
  platform, onPlatform,
  dateFrom, onDateFrom,
  dateTo, onDateTo,
  sort, onSort,
  total,
}) {
  const inputRef = useRef(null)
  const hasFilters = platform !== 'All' || dateFrom || dateTo || search.trim()

  function clearAll() {
    onSearch('')
    onPlatform('All')
    onDateFrom('')
    onDateTo('')
    onSort('latest')
    inputRef.current?.focus()
  }

  function handleClearSearch() {
    onSearch('')
    inputRef.current?.focus()
  }

  return (
    <Card padding="md" className="space-y-4">
      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-secondary transition-colors pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          onFocus={e => e.target.select()}
          autoFocus
          placeholder="Search by pickup, dropoff, platform or fare…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-border/60 bg-slate-50/60 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 focus:bg-white transition-all font-medium"
        />
        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <SlidersHorizontal className="w-3.5 h-3.5 text-muted shrink-0" />

        {/* Platform */}
        <div className="relative">
          <select value={platform} onChange={e => onPlatform(e.target.value)} className={selectCls}>
            {PLATFORMS.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Platforms' : p}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        {/* Date range */}
        <input type="date" value={dateFrom} onChange={e => onDateFrom(e.target.value)} className={dateCls} />
        <span className="text-xs text-muted font-medium">→</span>
        <input type="date" value={dateTo} onChange={e => onDateTo(e.target.value)} className={dateCls} />

        {/* Sort — pushed right on sm+ */}
        <div className="relative sm:ml-auto">
          <select value={sort} onChange={e => onSort(e.target.value)} className={selectCls}>
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-red-500 hover:bg-red-50 border border-border/60 bg-white transition-all"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <p className="text-[11px] text-muted font-semibold uppercase tracking-wider">
        {total} {total === 1 ? 'ride' : 'rides'} found
      </p>
    </Card>
  )
}
