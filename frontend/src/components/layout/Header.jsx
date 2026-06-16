import { useState } from 'react'
import { Menu } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import SearchBar from '../ui/SearchBar'
import GigTrackLogo from '../ui/GigTrackLogo'
import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../contexts/AuthContext'
import NotificationPanel from '../ui/NotificationPanel'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchVal, setSearchVal] = useState('')
  const hideSearch = pathname.startsWith('/rides')

  function handleSearch(val) {
    const q = (val ?? '').trim()
    if (q) navigate(`/rides?q=${encodeURIComponent(q)}`)
    setSearchVal('')
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Hamburger + Mobile Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl bg-white border border-border/60 hover:border-navy/20 hover:shadow-sm transition-all btn-press shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-navy" />
          </button>
          <div className="lg:hidden shrink-0">
            <GigTrackLogo size="sm" showWordmark={false} />
          </div>
        </div>

        {/* Right: Search + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {!hideSearch && (
            <SearchBar
              className="hidden md:block w-48 lg:w-64"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onSubmit={handleSearch}
            />
          )}

          <NotificationPanel />

          <div
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-navy/[0.04] transition-colors cursor-pointer"
            onClick={() => navigate('/settings?tab=profile')}
          >
            <div className="text-right hidden lg:block">
              <p className="text-[13px] font-bold text-navy leading-none">{user?.name || 'Rider'}</p>
              <p className="text-[10px] text-muted font-semibold mt-0.5 tracking-wide">Gig Rider</p>
            </div>
            <UserAvatar size="sm" variant="light" />
          </div>
        </div>
      </div>
    </header>
  )
}
