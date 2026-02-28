import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const formatClock = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)

function TopBar({ onRefresh, refreshing, autoRefreshEnabled }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="border-b border-gray-200 bg-white px-4 py-4 md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="metric-title text-xl font-bold text-black md:text-2xl">
            MedOrion Operational Console
          </h2>
          <p className="text-sm text-gray-500">Hospital Operational Intelligence System</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">Live Clock</p>
            <p className="metric-title text-sm font-semibold text-black md:text-base">
              {formatClock(now)}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${autoRefreshEnabled ? 'bg-emerald-500' : 'bg-gray-400'} ${
                autoRefreshEnabled ? 'animate-pulse' : ''
              }`}
            />
            {autoRefreshEnabled ? 'Auto-refresh every 10s' : 'Auto-refresh on overview'}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-black shadow-sm transition hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Global Refresh
          </button>
        </div>
      </div>
    </header>
  )
}

TopBar.defaultProps = {
  autoRefreshEnabled: false,
  onRefresh: () => {},
  refreshing: false,
}

export default TopBar
