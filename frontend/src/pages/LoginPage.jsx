import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin, loading, serverReady } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await login(form.email, form.password, rememberMe)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    const result = await googleLogin(rememberMe)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your GigPay Tracker account">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted dark:text-[#8B9DC3] cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border dark:border-[#2A3650] accent-navy focus:ring-royal/20"
            />
            Remember me
          </label>
          <span className="text-muted/60 dark:text-[#6B7FA8] text-sm font-medium cursor-not-allowed" title="Coming soon">
            Forgot password?
          </span>
        </div>

        {/* Primary CTA */}
        <Button type="submit" variant="primary" size="lg" className="w-full group" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </Button>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60 dark:border-[#2A3650]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#1C2333] px-3 text-xs text-muted dark:text-[#8B9DC3] font-semibold">or continue with</span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          id="google-signin-btn"
          onClick={handleGoogleLogin}
          disabled={loading || !serverReady}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-border/60 bg-white hover:bg-background hover:border-royal/30 text-navy font-semibold text-sm transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed dark:border-[#2A3650] dark:bg-[#21293D] dark:hover:bg-[#2A3650] dark:text-[#C8D6F0] dark:hover:border-[#374B6E]"
        >
          {!serverReady ? (
            <>
              <svg className="w-4 h-4 animate-spin text-muted dark:text-[#8B9DC3]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Server warming up…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Register link divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60 dark:border-[#2A3650]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-[#1C2333] px-3 text-xs text-muted dark:text-[#8B9DC3] font-semibold">New to GigPay?</span>
          </div>
        </div>

        <p className="text-center text-sm text-muted dark:text-[#8B9DC3]">
          <Link to="/register" className="text-royal dark:text-[#6EA8FE] font-bold hover:text-navy dark:hover:text-[#93C5FD] transition-colors">
            Create a free account →
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
