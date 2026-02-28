import { useEffect, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'

const formatClock = (date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)

function TopBar({
  onRefresh,
  refreshing,
  liveMode,
  onLiveModeChange,
  onInjectLoad,
  injectingLoad,
  loadError,
}) {
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

          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-gray-700">Live Mode</p>
              <button
                type="button"
                aria-pressed={liveMode}
                onClick={() => onLiveModeChange(!liveMode)}
                className={`relative h-5 w-9 rounded-full border transition ${
                  liveMode
                    ? 'border-emerald-500/50 bg-emerald-100'
                    : 'border-gray-300 bg-gray-100'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition ${
                    liveMode ? 'left-4' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            {liveMode ? (
              <p className="mt-1 text-[11px] text-gray-500">Live updating every 10s</p>
            ) : (
              <p className="mt-1 text-[11px] text-gray-400">Live mode is off</p>
            )}
          </div>

          <button
            type="button"
            onClick={onInjectLoad}
            disabled={injectingLoad}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {injectingLoad ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
            Inject Load Event
          </button>

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
      {loadError ? <p className="mt-2 text-xs text-red-600">{loadError}</p> : null}
    </header>
  )
}

TopBar.defaultProps = {
  injectingLoad: false,
  liveMode: false,
  loadError: '',
  onInjectLoad: () => {},
  onLiveModeChange: () => {},
  onRefresh: () => {},
  refreshing: false,
}

export default TopBar
