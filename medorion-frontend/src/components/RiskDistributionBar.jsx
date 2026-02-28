function RiskDistributionBar({ stress, loading }) {
  const total = stress.length
  const healthyCount = stress.filter((item) => item.category === 'Healthy').length
  const moderateCount = stress.filter((item) => item.category === 'Moderate').length
  const criticalCount = stress.filter((item) => item.category === 'Critical').length

  const healthyPct = total > 0 ? (healthyCount / total) * 100 : 0
  const moderatePct = total > 0 ? (moderateCount / total) * 100 : 0
  const criticalPct = total > 0 ? (criticalCount / total) * 100 : 0

  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="metric-title text-lg font-semibold text-gray-900">
          Risk Distribution
        </h2>
        <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Department Load Mix</p>
      </div>

      {loading ? (
        <div className="h-10 animate-pulse rounded-2xl bg-gray-200" />
      ) : (
        <>
          <div className="h-10 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex h-full">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${healthyPct}%` }}
                title={`Healthy ${healthyPct.toFixed(1)}%`}
              />
              <div
                className="h-full bg-amber-400"
                style={{ width: `${moderatePct}%` }}
                title={`Moderate ${moderatePct.toFixed(1)}%`}
              />
              <div
                className="h-full bg-red-500"
                style={{ width: `${criticalPct}%` }}
                title={`Critical ${criticalPct.toFixed(1)}%`}
              />
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-gray-500 sm:grid-cols-3">
            <p>Healthy: {healthyPct.toFixed(1)}%</p>
            <p>Moderate: {moderatePct.toFixed(1)}%</p>
            <p>Critical: {criticalPct.toFixed(1)}%</p>
          </div>
        </>
      )}
    </section>
  )
}

export default RiskDistributionBar
