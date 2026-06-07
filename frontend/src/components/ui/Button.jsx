const variants = {
  primary: 'bg-gradient-to-r from-secondary to-secondary-dark text-white hover:shadow-glow-teal hover:scale-[1.02] shadow-sm',
  secondary: 'bg-white text-primary border border-border/80 hover:border-secondary/40 hover:bg-slate-50',
  accent: 'bg-gradient-to-r from-accent to-accent-dark text-white hover:shadow-glow-orange hover:scale-[1.02] shadow-sm',
  ghost: 'text-muted hover:bg-slate-100 hover:text-primary',
  dark: 'bg-primary text-white hover:bg-primary-dark shadow-glow-blue',
}

const sizes = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

export default function Button({ children, variant = 'primary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 btn-press ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
