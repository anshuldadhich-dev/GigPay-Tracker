import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'

export default function FloatingActionButton({ to = '/rides/add' }) {
  return (
    <Link
      to={to}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-accent to-accent-dark text-white pl-4 pr-6 py-4 rounded-2xl shadow-glow-orange hover:scale-105 transition-all duration-300 group animate-pulse-ring btn-press"
      aria-label="Add new ride"
    >
      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <span className="text-sm font-extrabold hidden sm:inline tracking-tight">Add New Ride</span>
    </Link>
  )
}
