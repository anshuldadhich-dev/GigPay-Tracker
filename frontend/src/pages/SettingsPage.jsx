import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  User, Target, Zap, FileText, Sun, Shield, Database,
  Camera, Check, ChevronRight, Eye, EyeOff, Download,
  LogOut, Moon, Monitor, AlertTriangle, Save, Lock,
  Smartphone, Bell, MapPin, Phone, Mail, ArrowRight, AlertCircle, Loader2,
  CalendarDays, TrendingUp,
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PlatformLogo from '../components/ui/PlatformLogo'
import Button from '../components/ui/Button'
import ToggleSwitch from '../components/ui/ToggleSwitch'

// ─────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────

function SettingsCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-[22px] border border-border/50 shadow-card overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-7">
      <h2 className="text-[22px] font-extrabold text-primary tracking-tight">{title}</h2>
      <p className="text-sm text-muted mt-1.5 leading-relaxed max-w-lg">{description}</p>
    </div>
  )
}

function SettingsRow({ icon: Icon, iconBg = 'bg-slate-100', iconColor = 'text-muted', label, description, action, noBorder = false }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-6 py-[18px] group hover:bg-slate-50/70 transition-colors duration-150 ${noBorder ? '' : 'border-b border-border/40 last:border-0'}`}>
      <div className="flex items-center gap-4 min-w-0">
        {Icon && (
          <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110`}>
            <Icon className={`w-[17px] h-[17px] ${iconColor}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-primary leading-tight">{label}</p>
          {description && <p className="text-xs text-muted mt-0.5 leading-snug">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-slate-50/50 text-sm font-medium text-primary placeholder:text-muted/60 focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all hover:border-slate-300'
const lockedInputCls = 'w-full px-4 py-3 rounded-xl border border-border/40 bg-slate-50 text-sm font-medium text-muted cursor-not-allowed'

// ─────────────────────────────────────────
// 1. Profile
// ─────────────────────────────────────────

function ProfileSection({ user }) {
  const { updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: '',
  })
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhoto || null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    api.get('/auth/profile').then(res => {
      const u = res.data.data.user
      setForm(f => ({ ...f, name: u.name || '', phone: u.phone || '', city: u.city || '' }))
      setPhotoUrl(u.profilePhoto || null)
    }).catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await api.put('/auth/profile', { name: form.name, phone: form.phone, city: form.city })
      updateUser(res.data.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    } catch {
      setError('Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await api.post('/auth/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data.data.user.profilePhoto
      setPhotoUrl(url)
      updateUser(res.data.data.user)
    } catch {
      setError('Photo upload failed. Max 5MB, images only.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const initial = form.name?.charAt(0)?.toUpperCase() || 'G'
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const fullPhotoUrl = photoUrl ? `${API_BASE}${photoUrl}` : null

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Profile"
        description="Your personal information. Email is tied to your account and cannot be changed here."
      />

      <SettingsCard>
        <div className="p-6 sm:p-7 border-b border-border/40 flex items-center gap-5">
          <div className="relative group shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
            {fullPhotoUrl ? (
              <img
                src={fullPhotoUrl}
                alt="Profile"
                className="w-[72px] h-[72px] rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-secondary via-primary to-primary-dark flex items-center justify-center text-white text-2xl font-black shadow-lg select-none">
                {initial}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-black/55 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
              {uploading
                ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                : <Camera className="w-5 h-5 text-white" />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

          <div className="min-w-0">
            <p className="text-base font-extrabold text-primary leading-tight truncate">{form.name || 'Your Name'}</p>
            <p className="text-xs text-muted mt-0.5 truncate">{form.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary hover:text-secondary-dark transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
          </div>

          <div className="ml-auto hidden sm:block">
            <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-bold">
              Active rider
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div className="p-6 sm:p-7 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Anshul Dadhich"
                className={inputCls + ' pl-10'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50 pointer-events-none" />
              <input type="email" value={form.email} readOnly className={lockedInputCls + ' pl-10'} />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted/40 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className={inputCls + ' pl-10'}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">City</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Bengaluru, Karnataka"
                className={inputCls + ' pl-10'}
              />
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-7 pb-6 flex items-center gap-3 border-t border-border/40 pt-5">
          <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : saved
                ? <><Check className="w-4 h-4" /> Saved!</>
                : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
          <button
            type="button"
            onClick={() => {
              setForm(f => ({ ...f, name: user?.name || '', phone: '', city: '' }))
              setError(null)
            }}
            className="text-sm font-semibold text-muted hover:text-primary transition-colors"
          >
            Discard
          </button>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─────────────────────────────────────────
// 2. Earnings Goals
// ─────────────────────────────────────────

function GoalsSection() {
  const { updateUser } = useAuth()
  const [goals, setGoals] = useState({ daily: 1500, weekly: 8000, monthly: 30000 })
  const [earned, setEarned] = useState({ daily: 0, weekly: 0, monthly: 0 })
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setFetchError(null)

    Promise.allSettled([
      api.get('/auth/profile'),
      api.get('/ride/earnings-summary'),
    ]).then(([profileResult, earningsResult]) => {
      if (profileResult.status === 'fulfilled') {
        const u = profileResult.value.data.data.user
        setGoals({ daily: u.goalDaily, weekly: u.goalWeekly, monthly: u.goalMonthly })
      } else {
        console.error('Goals fetch error:', profileResult.reason)
        setFetchError('Could not load goal targets.')
      }

      if (earningsResult.status === 'fulfilled') {
        setEarned(earningsResult.value.data.data)
      } else {
        console.error('Earnings fetch error:', earningsResult.reason)
        setFetchError(prev => prev ? prev + ' Could not load earnings.' : 'Could not load earnings.')
      }
    }).finally(() => setLoading(false))
  }, [refreshKey])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', {
        goalDaily: goals.daily,
        goalWeekly: goals.weekly,
        goalMonthly: goals.monthly,
      })
      updateUser(res.data.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const config = [
    { key: 'daily',   label: 'Daily Goal',   icon: Sun,          iconBg: 'bg-teal-100',   iconColor: 'text-teal-600',   gradient: 'from-teal-400 to-secondary',  pill: 'bg-teal-50 text-teal-700 ring-teal-100'     },
    { key: 'weekly',  label: 'Weekly Goal',  icon: CalendarDays, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   gradient: 'from-blue-500 to-primary',    pill: 'bg-blue-50 text-blue-700 ring-blue-100'     },
    { key: 'monthly', label: 'Monthly Goal', icon: TrendingUp,   iconBg: 'bg-orange-100', iconColor: 'text-orange-600', gradient: 'from-orange-400 to-accent',   pill: 'bg-orange-50 text-orange-700 ring-orange-100' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          title="Earnings Goals"
          description="Set targets to stay motivated. Progress reflects your actual rides for today, this week, and this month."
        />
        <button
          type="button"
          onClick={() => setRefreshKey(k => k + 1)}
          disabled={loading}
          className="shrink-0 mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted hover:text-primary hover:border-secondary/40 transition-all disabled:opacity-40"
        >
          <Loader2 className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{fetchError}
        </div>
      )}

      <div className="space-y-4">
        {config.map(({ key, label, icon: Icon, iconBg, iconColor, gradient, pill }) => {
          const pct = goals[key] > 0 ? Math.min(100, Math.round((earned[key] / goals[key]) * 100)) : 0
          const remaining = Math.max(0, goals[key] - earned[key])
          return (
            <SettingsCard key={key}>
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div>
                      <p className="font-extrabold text-primary">{label}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {loading ? (
                          <div className="skeleton h-4 w-24 rounded-full" />
                        ) : (
                          <>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${pill}`}>
                              ₹{earned[key].toLocaleString('en-IN')} earned
                            </span>
                            <span className="text-[10px] text-muted font-medium">of ₹{goals[key].toLocaleString('en-IN')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-extrabold text-muted">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={goals[key]}
                      onChange={e => setGoals(g => ({ ...g, [key]: Math.max(0, Number(e.target.value)) }))}
                      className="w-28 text-right px-3 py-2.5 rounded-xl border border-border bg-slate-50/60 text-sm font-extrabold text-primary focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className={`${pct >= 100 ? 'text-emerald-600' : 'text-muted'}`}>
                      {pct >= 100 ? 'Goal reached!' : `${pct}% of goal`}
                    </span>
                    {pct < 100 && (
                      <span className="text-muted">₹{remaining.toLocaleString('en-IN')} remaining</span>
                    )}
                  </div>
                </div>
              </div>
            </SettingsCard>
          )
        })}
      </div>

      <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : saved
            ? <><Check className="w-4 h-4" /> Saved!</>
            : <><Save className="w-4 h-4" /> Save Goals</>}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────
