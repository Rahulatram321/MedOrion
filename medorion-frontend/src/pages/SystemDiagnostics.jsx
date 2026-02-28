import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getStress, getSummary } from '../services/api'

const formatDateTime = (value) => {
  if (!value) {
    return 'N/A'
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(value)
}

function SystemDiagnostics({ refreshToken, onRefreshStateChange }) {
  const [stress, setStress] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastRefreshAt, setLastRefreshAt] = useState(null)
  const [apiHealthy, setApiHealthy] = useState(false)
  const [jsonOpen, setJsonOpen] = useState(false)

  const loadDiagnostics = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true)
      }
      setError('')
      onRefreshStateChange(true)

      try {
        const [stressData, summaryData] = await Promise.all([getStress(), getSummary()])
        setStress(Array.isArray(stressData) ? stressData : [])
        setSummary(summaryData || {})
        setLastRefreshAt(new Date())
        setApiHealthy(true)
      } catch (requestError) {
        setError(requestError.message || 'Unable to fetch diagnostics data.')
        setApiHealthy(false)
      } finally {
        setLoading(false)
        onRefreshStateChange(false)
      }
    },
    [onRefreshStateChange],
  )

  useEffect(() => {
    loadDiagnostics()
  }, [loadDiagnostics])

  useEffect(() => {
    if (!refreshToken) {
      return
    }
    loadDiagnostics(true)
  }, [refreshToken, loadDiagnostics])

  useEffect(
    () => () => {
      onRefreshStateChange(false)
    },
    [onRefreshStateChange],
  )

  const totalDepartments = stress.length

  const totalActivePatients = useMemo(() => {
    const fromSummary = Number(summary?.totalActivePatients)
    if (Number.isFinite(fromSummary)) {
      return fromSummary
    }
    return stress.reduce((running, item) => running + (Number(item?.activePatients) || 0), 0)
  }, [summary, stress])

  const criticalDepartments = useMemo(() => {
    const fromSummary = Number(summary?.departmentsCritical)
    if (Number.isFinite(fromSummary)) {
      return fromSummary
    }
    return stress.filter((item) => item?.category === 'Critical').length
  }, [summary, stress])

  return (
    <section className="space-y-4">
      <div>
        <h1 className="metric-title text-2xl font-bold text-black">System Diagnostics</h1>
        <p className="text-sm text-gray-500">
          Infrastructure-level telemetry and raw API payload visibility.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass-card rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Departments</p>
          {loading ? (
            <div className="mt-2 h-8 w-14 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="metric-title mt-1 text-3xl font-bold text-black">{totalDepartments}</p>
          )}
        </article>

        <article className="glass-card rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Active Patients</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="metric-title mt-1 text-3xl font-bold text-black">{totalActivePatients}</p>
          )}
        </article>

        <article className="glass-card rounded-xl p-4">
          <p className="text-sm text-gray-500">Critical Departments</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="metric-title mt-1 text-3xl font-bold text-black">{criticalDepartments}</p>
          )}
        </article>

        <article className="glass-card rounded-xl p-4">
          <p className="text-sm text-gray-500">Last Refresh Time</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{formatDateTime(lastRefreshAt)}</p>
        </article>
      </div>

      <section className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="metric-title text-lg font-semibold text-black">API Health Status</h2>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
              apiHealthy
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiHealthy ? 'animate-pulse bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {apiHealthy ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
      </section>

      <section className="glass-card rounded-xl p-5">
        <button
          type="button"
          onClick={() => setJsonOpen((previous) => !previous)}
          className="flex w-full items-center justify-between text-left"
        >
          <span>
            <h2 className="metric-title text-lg font-semibold text-black">Raw Stress JSON</h2>
            <p className="text-sm text-gray-500">Collapsible API payload preview.</p>
          </span>
          {jsonOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {jsonOpen ? (
          <pre className="thin-scrollbar mt-4 max-h-80 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            {JSON.stringify(stress, null, 2)}
          </pre>
        ) : null}
      </section>
    </section>
  )
}

SystemDiagnostics.defaultProps = {
  onRefreshStateChange: () => {},
  refreshToken: 0,
}

export default SystemDiagnostics
