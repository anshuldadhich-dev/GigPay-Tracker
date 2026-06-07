import { TrendingUp, Shield, Zap } from 'lucide-react'
import GigTrackLogo, { GigTrackMark } from '../ui/GigTrackLogo'
import { authStats } from '../../data/dummyData'

const features = [
  { icon: TrendingUp, text: 'Track earnings across Uber, Ola & Rapido', color: 'text-secondary-light' },
  { icon: Shield, text: 'Your ride data stays private and secure', color: 'text-secondary-light' },
  { icon: Zap, text: 'One-click PDF report generation', color: 'text-accent' },
]

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-svh flex">
      <div className="hidden lg:flex lg:w-[55%] bg-primary p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-secondary/12 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>

<div className="relative z-10 flex flex-col items-center text-center">
          <div className="animate-float">
            <GigTrackMark size="hero" variant="dark" className="drop-shadow-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-8 tracking-tight">GigTrack</h2>
          <p className="text-secondary-light text-sm font-semibold tracking-widest uppercase mt-1">Gig Rider Earnings Tracker</p>

          <div className="grid grid-cols-3 gap-4 mt-10 w-full max-w-lg">
            {authStats.map(({ value, label }) => (
              <div key={label} className="glass-dark rounded-2xl p-4 text-center">
                <p className="text-xl font-extrabold text-white">{value}</p>
                <p className="text-[10px] text-white/40 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text, color }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {text}
              </li>
            ))}
          </ul>

        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background mesh-bg relative">
        <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
        <div className="w-full max-w-[420px] relative z-10">
          <div className="lg:hidden flex justify-center mb-8">
            <GigTrackLogo size="hero" />
          </div>

          <div className="gradient-border rounded-3xl p-8 sm:p-10 shadow-soft bg-white">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary">{title}</h2>
              <p className="text-muted mt-2 text-sm">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
