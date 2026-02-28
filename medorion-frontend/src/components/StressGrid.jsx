import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const categoryOrder = {
  Critical: 0,
  Moderate: 1,
  Healthy: 2,
}

const categoryStyles = {
  Healthy: {
    card: 'border-gray-200 border-l-4 border-l-green-400 shadow-sm',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  Moderate: {
    card: 'border-gray-200 border-l-4 border-l-yellow-400 shadow-sm',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  Critical: {
    card: 'border-red-500/40 border-l-4 border-l-red-500 shadow-sm',
    badge: 'bg-red-50 text-red-700 border border-red-200',
  },
}

function StressGrid({ stress, loading }) {
  const [stressTrendMap, setStressTrendMap] = useState({})
  const previousStressScoresRef = useRef(new Map())

  useEffect(() => {
    if (!Array.isArray(stress) || stress.length === 0) {
      return
    }

    const detectedTrends = {}
    stress.forEach((item) => {
      const departmentId = item?.departmentId
      const currentScore = Number(item?.stressScore) || 0
      const previousScore = previousStressScoresRef.current.get(departmentId)

      if (Number.isFinite(previousScore) && currentScore !== previousScore) {
        detectedTrends[departmentId] = currentScore > previousScore ? 'up' : 'down'
      }
      previousStressScoresRef.current.set(departmentId, currentScore)
    })

    const changedIds = Object.keys(detectedTrends)
    if (changedIds.length === 0) {
      return
    }

    setStressTrendMap((previous) => ({ ...previous, ...detectedTrends }))
    const timer = setTimeout(() => {
      setStressTrendMap((previous) => {
        const nextState = { ...previous }
        changedIds.forEach((departmentId) => {
          delete nextState[departmentId]
        })
        return nextState
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [stress])

  const sortedStress = [...stress].sort((a, b) => {
    const primary = (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99)
    if (primary !== 0) return primary
    return (b.stressScore ?? 0) - (a.stressScore ?? 0)
  })

  return (
    <section className="glass-card rounded-2xl p-4 md:p-5">
      <h2 className="metric-title text-lg font-semibold text-gray-900">Department Stress Index</h2>
      <p className="mt-1 text-xs text-gray-400">
        Critical departments are sorted first for intervention priority.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={`stress-skeleton-${index}`} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-10 w-20 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))
          : sortedStress.map((item, index) => {
              const style = categoryStyles[item.category] || categoryStyles.Moderate
              const trendState = stressTrendMap[item.departmentId]
              return (
                <motion.article
                  key={`${item.departmentId}-${item.departmentName}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.05 }}
                  className={`rounded-2xl border bg-white p-4 transition duration-200 hover:scale-[1.01] ${style.card} ${
                    trendState === 'up'
                      ? 'stress-flash-up'
                      : ''
                  } ${trendState === 'down' ? 'stress-flash-down' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-gray-900">
                      {item.departmentName}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="metric-title mt-3 text-3xl font-bold text-gray-900">
                    {(item.stressScore ?? 0).toFixed(2)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <p>Active: {item.activePatients ?? 0}</p>
                    <p>Available: {item.availableDoctors ?? 0}</p>
                  </div>
                </motion.article>
              )
            })}
      </div>
    </section>
  )
}

export default StressGrid
