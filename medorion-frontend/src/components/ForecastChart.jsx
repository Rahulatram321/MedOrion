import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { LoaderCircle, TrendingUp, Waves } from 'lucide-react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getForecast } from '../services/api'

function ForecastChart({ departments }) {
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [mode, setMode] = useState('trend')
  const [playbackMode, setPlaybackMode] = useState('live')
  const [replayIndex, setReplayIndex] = useState(0)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!departments.length) {
      setSelectedDepartment('')
      return
    }
    if (!selectedDepartment) {
      setSelectedDepartment(String(departments[0].id))
    }
  }, [departments, selectedDepartment])

  useEffect(() => {
    const loadForecast = async () => {
      if (!selectedDepartment) return
      setLoading(true)
      setError('')
      try {
        const data = await getForecast(selectedDepartment)
        setForecast(data)
      } catch (requestError) {
        setError(requestError.message || 'Failed to load forecast')
      } finally {
        setLoading(false)
      }
    }
    loadForecast()
  }, [selectedDepartment])

  const chartData = useMemo(() => {
    const values = Array.isArray(forecast?.last7DaysData)
      ? [...forecast.last7DaysData].reverse()
      : []
    const mean =
      values.length > 0
        ? values.reduce((acc, current) => acc + current, 0) / values.length
        : 0
    return values.map((value, index) => ({
      label: `Day ${index + 1}`,
      load: value,
      baseline: mean,
      deviation: Math.abs(value - mean),
    }))
  }, [forecast])

  useEffect(() => {
    if (playbackMode !== 'replay') {
      setReplayIndex(chartData.length)
      return
    }

    if (chartData.length === 0) {
      setReplayIndex(0)
      return
    }

    setReplayIndex(1)
    const timer = setInterval(() => {
      setReplayIndex((previous) => (previous >= chartData.length ? 1 : previous + 1))
    }, 900)

    return () => clearInterval(timer)
  }, [playbackMode, chartData])

  const visibleChartData =
    playbackMode === 'replay' ? chartData.slice(0, Math.max(replayIndex, 1)) : chartData

  return (
    <section className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="metric-title text-lg font-semibold text-gray-900">7-Day Forecast Engine</h2>
          <p className="text-xs text-gray-400">
            Predictive load behavior and volatility index by department.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPlaybackMode('live')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                playbackMode === 'live'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              Live Mode
            </button>
            <button
              type="button"
              onClick={() => setPlaybackMode('replay')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                playbackMode === 'replay'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              Historical Replay
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('trend')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mode === 'trend'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Trend View
            </button>
            <button
              type="button"
              onClick={() => setMode('stability')}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                mode === 'stability'
                  ? 'border border-gray-300 bg-gray-100 text-gray-900'
                  : 'border border-gray-200 bg-white text-gray-700'
              }`}
            >
              <Waves className="h-3.5 w-3.5" />
              Stability View
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <select
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
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

        <div className="h-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-red-600">
              {error}
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Forecast data unavailable
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visibleChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#e5e7eb',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                  }}
                />
                <Legend />
                {mode === 'trend' ? (
                  <Line
                    type="monotone"
                    dataKey="load"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    name="Predicted Load"
                  />
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="load"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      name="Load"
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      stroke="#34d399"
                      strokeDasharray="6 4"
                      strokeWidth={2}
                      dot={false}
                      name="Mean Load"
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {playbackMode === 'replay' && chartData.length > 0 ? (
        <p className="mt-3 text-xs tracking-wide text-gray-300">
          Replaying {Math.max(replayIndex, 1)} / {chartData.length} historical points
        </p>
      ) : null}

      <motion.p
        key={forecast?.stabilityIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 text-xs text-gray-400"
      >
        Stability Index: <span className="font-semibold text-gray-900">{(forecast?.stabilityIndex ?? 0).toFixed(2)}</span>
      </motion.p>
    </section>
  )
}

export default ForecastChart
