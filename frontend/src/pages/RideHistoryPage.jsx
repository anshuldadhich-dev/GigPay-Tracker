import { useState, useMemo, useEffect, useCallback } from 'react'
import { History, Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { recentRides as dummyRides } from '../data/dummyData'
import RideFilters from '../components/rides/RideFilters'
import RideTable from '../components/rides/RideTable'
import RidePagination from '../components/rides/RidePagination'

const PAGE_SIZE = 10

function getRideTime(ride) {
  if (ride.createdAt) {
    const d = new Date(ride.createdAt)
    if (!isNaN(d.getTime())) return d.getTime()
  }
  if (ride.date) return new Date(ride.date + 'T00:00:00').getTime()
  return ride.id || 0
}

export default function RideHistoryPage() {
  const [searchParams] = useSearchParams()
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [platform, setPlatform] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('latest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/ride')
      .then(res => setRides(res.data?.data || res.data?.rides || []))
      .catch(() => setRides(dummyRides))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { setPage(1) }, [search, platform, dateFrom, dateTo, sort])

  const filtered = useMemo(() => {
    let result = [...rides]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.pickup?.toLowerCase().includes(q) ||
        r.dropoff?.toLowerCase().includes(q) ||
        r.platform?.toLowerCase().includes(q) ||
        String(r.fare ?? '').includes(q)
      )
    }

    if (platform !== 'All') {
      result = result.filter(r => r.platform === platform)
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime()
      result = result.filter(r => getRideTime(r) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo).getTime() + 86_399_999
      result = result.filter(r => getRideTime(r) <= to)
    }

    result.sort((a, b) => {
      if (sort === 'latest') return getRideTime(b) - getRideTime(a)
      if (sort === 'oldest') return getRideTime(a) - getRideTime(b)
      if (sort === 'highest') return b.fare - a.fare
      if (sort === 'lowest') return a.fare - b.fare
      return 0
    })

    return result
  }, [rides, search, platform, dateFrom, dateTo, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleDelete = useCallback(async (id) => {
    await api.delete(`/ride/${id}`)
    setRides(prev => prev.filter(r => r.id !== id))
  }, [])

  const handleEdit = useCallback(async (id, data) => {
    const res = await api.put(`/ride/${id}`, data)
    const updated = res.data?.data || res.data?.ride || {}
    setRides(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)))
  }, [])

  return (
    <div className="space-y-6 animate-fade-up pb-10">
      {/* Header banner */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
              <History className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Ride History</h1>
              <p className="text-white/60 text-sm mt-0.5">
                {loading ? 'Loading…' : `${rides.length} total rides tracked`}
              </p>
            </div>
          </div>
          <Link
            to="/rides/add"
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 text-primary dark:text-gray-100 hover:bg-white/90 dark:hover:bg-gray-800 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-black/20 btn-press"
          >
            <Plus className="w-4 h-4" />
            Add Ride
          </Link>
        </div>
      </div>

      {/* Filters */}
      <RideFilters
        search={search} onSearch={setSearch}
        platform={platform} onPlatform={setPlatform}
        dateFrom={dateFrom} onDateFrom={setDateFrom}
        dateTo={dateTo} onDateTo={setDateTo}
        sort={sort} onSort={setSort}
        total={filtered.length}
      />

      {/* Table */}
      <RideTable
        rides={paginated}
        loading={loading}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <RidePagination
          page={page}
          totalPages={totalPages}
          onPage={setPage}
          total={filtered.length}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  )
}
