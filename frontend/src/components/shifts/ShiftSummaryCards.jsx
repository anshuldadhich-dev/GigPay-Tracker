import { Clock, IndianRupee, TrendingUp, CalendarCheck } from "lucide-react";
import Card from "../ui/Card";

export default function ShiftSummaryCards({ summary }) {
  if (!summary) return null;

  const { weekly, lifetime } = summary;

  const cards = [
    {
      label: "This Week",
      value: `${weekly.totalHours.toFixed(1)}h`,
      sub: `${weekly.totalShifts} shift${weekly.totalShifts !== 1 ? "s" : ""}`,
      icon: Clock,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Weekly Earnings",
      value: `₹${weekly.totalEarnings.toLocaleString("en-IN")}`,
      sub: weekly.avgEarningsPerHour > 0 ? `₹${weekly.avgEarningsPerHour}/hr` : "",
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Best Day",
      value: weekly.bestEarningDay ? `₹${weekly.bestEarningDay.amount.toLocaleString("en-IN")}` : "—",
      sub: weekly.bestEarningDay?.day || "",
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "All-Time",
      value: `${lifetime.totalShifts} shifts`,
      sub: `₹${lifetime.totalEarnings.toLocaleString("en-IN")} earned`,
      icon: CalendarCheck,
      color: "text-navy",
      bg: "bg-navy/8",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, sub, icon: Icon, color, bg }, i) => (
        <div
          key={label}
          className="animate-fade-up"
          style={{ animationDelay: `${80 + i * 80}ms` }}
        >
          <Card className="text-center py-5 px-3 card-premium h-full">
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-3 animate-scale-in`}
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-lg font-extrabold text-primary dark:text-gray-100">{value}</p>
            <p className="text-[11px] text-muted dark:text-gray-400 mt-0.5">{label}</p>
            {sub && (
              <p className="text-[10px] text-muted/70 dark:text-gray-400/70 mt-0.5 font-medium">{sub}</p>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}
