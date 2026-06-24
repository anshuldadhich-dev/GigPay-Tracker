import { useState } from 'react'
import { Download, FileText, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import api from '../../services/api'

const parseMonthYear = (createdAt) => {
  const parts = createdAt?.split(' ') || []
  const monthStr = parts[1]
  const yearStr = parts[2]?.replace(',', '')
  if (!monthStr || !yearStr) return null
  const monthNum = new Date(`${monthStr} 1 2000`).getMonth() + 1
  return { month: monthStr, monthNum, year: parseInt(yearStr) }
}

const computeReportHistory = (rides) => {
  const map = {}
  rides.forEach((ride) => {
    const parsed = parseMonthYear(ride.createdAt)
    if (!parsed) return
    const key = `${parsed.monthNum}-${parsed.year}`
    if (!map[key]) map[key] = { ...parsed, total: 0, rideCount: 0 }
    map[key].total += ride.fare
    map[key].rideCount += 1
  })
  return Object.values(map)
    .sort((a, b) => a.year !== b.year ? b.year - a.year : b.monthNum - a.monthNum)
    .slice(0, 6)
}

const triggerDownload = async (monthNum, year) => {
  const res = await api.get(`/ride/report?month=${monthNum}&year=${year}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `GigPay_Report_${monthNum}_${year}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsSection({ rides = [] }) {
  const [downloading, setDownloading] = useState(null)

  const history = computeReportHistory(rides)
  const latest = history[0]

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
    <Card padding="lg">
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        <div className="xl:w-[38%] hero-mesh rounded-[20px] p-7 text-white relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl glass-dark flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 text-secondary-light" />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">PDF Reports</h3>
            <p className="text-white/55 text-sm mt-3 leading-relaxed">
              Generate tax-ready earnings reports. Perfect for loans, ITR filing, and income proof.
            </p>
            <Button
              variant="accent"
              className="mt-6 w-full sm:w-auto"
              disabled={!latest || downloading !== null}
              onClick={() => latest && handleDownload(latest.monthNum, latest.year)}
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? 'Generating…' : 'Download Latest'}
            </Button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-secondary uppercase tracking-[0.12em]">History</p>
          <h3 className="text-xl font-extrabold text-primary tracking-tight mt-1 mb-5 dark:text-gray-100">Report Archive</h3>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <FileText className="w-10 h-10 text-slate-200 dark:text-gray-700" />
              <p className="text-sm font-medium text-muted dark:text-gray-400">No reports yet.</p>
              <p className="text-xs text-muted dark:text-gray-400">Add rides to generate monthly reports.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((report) => {
                const key = `${report.monthNum}-${report.year}`
                const isDownloading = downloading === key
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-secondary/25 hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-transparent transition-all duration-200 group card-premium dark:border-gray-700/40 dark:hover:border-gray-600 dark:hover:bg-gradient-to-r dark:hover:from-teal-900/30 dark:hover:to-transparent"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform shrink-0 dark:bg-blue-900/30 dark:ring-blue-800/50">
                        <FileText className="w-5 h-5 text-primary dark:text-gray-100" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary truncate dark:text-gray-100">{report.month} {report.year} Earnings Report</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                          <span className="text-[11px] text-muted flex items-center gap-1 font-medium dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {report.month} {report.year}
                          </span>
                          <span className="text-[11px] text-muted font-medium dark:text-gray-400">{report.rideCount} rides</span>
                          <span className="text-[11px] text-emerald-600 flex items-center gap-0.5 font-bold dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Ready
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-base font-extrabold text-primary dark:text-gray-100">₹{Math.round(report.total).toLocaleString('en-IN')}</p>
                      <button
                        type="button"
                        disabled={isDownloading}
                        onClick={() => handleDownload(report.monthNum, report.year)}
                        className="text-[11px] text-secondary font-bold mt-0.5 hover:underline opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        {isDownloading ? 'Downloading…' : 'Download'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
