import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import AuthLayout from '../components/layout/AuthLayout'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const result = await register(form.name, form.email, form.password)
    if (result.success) {
      navigate('/login')
    } else {
      setError(result.message)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Start tracking your rides & earnings for free">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Input
          id="name"
          label="Full Name"
          type="text"
          placeholder="Your Name"
          icon={User}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          id="email"
          label="Email"
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
          placeholder="Min. 6 characters"
          icon={Lock}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />

        <Button type="submit" variant="primary" size="lg" className="w-full group" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account'}
          {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
        </Button>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-bold hover:text-secondary-light transition-colors">
            Sign in →
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
