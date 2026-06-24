import { useState, useEffect } from "react";
import { X, Gauge, Calendar, ChevronRight, Plus } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";

const BUILTIN_PLATFORMS = [
  { id: "uber", label: "Uber", color: "bg-black text-white" },
  { id: "ola", label: "Ola", color: "bg-emerald-600 text-white" },
  { id: "rapido", label: "Rapido", color: "bg-orange-500 text-white" },
  { id: "indrive", label: "InDrive", color: "bg-gray-900 text-white" },
];

const CUSTOM_COLORS = [
  "bg-purple-600 text-white",
  "bg-cyan-600 text-white",
  "bg-pink-600 text-white",
  "bg-teal-600 text-white",
  "bg-indigo-600 text-white",
  "bg-rose-600 text-white",
  "bg-amber-600 text-white",
  "bg-lime-600 text-white",
];

function hashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CUSTOM_COLORS[Math.abs(hash) % CUSTOM_COLORS.length];
}

function loadCustomPlatforms() {
  try {
    return JSON.parse(localStorage.getItem("gigpay-custom-platforms") || "[]");
  } catch {
    return [];
  }
}

function saveCustomPlatforms(names) {
  localStorage.setItem("gigpay-custom-platforms", JSON.stringify(names));
}

export default function StartShiftModal({ isOpen, onClose, onStart }) {
  const [selected, setSelected] = useState([]);
  const [startOdometer, setStartOdometer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customName, setCustomName] = useState("");
  const [customPlatforms, setCustomPlatforms] = useState(loadCustomPlatforms);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomPlatforms(loadCustomPlatforms());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build final list: builtin + previously saved customs
  const allOptions = [
    ...BUILTIN_PLATFORMS,
    ...customPlatforms.map((name) => ({
      id: `custom:${name}`,
      label: name,
      color: hashColor(name),
      isCustom: true,
    })),
  ];

  const togglePlatform = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addCustomPlatform = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    if (customPlatforms.includes(trimmed)) {
      // Already exists — just select it
      const id = `custom:${trimmed}`;
      if (!selected.includes(id)) setSelected([...selected, id]);
    } else {
      const updated = [...customPlatforms, trimmed];
      setCustomPlatforms(updated);
      saveCustomPlatforms(updated);
      setSelected([...selected, `custom:${trimmed}`]);
    }
    setCustomName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Build platform string: builtin ids + custom label names
    const platformNames = selected.map((id) => {
      if (id.startsWith("custom:")) return id.replace("custom:", "");
      const builtin = BUILTIN_PLATFORMS.find((p) => p.id === id);
      return builtin ? builtin.label : id;
    });

    setLoading(true);
    try {
      await onStart({
        platforms: platformNames.join(","),
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
        className="absolute inset-0 bg-navy-dark/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="glass rounded-3xl border border-white/10 shadow-2xl p-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-navy dark:text-gray-100">Start Your Shift</h2>
              <p className="text-xs text-muted dark:text-gray-400 mt-0.5">Log a new driving session</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted dark:text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-4 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Platform selector */}
            <div>
              <label className="block text-sm font-semibold text-navy dark:text-gray-100 mb-2.5">
                Active Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {allOptions.map(({ id, label, color }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => togglePlatform(id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 btn-press ${
                      selected.includes(id)
                        ? `${color} shadow-md`
                        : "bg-slate-100 dark:bg-gray-800 text-muted dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {label}
                    <span className="ml-1 opacity-60">
                      {selected.includes(id) ? "✓" : "+"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom platform input */}
              <div className="mt-3 flex gap-2">
                <Input
                  id="customPlatform"
                  placeholder="Other platform name…"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomPlatform();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomPlatform}
                  className="shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              <p className="text-[10px] text-muted dark:text-gray-400 mt-1.5">
                Type any platform name and press Add — it saves for next time
              </p>
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
              max="999999"
              step="0.1"
              hint="Optional — enter to track distance (max 6 digits)"
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
