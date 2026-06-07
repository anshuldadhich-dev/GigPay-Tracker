import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, CheckCircle2, Loader2, ChevronDown, AlertCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import api from '../services/api'

const MONTHS = [
  { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
  { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
  { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
  { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 },
]

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

const selectCls = 'appearance-none pl-4 pr-9 py-3 rounded-xl border border-border/60 bg-white text-sm font-semibold text-primary focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary/50 transition-all cursor-pointer hover:border-secondary/30'

const parseMonthYear = (createdAt) => {
  const parts = createdAt?.split(' ') || []
  const monthStr = parts[1]
  const yearStr = parts[2]?.replace(',', '')
  if (!monthStr || !yearStr) return null
  const monthNum = new Date(`${monthStr} 1 2000`).getMonth() + 1
  return { month: monthStr, monthNum, year: parseInt(yearStr) }
}

const buildArchive = (rides) => {
  const map = {}
  rides.forEach((ride) => {
    const parsed = parseMonthYear(ride.createdAt)
    if (!parsed) return
    const key = `${parsed.monthNum}-${parsed.year}`
    if (!map[key]) map[key] = { ...parsed, total: 0, rideCount: 0 }
    map[key].total += ride.fare
    map[key].rideCount += 1
  })
  return Object.values(map).sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.monthNum - a.monthNum
  )
}

const triggerDownload = async (monthNum, year) => {
  const res = await api.get(`/ride/report?month=${monthNum}&year=${year}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `GigPay_Report_${MONTH_NAMES[monthNum - 1]}_${year}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

function SkeletonArchiveItem() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/40">
      <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 rounded-lg w-3/4" />
        <div className="skeleton h-3 rounded-lg w-1/2" />
      </div>
      <div className="skeleton h-8 w-24 rounded-xl shrink-0" />
    </div>
  )
}

export default function ReportsPage() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(null)
  const [customError, setCustomError] = useState(null)

  const now = new Date()
  const [customMonth, setCustomMonth] = useState(now.getMonth() + 1)
  const [customYear, setCustomYear] = useState(now.getFullYear())

  useEffect(() => {
    api.get('/ride')
      .then(res => setRides(res.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const archive = buildArchive(rides)

  const handleCustomDownload = () => {
    const hasRides = archive.some(r => r.monthNum === customMonth && r.year === customYear)
    if (!hasRides) {
      setCustomError(`No rides found for ${MONTHS.find(m => m.value === customMonth)?.label} ${customYear}. Add rides first to generate a report.`)
      return
    }
    setCustomError(null)
    handleDownload(customMonth, customYear)
  }

  const handleDownload = async (monthNum, year) => {
    const key = `${monthNum}-${year}`
    setDownloading(key)
    try {
      await triggerDownload(monthNum, year)
    } catch (err) {
      console.error('Report download failed:', err)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 animate-float">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">PDF Reports</h1>
            <p className="text-white/60 text-sm mt-0.5">
              Tax-ready earnings reports — perfect for ITR filing, loans, and income proof
            </p>
          </div>
        </div>
      </div>

      {/* Custom generate */}
      <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
        <Card>
          <h2 className="text-base font-bold text-primary mb-1">Generate Report</h2>
          <p className="text-xs text-muted mb-5">Pick any month and year to download a PDF report</p>

          {customError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-4 animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" /> {customError}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Month</label>
              <div className="relative">
                <select value={customMonth} onChange={e => { setCustomMonth(Number(e.target.value)); setCustomError(null) }} className={selectCls}>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">Year</label>
              <div className="relative">
                <select value={customYear} onChange={e => { setCustomYear(Number(e.target.value)); setCustomError(null) }} className={selectCls}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
              </div>
            </div>

            <Button variant="accent" onClick={handleCustomDownload} disabled={downloading !== null || loading} className="h-[46px]">
              {downloading === `${customMonth}-${customYear}` ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Download className="w-4 h-4" /> Download PDF</>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Archive */}
      <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
        <Card>
          <h2 className="text-base font-bold text-primary mb-1">Report Archive</h2>
          <p className="text-xs text-muted mb-5">All months with recorded rides</p>

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <SkeletonArchiveItem />
                </div>
              ))}
            </div>
          ) : archive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center gap-3 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-muted">No reports yet</p>
              <p className="text-xs text-muted">Add rides to auto-generate monthly reports</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {archive.map((report, i) => {
                const key = `${report.monthNum}-${report.year}`
                const isDownloading = downloading === key
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-secondary/25 hover:bg-teal-50/20 transition-all group card-premium animate-fade-up"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 ring-1 ring-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary">{report.month} {report.year} — Earnings Report</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-[11px] text-muted flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" /> {report.month} {report.year}
                          </span>
                          <span className="text-[11px] text-muted font-medium">{report.rideCount} rides</span>
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 ml-3">
                      <p className="text-base font-extrabold text-primary hidden sm:block">
                        ₹{Math.round(report.total).toLocaleString('en-IN')}
                      </p>
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={() => handleDownload(report.monthNum, report.year)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/8 text-secondary text-xs font-bold hover:bg-secondary/15 transition-colors disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> Download</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
