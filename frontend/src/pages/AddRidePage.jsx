import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, IndianRupee, Calendar, Car, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import PlatformLogo from '../components/ui/PlatformLogo'
import api from '../services/api'

const PLATFORMS = ['Uber', 'Ola', 'Rapido']

export default function AddRidePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    platform: 'Uber',
    pickup: '',
    dropoff: '',
    fare: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/ride', {
        pickup: form.pickup,
        dropoff: form.dropoff,
        fare: parseFloat(form.fare),
        platform: form.platform,
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save ride. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-16 animate-fade-up">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-muted hover:text-navy transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <div className="hero-gradient rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Add New Ride</h2>
            <p className="text-white/70 text-sm mt-0.5">Log a trip and track your earnings instantly</p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Ride saved! Redirecting…
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-navy/80 tracking-wide">Select Platform</label>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, platform: p })}
                  className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
                    form.platform === p
                      ? 'border-royal shadow-sm scale-[1.04] bg-royal/5'
                      : 'border-border bg-white hover:border-royal/30 hover:bg-background'
                  }`}
                >
                  <PlatformLogo platform={p} size="lg" />
                  <p className="text-xs font-bold text-navy leading-tight">{p}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border/60 space-y-4">
            <p className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5" /> Route Details
            </p>
            <Input
              id="pickup"
              label="Pickup Location"
              placeholder="e.g. Koramangala 5th Block"
              icon={MapPin}
              value={form.pickup}
              onChange={(e) => setForm({ ...form, pickup: e.target.value })}
              required
            />
            <Input
              id="dropoff"
              label="Dropoff Location"
              placeholder="e.g. Indiranagar Metro"
              icon={MapPin}
              value={form.dropoff}
              onChange={(e) => setForm({ ...form, dropoff: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="fare"
              label="Fare (₹)"
              type="number"
              placeholder="285"
              icon={IndianRupee}
              value={form.fare}
              onChange={(e) => setForm({ ...form, fare: e.target.value })}
              required
              min="1"
            />
            <Input
              id="date"
              label="Date"
              type="date"
              icon={Calendar}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button type="submit" variant="primary" size="lg" className="flex-1" disabled={loading || success}>
              {loading ? 'Saving…' : 'Save Ride'}
            </Button>
            <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
