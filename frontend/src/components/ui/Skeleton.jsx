export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-3xl p-6 bg-white border border-border/50 shadow-card">
      <div className="flex justify-between">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-full" />
      </div>
      <Skeleton className="w-24 h-4 mt-5" />
      <Skeleton className="w-32 h-8 mt-2" />
      <Skeleton className="w-full h-8 mt-4" />
    </div>
  )
}
