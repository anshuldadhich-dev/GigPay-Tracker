import olaLogo from '../../assets/ola-logo.png'
import rapidoLogo from '../../assets/rapido-logo.svg'

const PLATFORM_LOGOS = {
  Ola: olaLogo,
  Rapido: rapidoLogo,
}

const PLATFORMS = {
  Uber: {
    bg: '#000000',
    text: '#FFFFFF',
    short: 'Uber',
    chipBg: 'bg-black',
    chipText: 'text-white',
    ring: 'ring-black/20',
    dotColor: 'bg-black',
  },
  Ola: {
    bg: '#08B14A',
    text: '#FFFFFF',
    short: 'OLA',
    chipBg: 'bg-green-600',
    chipText: 'text-white',
    ring: 'ring-green-600/30',
    dotColor: 'bg-green-600',
  },
  Rapido: {
    bg: '#FFC800',
    text: '#111111',
    short: 'R',
    chipBg: 'bg-yellow-400',
    chipText: 'text-black',
    ring: 'ring-yellow-400/40',
    dotColor: 'bg-yellow-400',
  },
}

const DEFAULT = {
  bg: '#64748B',
  text: '#FFFFFF',
  chipBg: 'bg-slate-500',
  chipText: 'text-white',
  ring: 'ring-slate-400/20',
  dotColor: 'bg-slate-400',
}

const iconSizes = {
  sm: { box: 'w-8 h-8 rounded-xl text-[10px]', font: 'font-black' },
  md: { box: 'w-10 h-10 rounded-xl text-xs', font: 'font-black' },
  lg: { box: 'w-14 h-14 rounded-2xl text-sm', font: 'font-black tracking-tight' },
  xl: { box: 'w-16 h-16 rounded-2xl text-base', font: 'font-black tracking-tight' },
}

const chipSizes = {
  sm: 'px-2 py-0.5 text-[10px] rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
  lg: 'px-3 py-1.5 text-sm rounded-xl',
}

export default function PlatformLogo({ platform, size = 'md', variant = 'icon', className = '' }) {
  const cfg = PLATFORMS[platform] || { ...DEFAULT, short: platform?.slice(0, 2)?.toUpperCase() || '?' }

  if (variant === 'chip') {
    return (
      <span className={`inline-flex items-center font-bold ring-1 ${cfg.chipBg} ${cfg.chipText} ${cfg.ring} ${chipSizes[size]} ${className}`}>
        {platform}
      </span>
    )
  }

  if (variant === 'dot') {
    const dotSizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' }
    return <span className={`rounded-full shrink-0 ${cfg.dotColor} ${dotSizes[size] || dotSizes.md} ${className}`} />
  }

  const s = iconSizes[size] || iconSizes.md
  const logoImg = PLATFORM_LOGOS[platform]

  return (
    <div
      className={`${s.box} flex items-center justify-center shrink-0 ring-1 ${cfg.ring} overflow-hidden select-none ${className}`}
      style={{ backgroundColor: cfg.bg }}
    >
      {logoImg
        ? <img src={logoImg} alt={platform} className="w-full h-full object-contain p-1" />
        : <span className={`${s.font}`} style={{ color: cfg.text }}>{cfg.short}</span>
      }
    </div>
  )
}

export { PLATFORMS as PLATFORM_CONFIG }
