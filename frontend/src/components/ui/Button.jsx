const variants = {
  primary:   'bg-navy text-white hover:bg-navy-light hover:shadow-navy hover:scale-[1.02] shadow-sm',
  secondary: 'bg-royal text-white hover:bg-royal-light hover:shadow-royal hover:scale-[1.02] shadow-sm',
  accent:    'bronze-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm',
  cta:       'gold-gradient text-white hover:shadow-bronze hover:scale-[1.02] shadow-sm',
  outline:   'bg-white text-navy border border-border hover:border-royal/50 hover:bg-navy/[0.03]',
  ghost:     'text-muted hover:bg-navy/[0.05] hover:text-navy',
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
