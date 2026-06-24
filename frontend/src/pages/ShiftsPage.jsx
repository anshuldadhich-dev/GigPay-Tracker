import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play, Square, Pause, Play as ResumeIcon, Gauge, IndianRupee,
  Timer, Target, List, AlertCircle, CheckCircle2, Clock,
  MapPin, TrendingUp, ChevronRight, Info,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StartShiftModal from "../components/shifts/StartShiftModal";
import LiveTimer from "../components/shifts/LiveTimer";
import ShiftSummaryCards from "../components/shifts/ShiftSummaryCards";
import api from "../services/api";

const PLATFORM_COLORS = {
  uber: "bg-black text-white",
  ola: "bg-emerald-600 text-white",
  rapido: "bg-orange-500 text-white",
  indrive: "bg-gray-900 text-white",
};

function getPlatformBadge(p) {
  return PLATFORM_COLORS[p.trim().toLowerCase()] || "bg-slate-400 text-white";
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-20 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-16 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-12 rounded-lg" /></td>
      <td className="py-3 pr-4"><div className="skeleton h-4 w-16 rounded-lg" /></td>
      <td className="py-3"><div className="skeleton h-4 w-24 rounded-lg" /></td>
    </tr>
  );
}

export default function ShiftsPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState(null);
  const [autoEnded, setAutoEnded] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recentShifts, setRecentShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [endOdometer, setEndOdometer] = useState("");
  const [ending, setEnding] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [user, setUser] = useState(null);
  const pollRef = useRef(null);

  const fetchActive = useCallback(async () => {
    try {
      const res = await api.get("/shift/active");
      const d = res.data.data;
      if (d.autoEnded) {
        setAutoEnded(d.autoEnded);
        setActive(null);
      } else {
        setActive(d.active);
        setAutoEnded(null);
      }
      return d;
    } catch {
      return null;
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/shift/summary");
      setSummary(res.data.data);
    } catch {
      // silent
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    try {
      const res = await api.get("/shift/history?limit=5&page=1");
      setRecentShifts(res.data.data || []);
    } catch {
      // silent
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchActive(), fetchSummary(), fetchRecent(), fetchUser()]);
      setLoading(false);
    };
    init();
  }, [fetchActive, fetchSummary, fetchRecent, fetchUser]);

  // Poll active shift every 30s
  useEffect(() => {
    if (!active) return;
    pollRef.current = setInterval(() => {
      fetchActive();
    }, 30000);
    return () => clearInterval(pollRef.current);
  }, [active, fetchActive]);

  const handleStart = async (payload) => {
    setError(null);
    try {
      const res = await api.post("/shift/start", payload);
      setActive(res.data.data);
      setShowStartModal(false);
      setSuccess("Shift started! Drive safe 🚗");
      setTimeout(() => setSuccess(null), 3000);
      await fetchSummary();
      await fetchRecent();
    } catch (err) {
      throw err; // Let modal handle it
    }
  };

  const handleEnd = async () => {
    setEnding(true);
    setError(null);
    try {
      await api.post("/shift/end", {
        endOdometer: endOdometer ? parseFloat(endOdometer) : undefined,
      });
      setActive(null);
      setShowEndConfirm(false);
      setEndOdometer("");
      setSuccess("Shift ended! Here's your summary 📊");
      setTimeout(() => setSuccess(null), 3000);
      await fetchSummary();
      await fetchRecent();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to end shift");
    } finally {
      setEnding(false);
    }
  };

  const handlePauseToggle = async () => {
    setPausing(true);
    setError(null);
    try {
      const res = await api.post("/shift/pause");
      setActive(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to toggle pause");
    } finally {
      setPausing(false);
    }
  };

  const dailyGoal = user?.goalDaily || 1500;
  const liveEarnings = active?.liveEarnings || 0;
  const goalPct = Math.min(100, Math.round((liveEarnings / dailyGoal) * 100));

  // ── Render ──
  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Hero */}
      <div className="hero-gradient rounded-3xl p-6 text-white relative overflow-hidden animate-fade-up">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-bronze/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04] dot-grid" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center animate-float">
            <Clock className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold">Shift Tracker</h2>
            <p className="text-slate-300 text-sm mt-0.5">
              {active
                ? "Your shift is live — keep earning!"
                : "Start your shift and track every minute on the road"}
            </p>
          </div>
          {!active && (
            <Button
              variant="accent"
              size="md"
              className="shrink-0"
              onClick={() => setShowStartModal(true)}
            >
              <Play className="w-4 h-4" /> Start Shift
            </Button>
          )}
        </div>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium animate-scale-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-scale-in">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          <button className="ml-auto text-xs underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Auto-ended notification */}
      {autoEnded && (
        <Card className="border-amber-200 bg-amber-50 animate-scale-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-800 text-sm">
                Previous Shift Auto-Ended
              </p>
              <p className="text-amber-600 text-xs mt-0.5">
                {autoEnded.reason}. Hours: {autoEnded.shift.totalHours?.toFixed(1)}h
                {" · "}Earnings: ₹{autoEnded.shift.totalEarnings?.toLocaleString("en-IN") || 0}
              </p>
            </div>
            <button
              className="text-xs text-amber-500 underline shrink-0"
              onClick={() => setAutoEnded(null)}
            >
              Dismiss
            </button>
          </div>
        </Card>
      )}

      {/* ── Active Shift View ── */}
      {loading ? (
        <Card>
          <div className="space-y-4">
            <div className="skeleton h-12 w-48 rounded-xl" />
            <div className="grid grid-cols-3 gap-4">
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-24 rounded-2xl" />
            </div>
          </div>
        </Card>
      ) : active ? (
        <>
          {/* Main active card */}
          <Card className="relative overflow-hidden animate-fade-up border-royal/20 shadow-royal/10">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-royal/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Top row: Timer + Status */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <LiveTimer
                  startTime={active.startTime}
                  isPaused={active.isPaused}
                  pausedMs={active.isPaused ? 0 : 0}
                />
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      active.isPaused
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {active.isPaused ? "⏸ PAUSED" : "● LIVE"}
                  </span>
                  {active.platforms && (
                    <div className="flex gap-1">
                      {active.platforms.split(",").map((p) => (
                        <span
                          key={p}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${getPlatformBadge(p)}`}
                        >
                          {p.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Earnings */}
                <div className="glass-warm rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Live Earnings
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-navy tabular-nums">
                    ₹{liveEarnings.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    from {active.ridesCompleted || 0} ride{active.ridesCompleted !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Rides Completed */}
                <div className="glass-warm rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-royal/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-royal" />
                    </div>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Rides Done
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-navy tabular-nums">
                    {active.ridesCompleted || 0}
                  </p>
                  <p className="text-xs text-muted mt-0.5">this shift</p>
                </div>

                {/* Daily Target Progress */}
                <div className="glass-warm rounded-2xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
                      Daily Goal
                    </p>
                  </div>
                  <p className="text-2xl font-extrabold text-navy tabular-nums">
                    {goalPct}%
                  </p>
                  <div className="mt-2 w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${goalPct}%`,
                        background:
                          goalPct >= 100
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : goalPct >= 50
                              ? "linear-gradient(90deg, #2455B5, #3368CC)"
                              : "linear-gradient(90deg, #C98D73, #D7A66A)",
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-muted mt-1">
                    ₹{liveEarnings.toLocaleString("en-IN")} / ₹{dailyGoal.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 flex-wrap">
                <Button
                  variant={active.isPaused ? "cta" : "outline"}
                  onClick={handlePauseToggle}
                  disabled={pausing}
                  className="flex-1 sm:flex-none"
                >
                  {active.isPaused ? (
                    <><ResumeIcon className="w-4 h-4" /> Resume Shift</>
                  ) : (
                    <><Pause className="w-4 h-4" /> Pause Shift</>
                  )}
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 sm:flex-none"
                  onClick={() => setShowEndConfirm(true)}
                >
                  <Square className="w-4 h-4" /> End Shift
                </Button>
              </div>
            </div>
          </Card>

          {/* End Shift Confirmation */}
          {showEndConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm"
                onClick={() => setShowEndConfirm(false)}
              />
              <div className="relative w-full max-w-sm glass rounded-3xl border border-white/10 shadow-2xl p-6 animate-scale-in">
                <h3 className="text-lg font-extrabold text-navy mb-4">End Your Shift</h3>
                <div className="space-y-4">
                  <Input
                    id="endOdometer"
                    label="End Odometer (km)"
                    type="number"
                    placeholder="e.g. 45350"
                    icon={Gauge}
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    min="0"
                    max="999999"
                    step="0.1"
                    hint="Optional — enter to calculate distance (max 6 digits)"
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setShowEndConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleEnd}
                      disabled={ending}
                    >
                      {ending ? "Ending..." : "End Shift"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* ── Stats Summary ── */}
      {!loading && summary && <ShiftSummaryCards summary={summary} />}

      {/* ── Recent Shifts ── */}
      <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <List className="w-4 h-4 text-secondary" /> Recent Shifts
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/shifts/logbook")}
            >
              View Logbook <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {recentShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Timer className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-muted">No shifts yet</p>
              <p className="text-xs text-muted">Start your first shift above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-muted uppercase tracking-wider border-b border-border">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Hours</th>
                    <th className="pb-3 pr-4">Dist.</th>
                    <th className="pb-3 pr-4">Earnings</th>
                    <th className="pb-3">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentShifts.map((shift, i) => (
                    <tr
                      key={shift.id}
                      className="hover:bg-slate-50 transition-colors animate-fade-up cursor-pointer"
                      style={{ animationDelay: `${i * 45}ms` }}
                      onClick={() => navigate("/shifts/logbook")}
                    >
                      <td className="py-3 pr-4 font-medium text-primary">
                        {new Date(shift.startTime).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                        })}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {shift.totalHours != null ? `${shift.totalHours.toFixed(1)}h` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {shift.totalDistance != null
                          ? `${shift.totalDistance.toFixed(0)} km`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-emerald-700">
                        ₹{shift.totalEarnings?.toLocaleString("en-IN") || 0}
                      </td>
                      <td className="py-3 font-semibold text-navy">
                        ₹{shift.profit?.toLocaleString("en-IN") || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Start Shift Modal */}
      <StartShiftModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={handleStart}
      />
    </div>
  );
}
