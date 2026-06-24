import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'gigpay-theme'

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  } catch { /* localStorage blocked */ }
  return 'system'
}

function resolveTheme(mode) {
  if (mode === 'system') return getSystemTheme()
  return mode
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredTheme)
  const [resolved, setResolved] = useState(() => resolveTheme(getStoredTheme()))

  // Apply .dark class to <html>
  const applyTheme = useCallback((newMode) => {
    const actual = resolveTheme(newMode)
    setResolved(actual)
    const root = document.documentElement
    if (actual === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Initial apply
  useEffect(() => {
    applyTheme(mode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (mode !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const actual = getSystemTheme()
      setResolved(actual)
      const root = document.documentElement
      if (actual === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mode])

  const setTheme = useCallback((newMode) => {
    setMode(newMode)
    try { localStorage.setItem(STORAGE_KEY, newMode) } catch {}
    applyTheme(newMode)
  }, [applyTheme])

  const toggleTheme = useCallback(() => {
    // Cycle: light → dark → system → light
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light'
    setTheme(next)
  }, [mode, setTheme])

  // Derive boolean for simple toggle UIs
  const isDark = resolved === 'dark'

  return (
    <ThemeContext.Provider value={{ mode, resolved, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export default ThemeContext
