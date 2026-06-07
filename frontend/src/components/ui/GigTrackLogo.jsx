import { Link } from 'react-router-dom'
import gigTrackLogo from '../../assets/GigTrackLogo.png'

const markSizes = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-20 w-20',
  hero: 'h-20 w-20 sm:h-24 sm:w-24',
}

export default function GigTrackLogo({
  size = 'md',
  to,
  className = '',
  showWordmark = true,
  variant = 'light',
}) {
  const mark = (
    <div className={`${markSizes[size]} shrink-0 rounded-2xl overflow-hidden shadow-xl p-1.5 ${variant === 'dark' ? 'bg-white ring-2 ring-white/30' : 'bg-white ring-1 ring-primary/10'}`}>
      <img
        src={gigTrackLogo}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain"
      />
    </div>
  )

  const wordmark = showWordmark && (
    <div className="min-w-0 leading-none">
      <span
        className={`block text-[17px] font-extrabold tracking-tight ${
          variant === 'dark' ? 'text-white' : 'text-primary'
        }`}
      >
        GigTrack
      </span>
      <span
        className={`block text-[11px] font-semibold tracking-widest uppercase mt-0.5 ${
          variant === 'dark' ? 'text-white/65' : 'text-muted'
        }`}
      >
        Tracker
      </span>
    </div>
  )

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      {wordmark}
    </div>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity duration-200"
        aria-label="GigTrack — Home"
      >
        {mark}
        {wordmark}
      </Link>
    )
  }

  return content
}

export function GigTrackMark({ size = 'md', className = '', variant = 'light' }) {
  return (
    <div className={`${markSizes[size]} shrink-0 rounded-2xl overflow-hidden shadow-xl p-2 ${variant === 'dark' ? 'bg-white ring-2 ring-white/30' : 'bg-white ring-1 ring-primary/10'} ${className}`}>
      <img
        src={gigTrackLogo}
        alt="GigTrack"
        className="w-full h-full object-contain"
      />
    </div>
  )
}
