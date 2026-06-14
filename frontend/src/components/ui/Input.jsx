export default function Input({
  label,
  id,
  type = 'text',
  icon: Icon,
  error,
  hint,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-[13px] font-semibold text-navy/80 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-royal transition-colors duration-200" />
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full rounded-xl border bg-white/70 px-4 py-3.5 text-[14px] text-navy
            placeholder:text-muted/50 transition-all duration-200
            focus:bg-white focus:outline-none focus:ring-4
            ${Icon ? 'pl-11' : ''}
            ${error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-border hover:border-bronze/40 focus:border-royal focus:ring-royal/10'
            }
          `}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-[11px] text-muted/70 font-medium">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}
