import { useState, useEffect } from 'react'
import { Fuel, Calendar, Droplets, IndianRupee, Trash2, AlertCircle, CheckCircle2, Plus, TrendingDown } from 'lucide-react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import api from '../services/api'

const getStats = (summary) => [
  { label: 'Total Spent', value: `₹${summary.totalCost.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-accent', bg: 'bg-accent/10' },
  { label: 'Total Liters', value: `${summary.totalLiters} L`, icon: Droplets, color: 'text-secondary', bg: 'bg-secondary/10' },
  { label: 'Avg ₹/Liter', value: `₹${summary.avgPricePerLiter}`, icon: TrendingDown, color: 'text-primary-light', bg: 'bg-primary/8' },
]

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-24 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-14 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-12 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>
      <td className="py-3"><div className="skeleton h-4 w-28 rounded-lg" /></td>
      <td className="py-3 w-8"></td>
    </tr>
  )
}

export default function FuelPage() {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState({ totalCost: 0, totalLiters: 0, avgPricePerLiter: 0 })
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    liters: '',
    pricePerLiter: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const totalCost =
    form.liters && form.pricePerLiter
      ? (parseFloat(form.liters) * parseFloat(form.pricePerLiter)).toFixed(2)
      : null

  const fetchLogs = async () => {
    try {
      const res = await api.get('/fuel')
      setLogs(res.data.data || [])
      setSummary(res.data.summary || { totalCost: 0, totalLiters: 0, avgPricePerLiter: 0 })
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.post('/fuel', {
        date: form.date,
        liters: parseFloat(form.liters),
        pricePerLiter: parseFloat(form.pricePerLiter),
        notes: form.notes || undefined,
      })
      setSuccess(true)
      setForm({ date: new Date().toISOString().split('T')[0], liters: '', pricePerLiter: '', notes: '' })
      await fetchLogs()
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/fuel/${id}`)
      await fetchLogs()
    } catch {
      // silent
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-16 space-y-6">

      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-6 text-white relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center animate-float">
            <Fuel className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Fuel Log</h2>
            <p className="text-slate-300 text-sm mt-0.5">Track every fuel fill-up and manage your running costs</p>
          </div>
        </div>
      </div>

      {/* Summary stats — staggered */}
      <div className="grid grid-cols-3 gap-4">
        {getStats(summary).map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className="animate-fade-up" style={{ animationDelay: `${80 + i * 80}ms` }}>
            <Card className="text-center py-5 px-3 card-premium h-full">
              <div
                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3 animate-scale-in`}
                style={{ animationDelay: `${200 + i * 80}ms` }}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-lg font-extrabold text-primary dark:text-gray-100">{value}</p>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">{label}</p>
            </Card>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="animate-fade-up" style={{ animationDelay: '320ms' }}>
        <Card>
          <h3 className="text-base font-bold text-primary dark:text-gray-100 mb-5 flex items-center gap-2">
            <Plus className="w-4 h-4 text-secondary dark:text-teal-300" /> Add Fuel Entry
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-scale-in dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium animate-scale-in dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Fuel log saved!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input id="date" label="Date" type="date" icon={Calendar} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <Input id="liters" label="Liters Filled" type="number" placeholder="35.5" icon={Droplets} value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })} required min="0.1" step="0.1" />
              <Input id="pricePerLiter" label="Price per Liter (₹)" type="number" placeholder="103.50" icon={IndianRupee} value={form.pricePerLiter} onChange={(e) => setForm({ ...form, pricePerLiter: e.target.value })} required min="1" step="0.01" />
            </div>

            {totalCost && (
              <div className="px-4 py-3 rounded-xl bg-secondary/8 border border-secondary/20 text-sm font-semibold text-secondary animate-scale-in">
                Total cost: ₹{parseFloat(totalCost).toLocaleString('en-IN')}
              </div>
            )}

            <Input id="notes" label="Notes (optional)" placeholder="e.g. HP pump, Koramangala" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save Fuel Log'}
            </Button>
          </form>
        </Card>
      </div>

      {/* History */}
      <div className="animate-fade-up" style={{ animationDelay: '400ms' }}>
        <Card>
          <h3 className="text-base font-bold text-primary dark:text-gray-100 mb-4">Fuel History</h3>

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider border-b border-border dark:border-gray-700">
                    <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Liters</th>
                    <th className="pb-3 pr-4">₹/L</th><th className="pb-3 pr-4">Total</th>
                    <th className="pb-3">Notes</th><th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 dark:divide-gray-700/50">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
                </tbody>
              </table>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                <Fuel className="w-7 h-7 text-slate-300 dark:text-gray-500" />
              </div>
              <p className="text-sm font-semibold text-muted dark:text-gray-400">No fuel entries yet</p>
              <p className="text-xs text-muted dark:text-gray-400">Add your first entry above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider border-b border-border dark:border-gray-700">
                    <th className="pb-3 pr-4">Date</th><th className="pb-3 pr-4">Liters</th>
                    <th className="pb-3 pr-4">₹/L</th><th className="pb-3 pr-4">Total</th>
                    <th className="pb-3">Notes</th><th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 dark:divide-gray-700/50">
                  {logs.map((log, i) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors animate-fade-up"
                      style={{ animationDelay: `${i * 45}ms` }}
                    >
                      <td className="py-3 pr-4 font-medium text-primary dark:text-gray-100">{log.date}</td>
                      <td className="py-3 pr-4 text-muted dark:text-gray-400">{log.liters} L</td>
                      <td className="py-3 pr-4 text-muted dark:text-gray-400">₹{log.pricePerLiter}</td>
                      <td className="py-3 pr-4 font-semibold text-primary dark:text-gray-100">₹{log.totalCost.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-muted dark:text-gray-400 max-w-[160px] truncate">{log.notes || '—'}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 rounded-lg text-muted dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