// 3. Platforms
// ─────────────────────────────────────────

const DEFAULT_PLATFORMS = ['Uber', 'Ola', 'Rapido']

function PlatformsSection() {
  const [platformData, setPlatformData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ride/platform-summary')
      .then(res => setPlatformData(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const rideMap = Object.fromEntries(platformData.map(p => [p.platform, p]))

  // Show default 3 + any extra platforms from ride history
  const extraFromRides = platformData.map(p => p.platform).filter(p => !DEFAULT_PLATFORMS.includes(p))
  const ALL_PLATFORMS = [...DEFAULT_PLATFORMS, ...extraFromRides]

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Connected Platforms"
        description="Platforms are marked active based on your actual ride history. Add rides on any platform to see it here."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_PLATFORMS.map((p, i) => {
          const data = rideMap[p]
          const isActive = !!data

          return (
            <div
              key={p}
              className={`relative p-5 rounded-[20px] border-2 text-left transition-all duration-200 animate-fade-up ${
                isActive
                  ? 'border-secondary bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-[0_0_0_4px_rgba(20,184,166,0.08)]'
                  : 'border-border/50 bg-white opacity-60'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <PlatformLogo platform={p} size="md" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-secondary border-secondary' : 'border-slate-200'
                }`}>
                  {isActive && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </div>

              <p className="font-extrabold text-primary text-[15px]">{p}</p>

              {loading ? (
                <div className="skeleton h-3 w-20 rounded-full mt-2" />
              ) : isActive ? (
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-[11px] font-bold text-secondary">● Active</p>
                  <p className="text-[11px] text-muted font-medium">
                    {data.totalRides} ride{data.totalRides !== 1 ? 's' : ''} · ₹{Math.round(data.totalEarnings).toLocaleString('en-IN')}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-semibold text-muted mt-1">○ No rides yet</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// 4. Reports
// ─────────────────────────────────────────

function ReportsSection() {
  const [prefs, setPrefs] = useState({
    autoReport: true,
    frequency: 'weekly',
    analytics: true,
    platformBreakdown: true,
    earningsSummary: true,
    rideLog: false,
  })
  const toggle = key => setPrefs(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Report Preferences"
        description="Control what's included in your scheduled earnings reports and when they arrive."
      />

      <SettingsCard>
        <SettingsRow
          icon={Bell}
          iconBg="bg-secondary/10"
          iconColor="text-secondary"
          label="Automatic Reports"
          description="Receive scheduled summaries to your email"
          action={<ToggleSwitch checked={prefs.autoReport} onChange={v => setPrefs(p => ({ ...p, autoReport: v }))} />}
        />

        {prefs.autoReport && (
          <div className="px-6 py-4 border-b border-border/40 bg-slate-50/50">
            <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-3">Send reports</p>
            <div className="flex gap-2">
              {['weekly', 'monthly'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPrefs(p => ({ ...p, frequency: f }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-150 ${
                    prefs.frequency === f
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-border/60 text-muted hover:text-primary hover:border-secondary/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 pt-5 pb-1">
          <p className="text-[11px] font-bold text-muted uppercase tracking-widest">Include in reports</p>
        </div>

        {[
          { key: 'analytics',         label: 'Analytics Overview',   desc: 'Charts, trends and growth comparisons' },
          { key: 'platformBreakdown', label: 'Platform Breakdown',   desc: 'Earnings split per platform' },
          { key: 'earningsSummary',   label: 'Earnings Summary',     desc: 'Total gross, net and monthly figures' },
          { key: 'rideLog',           label: 'Full Ride Log',        desc: 'Every trip with date and fare' },
        ].map(({ key, label, desc }) => (
          <SettingsRow
            key={key}
            label={label}
            description={desc}
            action={<ToggleSwitch checked={prefs[key]} onChange={() => toggle(key)} />}
          />
        ))}
      </SettingsCard>
    </div>
  )
}

// ─────────────────────────────────────────
// 5. Appearance
// ─────────────────────────────────────────

function AppearanceSection() {
  const [theme, setTheme] = useState('light')

  const themes = [
    {
      id: 'light',
      label: 'Light',
      icon: Sun,
      preview: (
        <div className="w-full aspect-video rounded-xl bg-[#f8fafc] border border-slate-200 overflow-hidden p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-900/25" />
            <div className="flex-1 h-1.5 bg-slate-200 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-1/3 h-5 bg-white border border-slate-200 rounded-lg" />
            <div className="w-1/3 h-5 bg-white border border-slate-200 rounded-lg" />
            <div className="w-1/3 h-5 bg-teal-100 border border-teal-200 rounded-lg" />
          </div>
          <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
          <div className="h-3 w-1/2 bg-slate-100 rounded-full" />
        </div>
      ),
    },
    {
      id: 'dark',
      label: 'Dark',
      icon: Moon,
      preview: (
        <div className="w-full aspect-video rounded-xl bg-[#0f172a] overflow-hidden p-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-500/40" />
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full" />
          </div>
          <div className="flex gap-1.5">
            <div className="w-1/3 h-5 bg-slate-800 rounded-lg" />
            <div className="w-1/3 h-5 bg-slate-800 rounded-lg" />
            <div className="w-1/3 h-5 bg-teal-900/60 rounded-lg" />
          </div>
          <div className="h-3 w-3/4 bg-slate-800 rounded-full" />
          <div className="h-3 w-1/2 bg-slate-800 rounded-full" />
        </div>
      ),
    },
    {
      id: 'system',
      label: 'System',
      icon: Monitor,
      preview: (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200">
          <div className="h-1/2 bg-[#f8fafc] p-3 border-b border-slate-200">
            <div className="h-1.5 w-3/4 bg-slate-200 rounded-full" />
            <div className="h-1.5 w-1/2 bg-slate-100 rounded-full mt-1.5" />
          </div>
          <div className="h-1/2 bg-[#0f172a] p-3">
            <div className="h-1.5 w-2/3 bg-slate-700 rounded-full" />
            <div className="h-1.5 w-2/5 bg-slate-800 rounded-full mt-1.5" />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Appearance"
        description="Choose how GigPay Tracker looks on your device. Dark mode is coming soon."
      />

      <div className="grid grid-cols-3 gap-4">
        {themes.map(({ id, label, icon: Icon, preview }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            className={`p-4 rounded-[20px] border-2 text-left transition-all duration-200 group ${
              theme === id
                ? 'border-secondary shadow-[0_0_0_4px_rgba(20,184,166,0.08)] scale-[1.02] bg-gradient-to-b from-secondary/5 to-transparent'
                : 'border-border/50 bg-white hover:border-secondary/40 hover:scale-[1.01]'
            }`}
          >
            {preview}
            <div className="flex items-center gap-2 mt-3.5">
              <Icon className={`w-3.5 h-3.5 transition-colors ${theme === id ? 'text-secondary' : 'text-muted'}`} />
              <span className={`text-sm font-bold transition-colors ${theme === id ? 'text-primary' : 'text-muted'}`}>
                {label}
              </span>
              {theme === id && (
                <span className="ml-auto w-4 h-4 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <SettingsCard>
        <SettingsRow
          label="Dark mode"
          description="Available in the next update"
          action={<ToggleSwitch checked={false} onChange={() => {}} disabled />}
          noBorder
        />
      </SettingsCard>
    </div>
  )
}

// ─────────────────────────────────────────
// 6. Security
// ─────────────────────────────────────────

function SecuritySection() {
  const { logout } = useAuth()
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', message: '' }

  function pwStrength(p) {
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  }

  const str = pwStrength(pass.next)
  const strMeta = [
    null,
    { label: 'Weak',   color: 'bg-red-400',     text: 'text-red-500'     },
    { label: 'Fair',   color: 'bg-orange-400',   text: 'text-orange-500'  },
    { label: 'Good',   color: 'bg-yellow-400',   text: 'text-yellow-600'  },
    { label: 'Strong', color: 'bg-emerald-500',  text: 'text-emerald-600' },
  ]

  async function handleUpdatePassword() {
    setStatus(null)

    if (!pass.current || !pass.next || !pass.confirm) {
      setStatus({ type: 'error', message: 'Please fill in all password fields.' })
      return
    }
    if (pass.next !== pass.confirm) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }
    if (pass.next.length < 6) {
      setStatus({ type: 'error', message: 'New password must be at least 6 characters.' })
      return
    }

    setLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pass.current,
        newPassword: pass.next,
      })
      setStatus({ type: 'success', message: 'Password changed successfully!' })
      setPass({ current: '', next: '', confirm: '' })
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  const ua = navigator.userAgent
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua)
  const browser = /Edg/i.test(ua) ? 'Edge' : /OPR|Opera/i.test(ua) ? 'Opera' : /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : 'Browser'
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown OS'
  const currentDevice = `${browser} · ${os}`

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Security"
        description="Keep your account safe with a strong password and monitor active sessions."
      />

      {/* Password */}
      <SettingsCard>
        <div className="flex items-center gap-3.5 px-6 pt-6 pb-5 border-b border-border/40">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-extrabold text-primary">Change Password</p>
            <p className="text-xs text-muted mt-0.5">Use at least 6 characters with a mix of letters, numbers and symbols</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {status && (
            <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium animate-scale-in ${
              status.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}>
              {status.type === 'success'
                ? <Check className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />}
              {status.message}
            </div>
          )}

          {[
            { key: 'current', label: 'Current Password',     placeholder: '••••••••' },
            { key: 'next',    label: 'New Password',         placeholder: '••••••••' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[11px] font-bold text-muted uppercase tracking-widest mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={show[key] ? 'text' : 'password'}
                  value={pass[key]}
                  onChange={e => { setPass(p => ({ ...p, [key]: e.target.value })); setStatus(null) }}
                  placeholder={placeholder}
                  className={inputCls + ' pr-11 tracking-widest'}
                />
                <button
                  type="button"
                  onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {show[key]
                    ? <EyeOff className="w-[15px] h-[15px] text-muted" />
                    : <Eye className="w-[15px] h-[15px] text-muted" />}
                </button>
              </div>

              {key === 'current' && pass.current && (
                <p className="text-[11px] font-bold text-secondary mt-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Current password entered
                </p>
              )}

              {key === 'next' && pass.next && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i <= str ? strMeta[str]?.color : 'bg-slate-100'}`} />
                    ))}
                  </div>
                  {strMeta[str] && <p className={`text-[11px] font-bold ${strMeta[str].text}`}>{strMeta[str].label} password</p>}
                </div>
              )}

              {key === 'confirm' && pass.confirm && (
                pass.next === pass.confirm
                  ? <p className="text-[11px] font-bold text-emerald-600 mt-1.5 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                  : <p className="text-[11px] font-bold text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Passwords don't match</p>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-1 border-t border-border/40">
          <Button variant="primary" size="sm" onClick={handleUpdatePassword} disabled={loading}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
              : <><Lock className="w-4 h-4" /> Update Password</>}
          </Button>
        </div>
      </SettingsCard>

      {/* Sessions */}
      <SettingsCard>
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <p className="font-extrabold text-primary">Active Session</p>
          <p className="text-xs text-muted mt-0.5">Device currently signed in to your account</p>
        </div>

        <div className="flex items-center gap-4 px-6 py-4 border-b border-border/30">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            {isMobile
              ? <Smartphone className="w-[18px] h-[18px] text-muted" />
              : <Monitor className="w-[18px] h-[18px] text-muted" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-primary">{currentDevice}</p>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold ring-1 ring-emerald-100">
                This device
              </span>
            </div>
            <p className="text-[11px] text-muted mt-0.5">Active now</p>
          </div>
        </div>

        <div className="px-6 py-4">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            Sign out of all devices
          </button>
        </div>
      </SettingsCard>
    </div>
  )
}

// ─────────────────────────────────────────
// 7. Data & Privacy
// ─────────────────────────────────────────

function DataSection() {
  const { logout } = useAuth()
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [clearLoading, setClearLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState({ csv: false, pdf: false })
  const [actionError, setActionError] = useState(null)

  async function handleExportCSV() {
    setExportLoading(s => ({ ...s, csv: true }))
    try {
      const res = await api.get('/ride/export/csv', { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'GigPay_Rides_Export.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setActionError('CSV export failed. Try again.')
    } finally {
      setExportLoading(s => ({ ...s, csv: false }))
    }
  }

  async function handleExportPDF() {
    setExportLoading(s => ({ ...s, pdf: true }))
    try {
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      const res = await api.get(`/ride/report?month=${month}&year=${year}`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `GigPay_Report_${month}_${year}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setActionError('PDF export failed. Try again.')
    } finally {
      setExportLoading(s => ({ ...s, pdf: false }))
    }
  }

  async function handleClearHistory() {
    setClearLoading(true)
    setActionError(null)
    try {
      await api.delete('/ride/all')
      setConfirmClear(false)
    } catch {
      setActionError('Failed to clear ride history. Try again.')
    } finally {
      setClearLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    setActionError(null)
    try {
      await api.delete('/auth/account')
      logout()
    } catch {
      setActionError('Failed to delete account. Try again.')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Data & Privacy"
        description="Export your earnings data or manage your account. Deletions are permanent."
      />

      {/* Export */}
      <SettingsCard>
        <div className="px-6 pt-6 pb-4 border-b border-border/40">
          <p className="font-extrabold text-primary">Export Data</p>
          <p className="text-xs text-muted mt-0.5">Download a complete copy of your rides and earnings history</p>
        </div>
        {actionError && (
          <div className="mx-5 mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{actionError}
          </div>
        )}
        <div className="p-5 grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exportLoading.csv}
            className="group flex items-center gap-4 p-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 hover:scale-[1.02] hover:shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
              {exportLoading.csv ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="text-left min-w-0">
              <p className="font-bold text-emerald-800 text-sm">{exportLoading.csv ? 'Exporting…' : 'Export CSV'}</p>
              <p className="text-[11px] text-emerald-600/80 mt-0.5">Spreadsheet-ready format</p>
            </div>
            <Download className="w-4 h-4 text-emerald-500 ml-auto group-hover:translate-y-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportLoading.pdf}
            className="group flex items-center gap-4 p-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 hover:scale-[1.02] hover:shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
              {exportLoading.pdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            </div>
            <div className="text-left min-w-0">
              <p className="font-bold text-blue-800 text-sm">{exportLoading.pdf ? 'Exporting…' : 'Export PDF'}</p>
              <p className="text-[11px] text-blue-600/80 mt-0.5">Current month report</p>
            </div>
            <Download className="w-4 h-4 text-blue-500 ml-auto group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </SettingsCard>

      {/* Danger Zone */}
      <div className="rounded-[22px] border border-red-200/60 bg-white overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-red-50/80 to-orange-50/30 border-b border-red-100/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="font-extrabold text-red-600 text-[13.5px]">Danger Zone</p>
            <p className="text-[11px] text-red-400 mt-0.5">These actions are permanent and irreversible</p>
          </div>
        </div>

        <div className="divide-y divide-red-50">
          {/* Clear history */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">Clear Ride History</p>
              <p className="text-xs text-muted mt-0.5">Permanently delete all your recorded rides and earnings</p>
            </div>
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="shrink-0 px-4 py-2 rounded-xl border-2 border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all"
              >
                Clear History
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  disabled={clearLoading}
                  className="px-3.5 py-2 rounded-xl border border-border text-sm font-bold text-muted hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={clearLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-60"
                >
                  {clearLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Clearing…</> : 'Yes, clear it'}
                </button>
              </div>
            )}
          </div>

          {/* Delete account */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">Delete Account</p>
              <p className="text-xs text-muted mt-0.5">Permanently delete your account, profile, and all data</p>
            </div>
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all shadow-sm"
              >
                Delete Account
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleteLoading}
                  className="px-3.5 py-2 rounded-xl border border-border text-sm font-bold text-muted hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-bold transition-all shadow-sm disabled:opacity-60"
                >
                  {deleteLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</> : 'I understand, delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Main Settings Page
// ─────────────────────────────────────────

const SECTIONS = [
  { id: 'profile',    label: 'Profile',    icon: User,      desc: 'Personal info'      },
  { id: 'goals',      label: 'Goals',      icon: Target,    desc: 'Earnings targets'   },
  { id: 'platforms',  label: 'Platforms',  icon: Zap,       desc: 'Connected apps'     },
  { id: 'reports',    label: 'Reports',    icon: FileText,  desc: 'Preferences'        },
  { id: 'appearance', label: 'Appearance', icon: Sun,       desc: 'Theme & display'    },
  { id: 'security',   label: 'Security',   icon: Shield,    desc: 'Password & sessions'},
  { id: 'data',       label: 'Data',       icon: Database,  desc: 'Export & privacy'   },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const validTabs = ['profile', 'goals', 'platforms', 'reports', 'appearance', 'security', 'data']
  const tabFromUrl = searchParams.get('tab')
  const [active, setActive] = useState(validTabs.includes(tabFromUrl) ? tabFromUrl : 'profile')

  const sectionMap = {
    profile:    <ProfileSection user={user} />,
    goals:      <GoalsSection />,
    platforms:  <PlatformsSection />,
    reports:    <ReportsSection />,
    appearance: <AppearanceSection />,
    security:   <SecuritySection />,
    data:       <DataSection />,
  }

  return (
    <div className="animate-fade-up pb-16">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-bold text-muted uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1.5">Manage your account, preferences and data.</p>
      </div>

      {/* Mobile horizontal tabs */}
      <div className="lg:hidden -mx-4 px-4 mb-7 overflow-x-auto">
        <div className="flex gap-2 pb-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                active === id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-border/60 text-muted hover:text-primary hover:border-secondary/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Desktop left nav */}
        <aside className="hidden lg:flex flex-col gap-0.5 w-[200px] shrink-0 sticky top-24">
          {SECTIONS.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 ${
                active === id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted hover:text-primary hover:bg-white hover:shadow-sm'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                active === id
                  ? 'bg-white/15'
                  : 'bg-slate-100 group-hover:bg-slate-200'
              }`}>
                <Icon className="w-[15px] h-[15px]" strokeWidth={active === id ? 2.5 : 2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-bold leading-tight ${active === id ? 'text-white' : ''}`}>{label}</p>
                <p className={`text-[10px] mt-0.5 font-medium ${active === id ? 'text-white/50' : 'text-muted/60'}`}>{desc}</p>
              </div>
              {active === id && <ChevronRight className="w-3 h-3 text-white/50 shrink-0" />}
            </button>
          ))}
        </aside>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div key={active} className="animate-fade-up">
            {sectionMap[active]}
          </div>
        </div>
      </div>
    </div>
  )
}
