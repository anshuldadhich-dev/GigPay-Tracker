const variants = {
  primary:   'bg-navy text-white hover:bg-navy-light hover:shadow-navy hover:scale-[1.02] shadow-sm dark:bg-[#2455B5] dark:hover:bg-[#3368CC] dark:shadow-[0_4px_16px_-4px_rgba(91,155,248,0.25)]',
  secondary: 'bg-royal text-white hover:bg-royal-light hover:shadow-royal hover:scale-[1.02] shadow-sm dark:shadow-[0_4px_16px_-4px_rgba(91,155,248,0.20)]',
  accent:    'bronze-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm',
  cta:       'gold-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm',
  outline:   'bg-white dark:bg-[#1C2333] text-navy dark:text-[#C8D6F0] border border-border dark:border-[#2A3650] hover:border-royal/50 dark:hover:border-[#5B9BF8]/40 hover:bg-navy/[0.03] dark:hover:bg-[#21293D]',
  ghost:     'text-muted dark:text-[#8B9DC3] hover:bg-navy/[0.05] dark:hover:bg-[#1C2333] hover:text-navy dark:hover:text-[#C8D6F0]',
  dark:      'bg-navy-dark text-white hover:bg-navy shadow-navy',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-press ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
