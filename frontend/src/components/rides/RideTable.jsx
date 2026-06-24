import { useState } from 'react'
import { Eye, Pencil, Trash2, MapPin, Car, Plus, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import PlatformLogo from '../ui/PlatformLogo'
import Button from '../ui/Button'

const PLATFORMS = ['Uber', 'Ola', 'Rapido']

function getRideDisplayDate(ride) {
  if (ride.date) {
    return new Date(ride.date + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }
  if (ride.createdAt) return ride.createdAt.split(',')[0]
  return '—'
}

function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full ${maxWidth} animate-fade-up overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/40 dark:border-gray-700/40">
          <h3 className="text-lg font-extrabold text-primary dark:text-gray-100">{title}</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-muted dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/30 dark:border-gray-700/30">
      <td className="px-4 py-4 first:pl-2"><div className="w-8 h-8 skeleton rounded-xl" /></td>
      <td className="px-4 py-4">
        <div className="w-28 h-3.5 skeleton rounded-lg" />
        <div className="w-20 h-3 skeleton rounded-lg mt-2" />
      </td>
      <td className="px-4 py-4">
        <div className="w-28 h-3.5 skeleton rounded-lg" />
        <div className="w-20 h-3 skeleton rounded-lg mt-2" />
      </td>
      <td className="px-4 py-4"><div className="w-14 h-5 skeleton rounded-lg" /></td>
      <td className="px-4 py-4"><div className="w-24 h-6 skeleton rounded-xl" /></td>
      <td className="px-4 py-4">
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 skeleton rounded-xl" />)}
        </div>
      </td>
    </tr>
  )
}

export default function RideTable({ rides, loading, onDelete, onEdit }) {
  const [viewRide, setViewRide] = useState(null)
  const [editRide, setEditRide] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  function openEdit(ride) {
    setEditForm({
      platform: ride.platform,
      pickup: ride.pickup,
      dropoff: ride.dropoff,
      fare: String(ride.fare),
    })
    setEditRide(ride)
    setEditError(null)
  }

  async function handleEditSave() {
    setEditLoading(true)
    setEditError(null)
    try {
      await onEdit(editRide.id, {
        platform: editForm.platform,
        pickup: editForm.pickup,
        dropoff: editForm.dropoff,
        fare: parseFloat(editForm.fare),
      })
      setEditRide(null)
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update ride.')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDeleteConfirm() {
    setDeleteLoading(true)
    try {
      await onDelete(deleteId)
      setDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50 text-sm text-primary dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-secondary/10 focus:border-secondary transition-all'

  return (
    <>
      <Card padding="lg" className="overflow-hidden">
        <div className="overflow-x-auto -mx-2">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border/60 dark:border-gray-700/60">
                {['Platform', 'Pickup', 'Dropoff', 'Fare', 'Date', 'Actions'].map(col => (
                  <th
                    key={col}
                    className="text-left text-[10px] font-bold text-muted dark:text-gray-400 uppercase tracking-[0.1em] px-4 py-3 first:pl-2"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              ) : rides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                        <Car className="w-8 h-8 text-slate-300 dark:text-gray-500" />
                      </div>
                      <p className="font-bold text-primary dark:text-gray-100 mt-1">No rides found</p>
                      <p className="text-sm text-muted dark:text-gray-400">Try adjusting your search or filters</p>
                      <Link
                        to="/rides/add"
                        className="mt-2 inline-flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-secondary-dark transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add your first ride
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                rides.map(ride => (
                  <tr
                    key={ride.id}
                    className="group border-b border-border/30 dark:border-gray-700/30 last:border-0 hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors duration-150"
                  >
                    <td className="px-4 py-4 first:pl-2">
                      <PlatformLogo platform={ride.platform} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-primary dark:text-gray-100 truncate max-w-[160px]">{ride.pickup}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-primary dark:text-gray-100 truncate max-w-[160px]">{ride.dropoff}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-base font-extrabold text-primary dark:text-gray-100">₹{ride.fare}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ring-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-100 dark:ring-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {getRideDisplayDate(ride)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setViewRide(ride)}
                          className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 ring-1 ring-transparent hover:ring-border/50 dark:hover:ring-gray-700/50 hover:shadow-sm transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-muted dark:text-gray-400 hover:text-secondary dark:hover:text-teal-300 transition-colors" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(ride)}
                          className="p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 ring-1 ring-transparent hover:ring-border/50 dark:hover:ring-gray-700/50 hover:shadow-sm transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-muted dark:text-gray-400 hover:text-primary dark:hover:text-gray-100 transition-colors" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(ride.id)}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 ring-1 ring-transparent hover:ring-red-100 dark:hover:ring-red-800/50 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewRide} onClose={() => setViewRide(null)} title="Ride Details">
        {viewRide && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-gray-800/60 border border-border/40 dark:border-gray-700/40">
              <PlatformLogo platform={viewRide.platform} size="md" />
              <div>
                <p className="font-bold text-primary dark:text-gray-100">{viewRide.platform}</p>
                <p className="text-xs text-muted dark:text-gray-400 mt-0.5">{getRideDisplayDate(viewRide)}</p>
              </div>
              <span className="ml-auto text-2xl font-extrabold text-primary dark:text-gray-100">₹{viewRide.fare}</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-100/60 dark:border-emerald-800/40">
                <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pickup</p>
                  <p className="text-sm font-semibold text-primary dark:text-gray-100 mt-0.5">{viewRide.pickup}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-px h-4 bg-border/60 dark:bg-gray-700/60" />
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-900/30 border border-blue-100/60 dark:border-blue-800/40">
                <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Dropoff</p>
                  <p className="text-sm font-semibold text-primary dark:text-gray-100 mt-0.5">{viewRide.dropoff}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setViewRide(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editRide} onClose={() => setEditRide(null)} title="Edit Ride">
        {editRide && (
          <div className="space-y-4">
            {editError && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {editError}
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider mb-2">Platform</p>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setEditForm(f => ({ ...f, platform: p }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      editForm.platform === p
                        ? 'border-secondary bg-secondary/5 scale-[1.03]'
                        : 'border-border dark:border-gray-700 hover:border-secondary/40 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <PlatformLogo platform={p} size="sm" />
                    <span className="text-xs font-bold text-primary dark:text-gray-100">{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider mb-1.5">Pickup</label>
              <input
                type="text"
                value={editForm.pickup || ''}
                onChange={e => setEditForm(f => ({ ...f, pickup: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider mb-1.5">Dropoff</label>
              <input
                type="text"
                value={editForm.dropoff || ''}
                onChange={e => setEditForm(f => ({ ...f, dropoff: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted dark:text-gray-400 uppercase tracking-wider mb-1.5">Fare (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.fare || ''}
                onChange={e => setEditForm(f => ({ ...f, fare: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setEditRide(null)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleEditSave} disabled={editLoading}>
                {editLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Ride" maxWidth="max-w-sm">
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800/50">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-800/50 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              This will permanently delete the ride and cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-50 btn-press"
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
