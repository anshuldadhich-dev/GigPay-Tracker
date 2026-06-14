import { createContext, useContext, useState, useEffect } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user')) || null 
    } catch { 
      return null 
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serverReady, setServerReady] = useState(false)

  // Render free tier wake-up ping — backend ko pehle se warm kar do
  useEffect(() => {
    const warmUp = async () => {
      try {
        await api.get('/health', { timeout: 30000 })
      } catch {
        // ignore — bas wake-up ke liye
      } finally {
        setServerReady(true)
      }
    }
    warmUp()
  }, [])

  const login = async (email, password, rememberMe = false) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', data.data.token)
      storage.setItem('user', JSON.stringify(data.data.user))
      setUser(data.data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/register', { name, email, password })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (rememberMe = false) => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { data } = await api.post('/auth/google-login', { idToken })
      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('token', data.data.token)
      storage.setItem('user', JSON.stringify(data.data.user))
      setUser(data.data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Google sign-in failed'
      setError(msg)
      return { success: false, message: msg }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData) => {
    const merged = { ...user, ...userData }
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(merged))
    }
    if (sessionStorage.getItem('user')) {
      sessionStorage.setItem('user', JSON.stringify(merged))
    }
    setUser(merged)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, serverReady, login, register, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
