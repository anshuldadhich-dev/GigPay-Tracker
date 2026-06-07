export default function Input({
  label,
  id,
  type = 'text',
  icon: Icon,
  error,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-secondary transition-colors" />
        )}
        <input
          id={id}
          type={type}
          className={`w-full rounded-xl border border-border bg-slate-50/50 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-secondary focus:bg-white focus:outline-none focus:ring-4 focus:ring-secondary/10 ${Icon ? 'pl-11' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
