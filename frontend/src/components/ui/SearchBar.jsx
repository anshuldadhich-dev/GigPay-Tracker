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
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted dark:text-gray-400 group-focus-within:text-secondary transition-colors pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 text-sm text-primary dark:text-gray-100 placeholder:text-muted dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 transition-all font-medium"
      />
    </form>
  )
}
