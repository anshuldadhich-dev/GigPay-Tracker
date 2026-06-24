import { useState, useEffect } from "react";
import { Clock, IndianRupee, MapPin, Play, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import api from "../../services/api";

export default function ActiveShiftWidget() {
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await api.get("/shift/active");
        setActive(res.data.data?.active || null);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
    const interval = setInterval(fetchActive, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  if (!active) {
    return (
      <Link to="/shifts" className="block group">
        <Card className="card-premium border-dashed border-2 border-royal/20 hover:border-royal/40 transition-all duration-300 hover:shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-royal/10 flex items-center justify-center group-hover:bg-royal/15 transition-colors">
                <Play className="w-6 h-6 text-royal" />
              </div>
              <div>
                <p className="text-sm font-bold text-navy group-hover:text-royal transition-colors">
                  Ready to start your shift?
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Tap here to begin tracking your session
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted group-hover:text-royal group-hover:translate-x-0.5 transition-all" />
          </div>
        </Card>
      </Link>
    );
  }

  // Active shift — compact live card
  const elapsedH = Math.floor((active.elapsedSeconds || 0) / 3600);
  const elapsedM = Math.floor(((active.elapsedSeconds || 0) % 3600) / 60);

  return (
    <Link to="/shifts" className="block group">
      <Card className="card-premium border-emerald-200 bg-gradient-to-r from-emerald-50/40 to-white hover:shadow-soft transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Timer + status */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-glow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-navy">
                  Shift Active
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                  ● LIVE
                </span>
              </div>
              <p className="text-lg font-extrabold text-navy tabular-nums tracking-tight">
                {String(elapsedH).padStart(2, "0")}h {String(elapsedM).padStart(2, "0")}m
              </p>
            </div>
          </div>

          {/* Right: Mini stats */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="flex items-center gap-1 text-emerald-700">
                <IndianRupee className="w-3.5 h-3.5" />
                <span className="text-sm font-extrabold tabular-nums">
                  {active.liveEarnings?.toLocaleString("en-IN") || 0}
                </span>
              </div>
              <p className="text-[10px] text-muted font-medium">earnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-royal">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm font-extrabold tabular-nums">
                  {active.ridesCompleted || 0}
                </span>
              </div>
              <p className="text-[10px] text-muted font-medium">rides</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
