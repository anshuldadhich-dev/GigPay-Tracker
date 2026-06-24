import { useState } from "react";
import { X, Gauge, Calendar, ChevronRight } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const PLATFORM_OPTIONS = [
  { id: "uber", label: "Uber", color: "bg-black text-white" },
  { id: "ola", label: "Ola", color: "bg-emerald-600 text-white" },
  { id: "rapido", label: "Rapido", color: "bg-orange-500 text-white" },
  { id: "namma-yatri", label: "Namma Yatri", color: "bg-purple-600 text-white" },
  { id: "other", label: "Other", color: "bg-slate-500 text-white" },
];

export default function StartShiftModal({ isOpen, onClose, onStart }) {
  const [platforms, setPlatforms] = useState([]);
  const [startOdometer, setStartOdometer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const togglePlatform = (id) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onStart({
        platforms: platforms.join(","),
        startOdometer: startOdometer ? parseFloat(startOdometer) : undefined,
        date,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start shift");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-3xl border border-white/10 shadow-2xl p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-navy">Start Your Shift</h2>
              <p className="text-xs text-muted mt-0.5">Log a new driving session</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Platform selector */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-2.5">
                Active Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map(({ id, label, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePlatform(id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 btn-press ${
                      platforms.includes(id)
                        ? `${color} shadow-md`
                        : "bg-slate-100 text-muted hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Odometer */}
            <Input
              id="startOdometer"
              label="Start Odometer (km)"
              type="number"
              placeholder="e.g. 45230"
              icon={Gauge}
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
              min="0"
              step="0.1"
              hint="Optional — enter to track distance"
            />

            {/* Date */}
            <Input
              id="shiftDate"
              label="Date"
              type="date"
              icon={Calendar}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  "Starting..."
                ) : (
                  <>
                    Start Shift <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
