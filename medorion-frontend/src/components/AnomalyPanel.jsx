import { AlertTriangle, ShieldCheck } from 'lucide-react'

function AnomalyPanel({ anomalies, loading }) {
  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <h2 className="metric-title text-lg font-semibold text-gray-900">Anomaly Detection</h2>
      <p className="text-xs text-gray-400">
        Daily patient spikes beyond 125% of weekly baseline.
      </p>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`anomaly-skeleton-${index}`}
              className="h-14 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))
        ) : anomalies.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <p className="text-sm font-semibold">System Stable</p>
            </div>
            <p className="mt-2 text-xs text-emerald-700">
              No anomaly spikes detected across departments.
            </p>
          </div>
        ) : (
          anomalies.map((item) => (
            <div
              key={`${item.departmentId}-${item.date}`}
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{item.departmentName}</p>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <p className="mt-2 text-xs">
                {item.todayTotalPatients} patients vs weekly avg {item.weeklyAverage?.toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default AnomalyPanel
