import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Cpu } from 'lucide-react'

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date(value))
    : 'N/A'

function SystemDiagnosticsDrawer({
  totalActiveAppointments,
  lastSurgeTime,
  lastSimulationImprovement,
}) {
  const [open, setOpen] = useState(false)

  const improvementLabel = useMemo(() => {
    if (typeof lastSimulationImprovement !== 'number' || Number.isNaN(lastSimulationImprovement)) {
      return 'N/A'
    }
    return `${lastSimulationImprovement.toFixed(2)}%`
  }, [lastSimulationImprovement])

  return (
    <aside className="fixed bottom-6 left-6 z-40 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2">
          <Cpu className="h-4 w-4 text-gray-500" />
          <span className="metric-title text-sm font-semibold tracking-wide text-gray-900">
            System Diagnostics
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {open ? (
        <div className="space-y-3 border-t border-gray-200 px-4 py-3 text-sm text-gray-800">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Active Appointments</p>
            <p className="metric-title mt-1 text-xl font-semibold text-gray-900">
              {totalActiveAppointments}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Last Surge Time</p>
            <p className="mt-1 text-sm text-gray-800">{formatTime(lastSurgeTime)}</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
              Last Simulation Improvement
            </p>
            <p className="mt-1 text-sm text-gray-800">{improvementLabel}</p>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

export default SystemDiagnosticsDrawer
