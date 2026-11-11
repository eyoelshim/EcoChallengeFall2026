// Shown instantly while a console page's server data loads, so navigation feels responsive
export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
