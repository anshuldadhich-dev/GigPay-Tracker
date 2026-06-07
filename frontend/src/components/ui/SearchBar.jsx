import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = 'Search rides, earnings...', className = '' }) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-secondary transition-colors" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-white/80 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 transition-all font-medium"
      />
    </div>
  )
}
