import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, IndianRupee, Clock, TrendingUp,
  CalendarCheck, Trash2, AlertCircle, ArrowLeft,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ShiftSummaryCards from "../components/shifts/ShiftSummaryCards";
import api from "../services/api";

const PLATFORM_COLORS = {
  uber: "bg-black text-white",
  ola: "bg-emerald-600 text-white",
  rapido: "bg-orange-500 text-white",
  "indrive": "bg-gray-900 text-white",
  other: "bg-slate-500 text-white",
};

function getPlatformBadge(p) {
  return PLATFORM_COLORS[p.trim().toLowerCase()] || "bg-slate-400 text-white";
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-16 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-16 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-12 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-12 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-12 rounded-lg" /></td>
      <td className="py-3"><div className="skeleton h-4 w-16 rounded-lg" /></td>
      <td className="py-3 w-8" />
    </tr>
  );
}

export default function ShiftLogbookPage() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const fetchData = useCallback(async () => {
    try {
      const [histRes, summaryRes] = await Promise.all([
        api.get(`/shift/history?limit=${limit}&page=${page}`),
        api.get("/shift/summary"),
      ]);
      setShifts(histRes.data.data || []);
      setTotalPages(histRes.data.totalPages || 1);
      setTotalEntries(histRes.data.totalEntries || 0);
      setSummary(summaryRes.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/shift/${id}`);
      await fetchData();
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  };

  // Client-side platform filter
  const filteredShifts = filterPlatform
    ? shifts.filter((s) =>
        s.platforms?.toLowerCase().includes(filterPlatform.toLowerCase())
      )
    : shifts;

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-6 text-white relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-bronze/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => navigate("/shifts")}
            className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center animate-float">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold">Shift Logbook</h2>
            <p className="text-slate-300 text-sm mt-0.5">
              Complete history of all your shifts
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && summary && <ShiftSummaryCards summary={summary} />}

      {/* Table */}
      <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
        <Card>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-secondary" />
              All Shifts
              <span className="text-xs font-medium text-muted bg-slate-100 px-2 py-0.5 rounded-full">
                {totalEntries}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-3.5 h-3.5" />
                {showFilters ? "Hide Filter" : "Filter"}
              </Button>
            </div>
          </div>

          {/* Platform filter chips */}
          {showFilters && (
            <div className="mb-4 flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 animate-scale-in">
              {["", "uber", "ola", "rapido", "indrive"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterPlatform === p
                      ? p
                        ? `${getPlatformBadge(p)} shadow-sm`
                        : "bg-navy text-white shadow-sm"
                      : "bg-white text-muted border border-border hover:bg-slate-100"
                  }`}
                >
                  {p || "All"}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-border">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Start</th>
                    <th className="pb-3 pr-4">End</th>
                    <th className="pb-3 pr-4">Hours</th>
                    <th className="pb-3 pr-4">Dist.</th>
                    <th className="pb-3 pr-4">Earnings</th>
                    <th className="pb-3">Profit</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-muted">
                {filterPlatform
                  ? `No shifts found for "${filterPlatform}"`
                  : "No shift history yet"}
              </p>
              <p className="text-xs text-muted">
                {filterPlatform
                  ? "Try a different filter"
                  : "Start your first shift to build your logbook"}
              </p>
              {!filterPlatform && (
                <Button variant="primary" size="sm" onClick={() => navigate("/shifts")}>
                  Go to Shift Tracker
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-border">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Start</th>
                      <th className="pb-3 pr-4">End</th>
                      <th className="pb-3 pr-4">Hours</th>
                      <th className="pb-3 pr-4">Dist.</th>
                      <th className="pb-3 pr-4">Earnings</th>
                      <th className="pb-3">Profit</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredShifts.map((shift, i) => {
                      const start = new Date(shift.startTime);
                      const end = shift.endTime ? new Date(shift.endTime) : null;
                      const timeFmt = (d) =>
                        d.toLocaleTimeString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                      return (
                        <tr
                          key={shift.id}
                          className="hover:bg-slate-50 transition-colors animate-fade-up group"
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          <td className="py-3 pr-4">
                            <p className="font-medium text-primary">
                              {start.toLocaleDateString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                dateStyle: "medium",
                              })}
                            </p>
                            {shift.platforms && (
                              <div className="flex gap-1 mt-1">
                                {shift.platforms.split(",").slice(0, 2).map((p) => (
                                  <span
                                    key={p}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${getPlatformBadge(p)}`}
                                  >
                                    {p.trim()}
                                  </span>
                                ))}
                                {shift.platforms.split(",").length > 2 && (
                                  <span className="text-[9px] text-muted">
                                    +{shift.platforms.split(",").length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            {shift.autoEnded && (
                              <span className="text-[9px] text-amber-500 font-medium">
                                auto-ended
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-muted text-xs">
                            {timeFmt(start)}
                          </td>
                          <td className="py-3 pr-4 text-muted text-xs">
                            {end ? timeFmt(end) : "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted font-medium tabular-nums">
                            {shift.totalHours != null
                              ? `${shift.totalHours.toFixed(1)}h`
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 text-muted tabular-nums">
                            {shift.totalDistance != null
                              ? `${shift.totalDistance.toFixed(0)} km`
                              : "—"}
                          </td>
                          <td className="py-3 pr-4 font-semibold text-emerald-700 tabular-nums">
                            ₹{shift.totalEarnings?.toLocaleString("en-IN") || 0}
                          </td>
                          <td className="py-3 font-semibold tabular-nums">
                            <span
                              className={
                                (shift.profit || 0) >= 0
                                  ? "text-navy"
                                  : "text-red-500"
                              }
                            >
                              ₹{shift.profit?.toLocaleString("en-IN") || 0}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDelete(shift.id)}
                              disabled={deletingId === shift.id}
                              className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 opacity-0 group-hover:opacity-100"
                              title="Delete shift"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
                  <p className="text-xs text-muted">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
