export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-2.5 w-32 rounded" />
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="skeleton h-4 w-40 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-2.5 w-1/2 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="skeleton h-4 w-48 rounded" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="skeleton h-4 w-32 rounded" />
      <div className="skeleton h-[500px] w-full rounded-xl" />
    </div>
  );
}
