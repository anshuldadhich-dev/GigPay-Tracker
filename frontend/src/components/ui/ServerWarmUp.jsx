import { useEffect, useState } from 'react'

// Animated dots for the status message
function AnimatedDots() {
  const [dots, setDots] = useState('')
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(id)
  }, [])
  return <span className="server-warmup-dots">{dots}</span>
}

export default function ServerWarmUp({ progress = 0, message = 'Waking up the server…' }) {
  const isReady = progress >= 100
  const clampedProgress = Math.min(progress, 100)

  return (
    <div className="server-warmup-overlay">
      {/* Background gradient orbs */}
      <div className="server-warmup-orb server-warmup-orb--1" />
      <div className="server-warmup-orb server-warmup-orb--2" />
      <div className="server-warmup-orb server-warmup-orb--3" />

      <div className="server-warmup-card">
        {/* Logo / Icon */}
        <div className="server-warmup-logo">
          <div className="server-warmup-logo-ring server-warmup-logo-ring--outer" />
          <div className="server-warmup-logo-ring server-warmup-logo-ring--inner" />
          <div className="server-warmup-logo-icon">
            {isReady ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            )}
          </div>
        </div>

        {/* App name */}
        <h1 className="server-warmup-title">GigPay Tracker</h1>
        <p className="server-warmup-subtitle">Your gig earnings dashboard</p>

        {/* Progress bar */}
        <div className="server-warmup-progress-wrap">
          <div
            className={`server-warmup-progress-fill ${isReady ? 'server-warmup-progress-fill--ready' : ''}`}
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Status */}
        <p className="server-warmup-status">
          {isReady ? (
            <span className="server-warmup-status--ready">✓ &nbsp;{message}</span>
          ) : (
            <>
              {message}
              <AnimatedDots />
            </>
          )}
        </p>

        {/* Tip */}
        {!isReady && (
          <p className="server-warmup-tip">
            ☕ Free hosting cold-starts can take up to 60 seconds
          </p>
        )}
      </div>
    </div>
  )
}
