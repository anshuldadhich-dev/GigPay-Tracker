import { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../ui/SearchBar'
import GigTrackLogo from '../ui/GigTrackLogo'
import { useAuth } from '../../contexts/AuthContext'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')

  function handleSearch(val) {
    const q = (val ?? '').trim()
    if (q) navigate(`/rides?q=${encodeURIComponent(q)}`)
    setSearchVal('')
  }
  return (
    <header className="sticky top-0 z-30 glass border-b border-white/60 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-white border border-border/60 hover:shadow-sm transition-all btn-press shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-primary" />
          </button>
          <div className="lg:hidden shrink-0">
            <GigTrackLogo size="sm" showWordmark={false} />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <SearchBar
            className="hidden md:block w-48 lg:w-64 xl:w-72"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onSubmit={handleSearch}
          />
          <button
            type="button"
            className="relative p-2.5 rounded-xl bg-white border border-border/60 hover:border-secondary/30 hover:shadow-sm transition-all btn-press"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px] text-primary" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              3
            </span>
          </button>
          <div className="hidden sm:flex items-center gap-2.5 pl-1 pr-1 py-1 rounded-xl hover:bg-white/60 transition-colors cursor-pointer">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-primary leading-none">{user?.name || 'Rider'}</p>
              <p className="text-[10px] text-muted font-semibold mt-0.5">Gig Rider</p>
            </div>
            <div className="w-9 h-9 rounded-xl border-2 border-white shadow-sm ring-1 ring-border/50 bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-sm font-extrabold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'G'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
