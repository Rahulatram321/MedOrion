import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ActivityFeed from '../components/ActivityFeed'
import AnomalyPanel from '../components/AnomalyPanel'
import FooterInsight from '../components/FooterInsight'
import RiskDistributionBar from '../components/RiskDistributionBar'
import StressGrid from '../components/StressGrid'
import SummaryCards from '../components/SummaryCards'
import { getAnomalies, getStress, getSummary } from '../services/api'

const emptySummary = {
  totalActivePatients: 0,
  departmentsCritical: 0,
  highestStressDepartment: 'N/A',
  highestStressScore: 0,
  totalDelayCost: 0,
}

function Overview({
  refreshToken,
  onRefreshStateChange,
  liveMode,
  activityEvents,
  onActivity,
}) {
  const [summary, setSummary] = useState(emptySummary)
  const [stress, setStress] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const seenAnomaliesRef = useRef(new Set())

  const fetchOverview = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError('')
      onRefreshStateChange(true)

      try {
        const [summaryData, stressData, anomalyData] = await Promise.all([
          getSummary(),
          getStress(),
          getAnomalies(),
        ])

        setSummary({ ...emptySummary, ...(summaryData || {}) })
        setStress(Array.isArray(stressData) ? stressData : [])
        setAnomalies(Array.isArray(anomalyData) ? anomalyData : [])
      } catch (requestError) {
        setError(requestError.message || 'Unable to fetch overview analytics.')
      } finally {
        setLoading(false)
        setRefreshing(false)
        onRefreshStateChange(false)
      }
    },
    [onRefreshStateChange],
  )

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  useEffect(() => {
    if (!liveMode) {
      return undefined
    }

    const timer = setInterval(() => fetchOverview(true), 10000)
    return () => clearInterval(timer)
  }, [fetchOverview, liveMode])

  useEffect(() => {
    if (!refreshToken) {
      return
    }
    fetchOverview(true)
  }, [refreshToken, fetchOverview])

  useEffect(
    () => () => {
      onRefreshStateChange(false)
    },
    [onRefreshStateChange],
  )

  useEffect(() => {
    if (typeof onActivity !== 'function') {
      return
    }

    anomalies.forEach((item) => {
      const key = `${item?.departmentId ?? 'unknown'}-${item?.date ?? 'unknown'}`
      if (seenAnomaliesRef.current.has(key)) {
        return
      }
      seenAnomaliesRef.current.add(key)
      onActivity('alert', `Anomaly detected in ${item?.departmentName || 'Unknown department'}`)
    })
  }, [anomalies, onActivity])

  const highestStressDetails = useMemo(() => {
    if (!stress.length) {
      return null
    }
    return [...stress].sort((left, right) => (right?.stressScore ?? 0) - (left?.stressScore ?? 0))[0]
  }, [stress])

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="metric-title text-2xl font-bold text-black">Overview</h1>
          <p className="text-sm text-gray-500">
            Real-time command center with live stress, risk, and anomaly visibility.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <span
            className={`h-2 w-2 rounded-full ${
              refreshing || liveMode ? 'animate-pulse bg-emerald-500' : 'bg-gray-400'
            }`}
          />
          {refreshing
            ? 'Refreshing telemetry...'
            : liveMode
              ? 'Live telemetry active'
              : 'Manual telemetry mode'}
        </div>
      </div>

      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      ) : null}

      <SummaryCards
        summary={summary}
        loading={loading}
        highestStressDetails={highestStressDetails}
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <RiskDistributionBar stress={stress} loading={loading} />
          <StressGrid stress={stress} loading={loading} />
        </div>
        <div>
          <AnomalyPanel anomalies={anomalies} loading={loading} />
        </div>
      </div>

      <FooterInsight summary={summary} stress={stress} />
      <ActivityFeed events={activityEvents} />
    </section>
  )
}

Overview.defaultProps = {
  activityEvents: [],
  liveMode: false,
  onActivity: () => {},
  onRefreshStateChange: () => {},
  refreshToken: 0,
}

export default Overview
