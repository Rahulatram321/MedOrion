import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DepartmentView from './pages/DepartmentView'
import FinancialInsights from './pages/FinancialInsights'
import Overview from './pages/Overview'
import SimulationCenter from './pages/SimulationCenter'
import SystemDiagnostics from './pages/SystemDiagnostics'
import {
  generateLoad,
  getAnomalies,
  getCostImpact,
  getStress,
  getSummary,
} from './services/api'

const formatEventTime = (dateValue) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(dateValue)

function ConsoleLayout() {
  const location = useLocation()
  const [refreshToken, setRefreshToken] = useState(0)
  const [pageRefreshing, setPageRefreshing] = useState(false)
  const [liveMode, setLiveMode] = useState(false)
  const [injectingLoad, setInjectingLoad] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [activityEvents, setActivityEvents] = useState(() => [
    {
      id: 'activity-init',
      time: formatEventTime(new Date()),
      type: 'alert',
      message: 'Operational activity monitor initialized.',
    },
  ])

  const triggerRefresh = useCallback(() => {
    setRefreshToken((previous) => previous + 1)
  }, [])

  const pushActivity = useCallback((type, message, timestamp = new Date()) => {
    setActivityEvents((previous) => [
      {
        id: `${timestamp.getTime()}-${Math.random().toString(16).slice(2)}`,
        time: formatEventTime(timestamp),
        type,
        message,
      },
      ...previous,
    ].slice(0, 120))
  }, [])

  useEffect(() => {
    setPageRefreshing(false)
  }, [location.pathname])

  useEffect(() => {
    if (!liveMode) {
      return undefined
    }

    const timer = setInterval(() => triggerRefresh(), 10000)
    return () => clearInterval(timer)
  }, [liveMode, triggerRefresh])

  const onInjectLoad = useCallback(async () => {
    setInjectingLoad(true)
    setLoadError('')

    try {
      const response = await generateLoad()
      const department = response?.department || 'Unknown department'
      const addedPatients = Number(response?.addedPatients) || 0
      pushActivity('load', `Load event injected in ${department} (+${addedPatients} patients)`)

      await Promise.all([getStress(), getSummary(), getAnomalies(), getCostImpact()])
      triggerRefresh()
    } catch (requestError) {
      const message = requestError.message || 'Unable to inject load event.'
      setLoadError(message)
      pushActivity('alert', `Load event injection failed: ${message}`)
    } finally {
      setInjectingLoad(false)
    }
  }, [pushActivity, triggerRefresh])

  const onGlobalRefresh = useCallback(() => {
    setLoadError('')
    triggerRefresh()
  }, [triggerRefresh])

  return (
    <div className="app-grid-bg min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            onRefresh={onGlobalRefresh}
            refreshing={pageRefreshing || injectingLoad}
            liveMode={liveMode}
            onLiveModeChange={setLiveMode}
            onInjectLoad={onInjectLoad}
            injectingLoad={injectingLoad}
            loadError={loadError}
          />
          <main className="flex-1 p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Routes location={location}>
                  <Route
                    path="/"
                    element={
                      <Overview
                        refreshToken={refreshToken}
                        onRefreshStateChange={setPageRefreshing}
                        liveMode={liveMode}
                        activityEvents={activityEvents}
                        onActivity={pushActivity}
                      />
                    }
                  />
                  <Route
                    path="/departments"
                    element={
                      <DepartmentView
                        refreshToken={refreshToken}
                        onRefreshStateChange={setPageRefreshing}
                      />
                    }
                  />
                  <Route
                    path="/simulation"
                    element={
                      <SimulationCenter
                        refreshToken={refreshToken}
                        onRefreshStateChange={setPageRefreshing}
                        activityEvents={activityEvents}
                        onActivity={pushActivity}
                      />
                    }
                  />
                  <Route
                    path="/financial"
                    element={
                      <FinancialInsights
                        refreshToken={refreshToken}
                        onRefreshStateChange={setPageRefreshing}
                      />
                    }
                  />
                  <Route
                    path="/diagnostics"
                    element={
                      <SystemDiagnostics
                        refreshToken={refreshToken}
                        onRefreshStateChange={setPageRefreshing}
                      />
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ConsoleLayout />
    </BrowserRouter>
  )
}

export default App
