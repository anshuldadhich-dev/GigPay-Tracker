import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const sizeCls = {
  xs:  'w-7 h-7 text-xs rounded-xl',
  sm:  'w-9 h-9 text-sm rounded-xl',
  md:  'w-[44px] h-[44px] text-base rounded-2xl',
  lg:  'w-[56px] h-[56px] text-lg rounded-2xl',
  xl:  'w-[72px] h-[72px] text-2xl rounded-2xl',
}

/**
 * UserAvatar — shows profile photo if set, else falls back to initials avatar.
 *
 * Props:
 *  size      – 'xs' | 'sm' | 'md' | 'lg' | 'xl'  (default 'sm')
 *  variant   – 'light' | 'dark'  (controls ring/shadow style)
 *  className – extra classes on the wrapper
 */
export default function UserAvatar({ size = 'sm', variant = 'light', className = '' }) {
  const { user } = useAuth()
  const [imgError, setImgError] = useState(false)

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'G'

  // Build full URL: profilePhoto can be an absolute URL (Google) or a relative path
  const photoPath = user?.profilePhoto
  const photoUrl = photoPath
    ? photoPath.startsWith('http')
      ? photoPath
      : `${API_BASE}${photoPath}`
    : null

  const showImage = photoUrl && !imgError

  const wrapCls = `${sizeCls[size] || sizeCls.sm} shrink-0 overflow-hidden flex items-center justify-center font-extrabold select-none ${
    variant === 'dark'
      ? 'ring-2 ring-white/20 shadow-lg'
      : 'ring-2 ring-white shadow-md'
  } ${className}`

  if (showImage) {
    return (
      <img
        src={photoUrl}
        alt={user?.name || 'Profile'}
        className={`${wrapCls} object-cover`}
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className={`${wrapCls} navy-gradient text-white`}>
      {initial}
    </div>
  )
}
