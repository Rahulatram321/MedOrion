import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import DepartmentView from './pages/DepartmentView'
import FinancialInsights from './pages/FinancialInsights'
import Overview from './pages/Overview'
import SimulationCenter from './pages/SimulationCenter'
import SystemDiagnostics from './pages/SystemDiagnostics'

function ConsoleLayout() {
  const location = useLocation()
  const [refreshToken, setRefreshToken] = useState(0)
  const [pageRefreshing, setPageRefreshing] = useState(false)

  useEffect(() => {
    setPageRefreshing(false)
  }, [location.pathname])

  return (
    <div className="app-grid-bg min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            onRefresh={() => setRefreshToken((previous) => previous + 1)}
            refreshing={pageRefreshing}
            autoRefreshEnabled={location.pathname === '/'}
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
