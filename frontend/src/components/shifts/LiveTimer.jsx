import { useState, useEffect, useRef } from "react";
import { Clock, Pause } from "lucide-react";

export default function LiveTimer({ startTime, isPaused = false, pausedMs = 0, className = "" }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(new Date(startTime).getTime());
  const resumeRef = useRef(null);

  useEffect(() => {
    startRef.current = new Date(startTime).getTime();
  }, [startTime]);

  useEffect(() => {
    if (isPaused) {
      resumeRef.current = null;
      return;
    }

    const tick = () => {
      const base = startRef.current;
      const now = Date.now();
      const raw = Math.floor((now - base) / 1000) - Math.floor((pausedMs * 60) / 1000);
      setElapsed(Math.max(0, raw));
    };

    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [startTime, isPaused, pausedMs]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center">
        {isPaused ? (
          <Pause className="w-5 h-5 text-amber-500" />
        ) : (
          <Clock className="w-5 h-5 text-navy" />
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
          {isPaused ? "Paused" : "Elapsed Time"}
        </p>
        <p
          className={`text-2xl font-extrabold tabular-nums tracking-tight ${
            isPaused ? "text-amber-500" : "text-navy"
          }`}
        >
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </p>
      </div>
      {/* Pulser dot when running */}
      {!isPaused && (
        <div className="ml-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-glow" />
      )}
    </div>
  );
}
