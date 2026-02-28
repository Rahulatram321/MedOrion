import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getForecast, getStress } from '../services/api'

const categoryBadgeStyles = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  Moderate: 'border-amber-200 bg-amber-50 text-amber-700',
  Healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function DepartmentView({ refreshToken, onRefreshStateChange }) {
  const [stress, setStress] = useState([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('')
  const [forecast, setForecast] = useState(null)
  const [loadingStress, setLoadingStress] = useState(true)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [stressError, setStressError] = useState('')
  const [forecastError, setForecastError] = useState('')

  const loadStress = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoadingStress(true)
      }
      setStressError('')
      onRefreshStateChange(true)

      try {
        const response = await getStress()
        const nextStress = Array.isArray(response) ? response : []
        setStress(nextStress)
      } catch (requestError) {
        setStressError(requestError.message || 'Unable to fetch stress data.')
      } finally {
        setLoadingStress(false)
        onRefreshStateChange(false)
      }
    },
    [onRefreshStateChange],
  )

  const loadForecast = useCallback(async (departmentId) => {
    if (!departmentId) {
      setForecast(null)
      return
    }

    setLoadingForecast(true)
    setForecastError('')
    try {
      const response = await getForecast(departmentId)
      setForecast(response || null)
    } catch (requestError) {
      setForecastError(requestError.message || 'Unable to fetch forecast data.')
    } finally {
      setLoadingForecast(false)
    }
  }, [])

  useEffect(() => {
    loadStress()
  }, [loadStress])

  useEffect(() => {
    if (!refreshToken) {
      return
    }
    loadStress(true)
  }, [refreshToken, loadStress])

  useEffect(() => {
    if (!stress.length) {
      setSelectedDepartmentId('')
      return
    }

    const isSelectedAvailable = stress.some(
      (item) => String(item?.departmentId) === String(selectedDepartmentId),
    )

    if (!isSelectedAvailable) {
      setSelectedDepartmentId(String(stress[0]?.departmentId ?? ''))
    }
  }, [stress, selectedDepartmentId])

  useEffect(() => {
    loadForecast(selectedDepartmentId)
  }, [selectedDepartmentId, loadForecast])

  useEffect(
    () => () => {
      onRefreshStateChange(false)
    },
    [onRefreshStateChange],
  )

  const selectedDepartment = useMemo(
    () =>
      stress.find(
        (item) => String(item?.departmentId) === String(selectedDepartmentId),
      ) || null,
    [stress, selectedDepartmentId],
  )

  const chartData = useMemo(() => {
    const values = Array.isArray(forecast?.last7DaysData) ? [...forecast.last7DaysData].reverse() : []
    return values.map((value, index) => ({
      label: `Day ${index + 1}`,
      patients: Number(value) || 0,
    }))
  }, [forecast])

  const stressScore = Number(selectedDepartment?.stressScore) || 0
  const dialPercent = Math.max(0, Math.min(100, (stressScore / 2) * 100))
  const activePatients = Number(selectedDepartment?.activePatients) || 0
  const availableDoctors = Number(selectedDepartment?.availableDoctors) || 0
  const capacityUtilization = availableDoctors > 0 ? (activePatients / availableDoctors) * 100 : 0

  const dialRadius = 54
  const circumference = 2 * Math.PI * dialRadius
  const dashOffset = circumference - (dialPercent / 100) * circumference

  return (
    <section className="space-y-4">
      <div>
        <h1 className="metric-title text-2xl font-bold text-black">Department View</h1>
        <p className="text-sm text-gray-500">
          Deep operational analysis for each department with live forecast visibility.
        </p>
      </div>

      <section className="glass-card rounded-xl p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="department-select">
          Department Selector
        </label>
        <select
          id="department-select"
          value={selectedDepartmentId}
          onChange={(event) => setSelectedDepartmentId(event.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
        >
          {!stress.length ? (
            <option value="">No department data</option>
          ) : (
            stress.map((item) => (
              <option key={item.departmentId} value={item.departmentId}>
                {item.departmentName}
              </option>
            ))
          )}
        </select>
      </section>

      {stressError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {stressError}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="glass-card rounded-xl p-5 xl:col-span-1">
          {loadingStress ? (
            <div className="grid place-items-center py-8">
              <div className="h-36 w-36 animate-pulse rounded-full border border-gray-200 bg-gray-100" />
            </div>
          ) : selectedDepartment ? (
            <motion.div
              key={selectedDepartmentId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="metric-title text-lg font-semibold text-black">
                  {selectedDepartment.departmentName || 'Department'}
                </h2>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    categoryBadgeStyles[selectedDepartment?.category] ||
                    'border-gray-200 bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedDepartment?.category || 'Unknown'}
                </span>
              </div>

              <div className="grid place-items-center">
                <div className="relative h-40 w-40">
                  <svg className="h-40 w-40 -rotate-90" viewBox="0 0 130 130">
                    <circle
                      cx="65"
                      cy="65"
                      r={dialRadius}
                      stroke="#e5e7eb"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="65"
                      cy="65"
                      r={dialRadius}
                      stroke="#111827"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <p className="metric-title text-3xl font-bold text-black">{stressScore.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Stress Index</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Stability Index</p>
                  <p className="metric-title mt-1 text-xl font-semibold text-black">
                    {(Number(forecast?.stabilityIndex) || 0).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-500">Active vs Capacity</p>
                  <p className="metric-title mt-1 text-xl font-semibold text-black">
                    {activePatients}:{availableDoctors}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                Capacity Utilization: {Math.round(capacityUtilization)}%
              </div>
            </motion.div>
          ) : (
            <p className="py-6 text-sm text-gray-500">Select a department to view details.</p>
          )}
        </section>

        <section className="glass-card rounded-xl p-5 xl:col-span-2">
          <h2 className="metric-title text-lg font-semibold text-black">Forecast Trend</h2>
          <p className="text-sm text-gray-500">Last seven day load curve for selected department.</p>

          {forecastError ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {forecastError}
            </div>
          ) : null}

          <div className="mt-4 h-80 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            {loadingForecast ? (
              <div className="h-full animate-pulse rounded-xl bg-gray-100" />
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Forecast data unavailable for this department.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(107, 114, 128, 0.2)" />
                  <XAxis dataKey="label" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: '#e5e7eb',
                      backgroundColor: '#ffffff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="#111827"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

DepartmentView.defaultProps = {
  onRefreshStateChange: () => {},
  refreshToken: 0,
}

export default DepartmentView
