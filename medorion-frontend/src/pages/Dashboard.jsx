import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import SummaryCards from '../components/SummaryCards'
import RiskDistributionBar from '../components/RiskDistributionBar'
import StressGrid from '../components/StressGrid'
import ForecastChart from '../components/ForecastChart'
import SimulationPanel from '../components/SimulationPanel'
import CostImpactTable from '../components/CostImpactTable'
import AnomalyPanel from '../components/AnomalyPanel'
import FooterInsight from '../components/FooterInsight'
import ActivityFeed from '../components/ActivityFeed'
import SystemDiagnosticsDrawer from '../components/SystemDiagnosticsDrawer'
import {
  generateLoad,
  getAnomalies,
  getCostImpact,
  getStress,
  getSummary,
} from '../services/api'

const emptySummary = {
  totalActivePatients: 0,
  departmentsCritical: 0,
  highestStressDepartment: 'N/A',
  highestStressScore: 0,
  totalDelayCost: 0,
}

function Dashboard() {
  const [summary, setSummary] = useState(emptySummary)
  const [stress, setStress] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [costImpact, setCostImpact] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [surgeLoading, setSurgeLoading] = useState(false)
  const [activityEvents, setActivityEvents] = useState([])
  const [lastSurgeTime, setLastSurgeTime] = useState('')
  const [lastSimulationImprovement, setLastSimulationImprovement] = useState(null)
  const [error, setError] = useState('')

  const previousStressRef = useRef(new Map())
  const seenAnomaliesRef = useRef(new Set())

  const pushActivity = useCallback((message, timestamp = new Date()) => {
    const nextEvent = {
      id: `${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
      time: timestamp.toISOString(),
      message,
    }
    setActivityEvents((previous) => [...previous, nextEvent].slice(-160))
  }, [])

  const detectActivityChanges = useCallback(
    (nextStress, nextAnomalies) => {
      const previousStress = previousStressRef.current
      const updatedStress = new Map()

      nextStress.forEach((item) => {
        updatedStress.set(item.departmentId, item.category)
        const previousCategory = previousStress.get(item.departmentId)
        if (!previousCategory || previousCategory === item.category) {
          return
        }

        if (item.category === 'Critical') {
          pushActivity(`${item.departmentName} escalated to Critical`)
          return
        }

        pushActivity(`${item.departmentName} shifted to ${item.category}`)
      })
      previousStressRef.current = updatedStress

      nextAnomalies.forEach((item) => {
        const key = `${item.departmentId}-${item.date}`
        if (seenAnomaliesRef.current.has(key)) {
          return
        }
        seenAnomaliesRef.current.add(key)
        pushActivity(`Anomaly detected in ${item.departmentName}`)
      })
    },
    [pushActivity],
  )

  const fetchAllData = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')

    try {
      const [summaryData, stressData, anomalyData, costData] = await Promise.all([
        getSummary(),
        getStress(),
        getAnomalies(),
        getCostImpact(),
      ])
      setSummary({ ...emptySummary, ...summaryData })
      setStress(stressData)
      setAnomalies(anomalyData)
      setCostImpact(costData)
      detectActivityChanges(stressData, anomalyData)
    } catch (requestError) {
      setError(requestError.message || 'Unable to fetch dashboard data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [detectActivityChanges])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  useEffect(() => {
    const timer = setInterval(() => fetchAllData(true), 10000)
    return () => clearInterval(timer)
  }, [fetchAllData])

  const onSimulateSurge = useCallback(async () => {
    setSurgeLoading(true)
    setError('')
    pushActivity('Surge triggered by command center')

    try {
      const response = await generateLoad()
      const eventTime = new Date()
      setLastSurgeTime(eventTime.toISOString())
      pushActivity(`Patient surge detected in ${response.department || 'Unknown department'}`)
      pushActivity(`Simulation executed: +${response.addedPatients ?? 0} active patients`)
      await fetchAllData(true)
    } catch (requestError) {
      setError(requestError.message || 'Unable to simulate patient surge.')
    } finally {
      setSurgeLoading(false)
    }
  }, [fetchAllData, pushActivity])

  const onSimulationComplete = useCallback(
    (result) => {
      const improvement = Number(result?.improvementPercentage)
      setLastSimulationImprovement(Number.isNaN(improvement) ? null : improvement)

      if (result?.departmentName) {
        pushActivity(`Simulation executed for ${result.departmentName}`)
      }
      if (!Number.isNaN(improvement) && result?.departmentName) {
        pushActivity(
          improvement >= 0
            ? `${result.departmentName} projected improvement ${improvement.toFixed(2)}%`
            : `${result.departmentName} projected decline ${Math.abs(improvement).toFixed(2)}%`,
        )
      }
    },
    [pushActivity],
  )

  const departments = useMemo(
    () =>
      stress.map((item) => ({
        id: item.departmentId,
        name: item.departmentName,
      })),
    [stress],
  )

  const totalActiveAppointments = useMemo(
    () =>
      stress.reduce(
        (running, item) => running + (Number(item?.activePatients) || 0),
        0,
      ),
    [stress],
  )

  const operationalLoadIndex = useMemo(() => {
    const criticalCount = stress.filter((item) => item.category === 'Critical').length
    const moderateCount = stress.filter((item) => item.category === 'Moderate').length
    const riskScore = criticalCount * 25 + moderateCount * 10
    return Math.min(100, riskScore)
  }, [stress])

  const highestStressDetails = useMemo(() => {
    if (stress.length === 0) {
      return null
    }
    return [...stress].sort((a, b) => (b.stressScore ?? 0) - (a.stressScore ?? 0))[0]
  }, [stress])

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="dashboard-background mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-6">
        <Header
          onRefresh={() => fetchAllData(true)}
          refreshing={refreshing}
          onSimulateSurge={onSimulateSurge}
          surgeLoading={surgeLoading}
          operationalLoadIndex={operationalLoadIndex}
        />
        {error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-red-100"
              onClick={() => fetchAllData()}
            >
              Retry
            </button>
          </motion.div>
        ) : null}

        <SummaryCards
          summary={summary}
          loading={loading}
          highestStressDetails={highestStressDetails}
        />

        <div className="grid gap-6 border-t border-black/5 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <RiskDistributionBar stress={stress} loading={loading} />
            <StressGrid stress={stress} loading={loading} />
          </div>
          <div className="space-y-6">
            <ForecastChart departments={departments} />
            <SimulationPanel
              departments={departments}
              onSimulationComplete={onSimulationComplete}
            />
          </div>
        </div>

        <div className="grid gap-6 border-t border-black/5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <CostImpactTable costs={costImpact} loading={loading} />
          </div>
          <div>
            <AnomalyPanel anomalies={anomalies} loading={loading} />
          </div>
        </div>

        <div className="border-t border-black/5">
          <FooterInsight summary={summary} stress={stress} />
        </div>
      </div>
      <SystemDiagnosticsDrawer
        totalActiveAppointments={totalActiveAppointments}
        lastSurgeTime={lastSurgeTime}
        lastSimulationImprovement={lastSimulationImprovement}
      />
      <ActivityFeed events={activityEvents} />
    </main>
  )
}

export default Dashboard
