import { Search } from 'lucide-react'

export default function SearchBar({
  placeholder = 'Search rides, earnings...',
  className = '',
  value,
  onChange,
  onSubmit,
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        const val = value ?? e.currentTarget.querySelector('input')?.value ?? ''
        onSubmit?.(val)
      }}
      className={`relative group ${className}`}
    >
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-[#6B7FA8] group-focus-within:text-secondary dark:group-focus-within:text-[#5B9BF8] transition-colors pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 dark:border-[#2A3650] bg-white/80 dark:bg-[#1C2333] text-sm text-primary dark:text-[#C8D6F0] placeholder:text-muted dark:placeholder:text-[#4A5A7A] focus:outline-none focus:ring-4 focus:ring-secondary/10 dark:focus:ring-[#5B9BF8]/10 focus:border-secondary/50 dark:focus:border-[#5B9BF8]/40 transition-all font-medium"
      />
    </form>
  )
}
