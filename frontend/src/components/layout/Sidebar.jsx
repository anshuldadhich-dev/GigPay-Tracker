import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Car, BarChart3, FileText,
  Settings, LogOut, Plus, ChevronRight, Fuel, Clock,
} from 'lucide-react'
import GigTrackLogo from '../ui/GigTrackLogo'
import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/rides',     label: 'Rides',      icon: Car },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { to: '/reports',   label: 'Reports',    icon: FileText },
  { to: '/fuel',      label: 'Fuel Log',   icon: Fuel },
  { to: '/shifts',    label: 'Shifts',     icon: Clock },
  { to: '/settings',  label: 'Settings',   icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }



  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[272px] sidebar-gradient flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-royal/12 rounded-full blur-[80px]" />
          <div className="absolute bottom-40 -left-12 w-40 h-40 bg-bronze/10 rounded-full blur-[60px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-gold/4 rounded-full blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative px-5 pt-6 pb-5 border-b border-white/[0.07]">
          <GigTrackLogo to="/dashboard" size="md" variant="dark" />
        </div>

        {/* Add New Ride CTA */}
        <div className="relative px-4 pt-5">
          <Link
            to="/rides/add"
            onClick={onClose}
            className="group flex items-center justify-center gap-2.5 w-full bronze-gradient hover:shadow-bronze text-white py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-md btn-press hover:scale-[1.02]"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-3.5 h-3.5" />
            </div>
            Add New Ride
          </Link>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.18em] px-3 mb-3">
            Navigation
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-royal/80 text-white nav-active-glow'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? 'bg-white/15'
                        : 'bg-white/[0.04] group-hover:bg-white/[0.07]'
                    }`}
                  >
                    <Icon className="w-[17px] h-[17px]" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="flex-1 font-semibold">{label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-glow" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="relative p-4 border-t border-white/[0.07] space-y-1.5">
          <div className="flex items-center gap-3 p-3 rounded-2xl glass-dark hover:bg-white/[0.07] transition-colors cursor-pointer">
            <UserAvatar size="sm" variant="dark" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-white truncate">{user?.name || 'Rider'}</p>
              <p className="text-[11px] text-white/35 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/35 hover:bg-red-500/10 hover:text-red-300 transition-all btn-press"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
