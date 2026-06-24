import { Link } from 'react-router-dom'
import gigPayLogo from '../../assets/GigLogo.png'

const markSizes = {
  sm:   'h-8 w-8',
  md:   'h-10 w-10',
  lg:   'h-12 w-12',
  xl:   'h-14 w-14',
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
    <div className={`${markSizes[size]} shrink-0 rounded-2xl overflow-hidden flex items-center justify-center ${
      variant === 'dark'
        ? 'bg-white/90 shadow-lg ring-1 ring-white/30'
        : 'bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 ring-1 ring-navy/8 dark:ring-gray-500/20'
    }`}>
      <img
        src={gigPayLogo}
        alt=""
        aria-hidden="true"
        className="w-full h-full object-contain"
      />
    </div>
  )

  const wordmark = showWordmark && (
    <div className="min-w-0 leading-none">
      <span className={`block text-[17px] font-extrabold tracking-tight ${
        variant === 'dark' ? 'text-white' : 'text-navy dark:text-gray-100'
      }`}>
        GigPay
      </span>
      <span className={`block text-[10px] font-bold tracking-[0.18em] uppercase mt-0.5 ${
        variant === 'dark' ? 'text-white/55' : 'text-muted dark:text-gray-400'
      }`}>
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
        aria-label="GigPay Tracker — Home"
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
    <div className={`${markSizes[size]} shrink-0 rounded-2xl overflow-hidden flex items-center justify-center ${
      variant === 'dark'
        ? 'bg-white/90 shadow-xl ring-1 ring-white/30'
        : 'bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 ring-1 ring-navy/8 dark:ring-gray-500/20'
    } ${className}`}>
      <img
        src={gigPayLogo}
        alt="GigPay Tracker"
        className="w-full h-full object-contain"
      />
    </div>
  )
}
