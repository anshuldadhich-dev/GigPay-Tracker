export default function ProgressBar({ label, amount, percentage, color = '#2563EB' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-semibold text-slate-900 dark:text-gray-100">{amount}</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-muted dark:text-gray-400">{percentage}% of total earnings</p>
    </div>
  )
}
