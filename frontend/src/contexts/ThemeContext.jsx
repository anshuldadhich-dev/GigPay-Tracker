import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'gigpay-theme'

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch { /* localStorage blocked */ }
  return 'light' // default is always light, no system mode
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredTheme)

  // Apply .dark class to <html>
  const applyTheme = useCallback((newMode) => {
    const root = document.documentElement
    if (newMode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  // Initial apply
  useEffect(() => {
    applyTheme(mode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setTheme = useCallback((newMode) => {
    setMode(newMode)
    try { localStorage.setItem(STORAGE_KEY, newMode) } catch {}
    applyTheme(newMode)
  }, [applyTheme])

  // Simple toggle: light ↔ dark only
  const toggleTheme = useCallback(() => {
    const next = mode === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [mode, setTheme])

  const isDark = mode === 'dark'
  const resolved = mode // resolved === mode since no system mode

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
