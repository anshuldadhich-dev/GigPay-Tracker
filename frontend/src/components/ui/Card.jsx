export default function Card({ children, className = '', dark = false, padding = 'md', ...props }) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-7' }

  return (
    <div
      className={`rounded-[22px] ${paddings[padding]} ${
        dark
          ? 'bg-primary text-white shadow-2xl shadow-primary/25 border border-white/[0.06]'
          : 'bg-card border border-border/40 shadow-card'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
