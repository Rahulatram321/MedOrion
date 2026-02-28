import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, LoaderCircle, Minus, Sparkles } from 'lucide-react'
import ActivityFeed from '../components/ActivityFeed'
import { getStress, simulate } from '../services/api'

const toNumber = (value, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function SimulationCenter({ refreshToken, onRefreshStateChange }) {
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [additionalDoctors, setAdditionalDoctors] = useState(1)
  const [shiftExtensionHours, setShiftExtensionHours] = useState(1)
  const [result, setResult] = useState(null)
  const [events, setEvents] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [error, setError] = useState('')

  const pushEvent = useCallback((message) => {
    const eventTime = new Date()
    setEvents((previous) => [
      {
        id: `${eventTime.getTime()}-${Math.random().toString(16).slice(2)}`,
        time: eventTime.toISOString(),
        message,
      },
      ...previous,
    ])
  }, [])

  const loadDepartments = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoadingDepartments(true)
      }
      setError('')
      onRefreshStateChange(true)

      try {
        const response = await getStress()
        const nextDepartments = Array.isArray(response)
          ? response.map((item) => ({
              id: item.departmentId,
              name: item.departmentName,
            }))
          : []
        setDepartments(nextDepartments)
        if (nextDepartments.length > 0) {
          setDepartmentId((current) => current || String(nextDepartments[0]?.id || ''))
        }
      } catch (requestError) {
        setError(requestError.message || 'Unable to load departments for simulation.')
      } finally {
        setLoadingDepartments(false)
        onRefreshStateChange(false)
      }
    },
    [onRefreshStateChange],
  )

  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  useEffect(() => {
    if (!refreshToken) {
      return
    }
    loadDepartments(true)
  }, [refreshToken, loadDepartments])

  useEffect(
    () => () => {
      onRefreshStateChange(false)
    },
    [onRefreshStateChange],
  )

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!departmentId) {
      return
    }

    setError('')
    setSimulating(true)
    pushEvent('Simulation request queued.')

    try {
      const response = await simulate({
        departmentId: toNumber(departmentId),
        additionalDoctors: toNumber(additionalDoctors, 0),
        shiftExtensionHours: toNumber(shiftExtensionHours, 0),
      })
      setResult(response || null)
      pushEvent(
        `Simulation complete for ${response?.departmentName || 'selected department'} with ${
          toNumber(response?.improvementPercentage).toFixed(2)
        }% improvement.`,
      )
    } catch (requestError) {
      const message = requestError.message || 'Simulation request failed.'
      setError(message)
      pushEvent(`Simulation failed: ${message}`)
    } finally {
      setSimulating(false)
    }
  }

  const improvement = toNumber(result?.improvementPercentage)
  const isStrongImprovement = improvement > 20
  const delayChange = toNumber(result?.estimatedWaitTimeReduction)

  return (
    <section className="space-y-4">
      <div>
        <h1 className="metric-title text-2xl font-bold text-black">Simulation Center</h1>
        <p className="text-sm text-gray-500">
          Test reallocation strategies before production deployment.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="glass-card rounded-xl p-5">
          <h2 className="metric-title text-lg font-semibold text-black">Input Controls</h2>
          <p className="text-sm text-gray-500">Configure staffing and shift changes.</p>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
            >
              {loadingDepartments ? (
                <option value="">Loading departments...</option>
              ) : departments.length === 0 ? (
                <option value="">No department data</option>
              ) : (
                departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))
              )}
            </select>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-sm text-gray-500">Additional Doctors</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={additionalDoctors}
                  onChange={(event) => setAdditionalDoctors(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="text-sm text-gray-500">Shift Extension (hrs)</span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={shiftExtensionHours}
                  onChange={(event) => setShiftExtensionHours(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={simulating || !departmentId}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {simulating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Run Simulation
            </button>
          </form>
        </section>

        <section className="glass-card rounded-xl p-5">
          <h2 className="metric-title text-lg font-semibold text-black">Before vs After</h2>
          <p className="text-sm text-gray-500">Projected outcomes from latest simulation response.</p>

          {!result ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
              Run a simulation to see comparative metrics.
            </div>
          ) : (
            <motion.div
              key={`${result?.departmentId}-${result?.newStress}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Old Stress</p>
                  <p className="metric-title mt-1 text-2xl font-semibold text-black">
                    {toNumber(result?.oldStress).toFixed(2)}
                  </p>
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">New Stress</p>
                  <p className="metric-title mt-1 text-2xl font-semibold text-black">
                    {toNumber(result?.newStress).toFixed(2)}
                  </p>
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Improvement %</p>
                  <p className="metric-title mt-1 text-2xl font-semibold text-black">
                    {improvement.toFixed(2)}%
                  </p>
                </article>
                <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Estimated Delay Impact Change</p>
                  <p className="metric-title mt-1 text-2xl font-semibold text-black">
                    -{Math.max(0, delayChange).toFixed(2)} mins
                  </p>
                </article>
              </div>

              <div
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  isStrongImprovement
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {isStrongImprovement ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  {isStrongImprovement
                    ? 'Strong improvement detected (>20%).'
                    : 'Improvement below 20%; neutral signal.'}
                </span>
              </div>
            </motion.div>
          )}
        </section>
      </div>

      <ActivityFeed events={events} />
    </section>
  )
}

SimulationCenter.defaultProps = {
  onRefreshStateChange: () => {},
  refreshToken: 0,
}

export default SimulationCenter
