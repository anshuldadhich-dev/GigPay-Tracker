import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RidePagination({ page, totalPages, onPage, total, pageSize }) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const delta = 2
  const pages = []
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  const btnCls =
    'w-9 h-9 rounded-xl border border-border/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 text-sm font-bold text-primary dark:text-gray-100 hover:border-secondary/40 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-all shadow-sm'
  const navBtnCls =
    'flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 text-sm font-bold text-primary dark:text-gray-100 hover:border-secondary/40 hover:bg-slate-50 dark:hover:bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <p className="text-sm text-muted dark:text-gray-400 font-medium">
        Showing{' '}
        <span className="font-bold text-primary dark:text-gray-100">{from}–{to}</span>
        {' '}of{' '}
        <span className="font-bold text-primary dark:text-gray-100">{total}</span> rides
      </p>

      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className={navBtnCls}>
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button type="button" onClick={() => onPage(1)} className={btnCls}>1</button>
            {pages[0] > 2 && <span className="text-muted dark:text-gray-400 font-bold px-1 text-sm">…</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={`w-9 h-9 rounded-xl border text-sm font-bold transition-all shadow-sm ${
              p === page
                ? 'bg-primary border-primary text-white'
                : 'border-border/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 text-primary dark:text-gray-100 hover:border-secondary/40 hover:bg-slate-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span className="text-muted dark:text-gray-400 font-bold px-1 text-sm">…</span>
            )}
            <button type="button" onClick={() => onPage(totalPages)} className={btnCls}>
              {totalPages}
            </button>
          </>
        )}

        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} className={navBtnCls}>
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
