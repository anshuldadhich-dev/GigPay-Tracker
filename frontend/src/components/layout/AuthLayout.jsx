import { TrendingUp, Shield, Zap, Star } from 'lucide-react'
import GigTrackLogo, { GigTrackMark } from '../ui/GigTrackLogo'
import { authStats } from '../../data/dummyData'

const features = [
  { icon: TrendingUp, text: 'Track earnings across Uber, Ola & Rapido', color: 'text-gold' },
  { icon: Shield,     text: 'Your ride data stays private and secure',   color: 'text-bronze' },
  { icon: Zap,        text: 'One-click PDF report generation',           color: 'text-gold' },
  { icon: Star,       text: 'Analytics & weekly performance insights',   color: 'text-bronze' },
]

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-svh flex">
      {/* ── Left Panel: Deep Navy (always dark, no changes needed) ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-navy-dark p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-royal/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-bronze/8 rounded-full blur-[100px]" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03] dot-grid" />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
          <div className="animate-float">
            <GigTrackMark size="hero" variant="dark" className="drop-shadow-2xl" />
          </div>
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white mt-8 tracking-tight">
            GigPay Tracker
          </h2>
          <p className="text-bronze-light/80 text-[11px] font-bold tracking-[0.22em] uppercase mt-2">
            Gig Rider Earnings Tracker
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-10 w-full max-w-xs">
            {authStats.map(({ value, label }) => (
              <div key={label} className="glass-dark rounded-2xl p-4 text-center border border-white/5">
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-[10px] text-white/35 mt-1 font-semibold tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Bronze divider */}
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-bronze to-transparent mt-8" />
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3 max-w-sm mx-auto w-full">
          {features.map(({ icon: Icon, text, color }) => (
            <li key={text} className="flex items-center gap-3 text-white/60 text-[13px] list-none">
              <div className="w-8 h-8 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              {text}
            </li>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Warm Cream (Light) / Deep Navy (Dark) ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background dark:bg-[#0D1117] mesh-bg relative transition-colors duration-300">
        <div className="absolute inset-0 dot-grid opacity-15 pointer-events-none" />

        {/* Subtle orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-bronze/5 dark:bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-navy/4 dark:bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <GigTrackLogo size="lg" />
          </div>

          {/* Form card */}
          <div className="gradient-border rounded-3xl p-8 sm:p-10 shadow-soft bg-white dark:bg-[#1C2333] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="mb-7">
              <h1 className="text-2xl sm:text-[28px] font-extrabold text-navy dark:text-[#C8D6F0] tracking-tight">{title}</h1>
              <p className="text-muted dark:text-[#8B9DC3] mt-2 text-[14px] leading-relaxed">{subtitle}</p>
            </div>
            {children}
          </div>

          <p className="text-center text-[11px] text-muted/60 dark:text-[#6B7FA8] mt-6 font-medium">
            Secure · Private · No subscription required
          </p>
        </div>
      </div>
    </div>
  )
}
