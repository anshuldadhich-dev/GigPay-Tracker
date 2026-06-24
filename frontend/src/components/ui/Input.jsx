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
        <label htmlFor={id} className="block text-[13px] font-semibold text-navy/80 dark:text-gray-100/80 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-gray-400 group-focus-within:text-royal transition-colors duration-200" />
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full rounded-xl border bg-white/70 dark:bg-gray-900/70 px-4 py-3.5 text-[14px] text-navy dark:text-gray-100
            placeholder:text-muted/50 dark:placeholder:text-gray-500 transition-all duration-200
            focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4
            ${Icon ? 'pl-11' : ''}
            ${error
              ? 'border-red-300 dark:border-red-800 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30'
              : 'border-border dark:border-gray-700 hover:border-bronze/40 dark:hover:border-bronze/60 focus:border-royal dark:focus:border-royal/50 focus:ring-royal/10 dark:focus:ring-royal/20'
            }
          `}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-[11px] text-muted/70 dark:text-gray-400/70 font-medium">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">{error}</p>}
    </div>
  )
}
