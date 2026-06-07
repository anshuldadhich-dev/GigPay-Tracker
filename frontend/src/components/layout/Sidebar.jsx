import { NavLink, useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, Car, BarChart3, FileText, Settings, LogOut, Plus, ChevronRight, Fuel } from 'lucide-react'
import GigTrackLogo from '../ui/GigTrackLogo'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/rides', label: 'Rides', icon: Car },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/fuel', label: 'Fuel Log', icon: Fuel },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initial = user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-primary-dark/70 backdrop-blur-md z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] sidebar-gradient flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 -left-16 w-40 h-40 bg-accent/8 rounded-full blur-3xl" />
        </div>

        <div className="relative px-5 py-6 border-b border-white/[0.08]">
          <GigTrackLogo to="/dashboard" size="xl" variant="dark" />
        </div>

        <div className="relative px-4 pt-5">
          <Link
            to="/rides/add"
            onClick={onClose}
            className="group flex items-center justify-center gap-2.5 w-full bg-gradient-to-r from-accent to-accent-dark hover:from-accent-dark hover:to-accent text-white py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-glow-orange btn-press hover:scale-[1.02]"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-4 h-4" />
            </div>
            Add New Ride
          </Link>
        </div>

        <nav className="relative flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] px-4 mb-3">Navigation</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-secondary/90 to-secondary-dark/90 text-white nav-active-glow'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white/15' : 'bg-white/[0.04] group-hover:bg-white/[0.08]'}`}>
                    <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative p-4 border-t border-white/[0.08] space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl glass-dark hover:bg-white/[0.08] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl border-2 border-secondary/30 bg-secondary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-white/40 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:bg-red-500/10 hover:text-red-300 transition-all btn-press"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
