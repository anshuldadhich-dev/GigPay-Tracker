const variants = {
  primary:   'bg-navy text-white hover:bg-navy-light hover:shadow-navy hover:scale-[1.02] shadow-sm dark:shadow-gray-900/30',
  secondary: 'bg-royal text-white hover:bg-royal-light hover:shadow-royal hover:scale-[1.02] shadow-sm dark:shadow-gray-900/30',
  accent:    'bronze-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm dark:shadow-gray-900/30',
  cta:       'gold-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm dark:shadow-gray-900/30',
  outline:   'bg-white dark:bg-gray-900 text-navy dark:text-gray-100 border border-border dark:border-gray-700 hover:border-royal/50 hover:bg-navy/[0.03] dark:hover:bg-gray-800',
  ghost:     'text-muted dark:text-gray-400 hover:bg-navy/[0.05] dark:hover:bg-gray-800 hover:text-navy dark:hover:text-white',
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
