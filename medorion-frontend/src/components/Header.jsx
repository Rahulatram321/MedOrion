import { useEffect, useState } from 'react'
import { Activity, RefreshCw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const formatClock = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)

function Header({
  onRefresh,
  refreshing,
  onSimulateSurge,
  surgeLoading,
  operationalLoadIndex,
}) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-card rounded-2xl p-5 md:p-7"
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Activity className="h-3.5 w-3.5" />
            Command Center Live
          </div>
          <h1 className="metric-title text-3xl font-bold tracking-tight text-gray-900">
            MedOrion - Hospital Operational Intelligence
          </h1>
          <p className="mt-2 text-xs text-gray-400 md:text-sm">
            Real-time Capacity & Risk Monitoring System
          </p>
          <p className="mt-1 text-xs tracking-wide text-gray-400">
            Live updating every 10 seconds
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Live Clock</p>
            <p className="metric-title text-sm font-semibold text-gray-900 md:text-base">
              {formatClock(now)}
            </p>
          </div>
          <div className="w-44 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.12em] text-gray-400">
              Operational Load Index
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-700 transition-all duration-500"
                style={{ width: `${operationalLoadIndex}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs font-medium text-gray-700">
              {operationalLoadIndex} / 100
            </p>
          </div>
          <button
            onClick={onSimulateSurge}
            disabled={surgeLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
          >
            <Sparkles className={`h-4 w-4 ${surgeLoading ? 'animate-spin' : ''}`} />
            Simulate Patient Surge
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
