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
        <label htmlFor={id} className="block text-[13px] font-semibold text-navy/80 dark:text-[#8B9DC3] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-[#6B7FA8] group-focus-within:text-royal dark:group-focus-within:text-[#6EA8FE] transition-colors duration-200" />
        )}
        <input
          id={id}
          type={type}
          className={`
            w-full rounded-xl border bg-white/70 dark:bg-[#21293D] px-4 py-3.5 text-[14px] text-navy dark:text-[#C8D6F0]
            placeholder:text-muted/50 dark:placeholder:text-[#4A5A7A] transition-all duration-200
            focus:bg-white dark:focus:bg-[#21293D] focus:outline-none focus:ring-4
            ${Icon ? 'pl-11' : ''}
            ${error
              ? 'border-red-300 dark:border-red-500/40 focus:border-red-400 dark:focus:border-red-500/60 focus:ring-red-100 dark:focus:ring-red-500/10'
              : 'border-border dark:border-[#2A3650] hover:border-bronze/40 dark:hover:border-[#374B6E] focus:border-royal dark:focus:border-[#5B9BF8]/60 focus:ring-royal/10 dark:focus:ring-[#5B9BF8]/10'
            }
          `}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-[11px] text-muted/70 dark:text-[#6B7FA8] font-medium">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 dark:text-red-400 font-medium">{error}</p>}
    </div>
  )
}
