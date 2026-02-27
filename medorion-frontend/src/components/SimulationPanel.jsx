import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle, Sparkles } from 'lucide-react'
import { simulate } from '../services/api'

function SimulationPanel({ departments, onSimulationComplete }) {
  const [departmentId, setDepartmentId] = useState('')
  const [additionalDoctors, setAdditionalDoctors] = useState(1)
  const [shiftExtensionHours, setShiftExtensionHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!departmentId && departments.length) {
      setDepartmentId(String(departments[0].id))
    }
  }, [departments, departmentId])

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!departmentId) return
    setLoading(true)
    setError('')
    try {
      const response = await simulate({
        departmentId: Number(departmentId),
        additionalDoctors: Number(additionalDoctors),
        shiftExtensionHours: Number(shiftExtensionHours),
      })
      setResult(response)
      if (typeof onSimulationComplete === 'function') {
        onSimulationComplete(response)
      }
    } catch (requestError) {
      setError(requestError.message || 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  const improved = (result?.improvementPercentage ?? 0) > 15

  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <h2 className="metric-title text-lg font-semibold text-gray-900">
        Resource Reallocation Simulator
      </h2>
      <p className="text-xs text-gray-400">
        Model staffing and shift decisions before rollout.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <select
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
        >
          {departments.length === 0 ? (
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
          <input
            type="number"
            min="0"
            step="1"
            value={additionalDoctors}
            onChange={(event) => setAdditionalDoctors(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
            placeholder="Additional doctors"
          />
          <input
            type="number"
            min="0"
            step="0.5"
            value={shiftExtensionHours}
            onChange={(event) => setShiftExtensionHours(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-gray-400 focus:outline-none"
            placeholder="Shift extension (hours)"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !departmentId}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Run Simulation
        </button>
      </form>

      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {result ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 rounded-2xl border p-4 ${
            improved
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <div className="grid gap-2 text-xs text-gray-800 sm:grid-cols-2">
            <p>Old Stress: {(result.oldStress ?? 0).toFixed(2)}</p>
            <p>New Stress: {(result.newStress ?? 0).toFixed(2)}</p>
            <p>Improvement: {(result.improvementPercentage ?? 0).toFixed(2)}%</p>
            <p>Wait Reduction: {(result.estimatedWaitTimeReduction ?? 0).toFixed(2)} mins</p>
          </div>
          <p className="mt-3 text-xs font-medium text-gray-800">
            {result.recommendedAction || 'No recommendation available'}
          </p>
        </motion.div>
      ) : null}
    </section>
  )
}

export default SimulationPanel
