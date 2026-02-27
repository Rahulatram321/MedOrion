import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Building2, IndianRupee } from 'lucide-react'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)

const badgeByCategory = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  Moderate: 'border-amber-200 bg-amber-50 text-amber-700',
  Healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

function AnimatedMetric({ value, decimals = 0, formatter }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const target = Number(value) || 0
    let frameId
    const duration = 900
    const startTime = performance.now()
    const startValue = displayValue

    const step = (time) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValue + (target - startValue) * eased)
      if (progress < 1) {
        frameId = requestAnimationFrame(step)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [value])

  if (formatter) {
    return formatter(displayValue)
  }
  return displayValue.toFixed(decimals)
}

function SummaryCard({ card, index }) {
  const Icon = card.icon
  const [flash, setFlash] = useState('')
  const previousValue = useRef(Number(card.value) || 0)

  useEffect(() => {
    const nextValue = Number(card.value) || 0
    if (nextValue === previousValue.current) {
      return
    }

    setFlash(nextValue > previousValue.current ? 'up' : 'down')
    const timer = setTimeout(() => setFlash(''), 420)
    previousValue.current = nextValue
    return () => clearTimeout(timer)
  }, [card.value])

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`glass-card rounded-2xl p-4 transition-colors duration-300 ${
        flash === 'up'
          ? 'border-red-300 shadow-sm'
          : ''
      } ${flash === 'down' ? 'border-emerald-300 shadow-sm' : ''}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-400">{card.label}</p>
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="mt-3">
        <p className={card.valueClass}>{card.render(card.value)}</p>
        {card.text ? <p className="mt-1 text-xs text-gray-400">{card.text}</p> : null}
        {card.inlineMeta ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span
              className={`rounded-full border px-2 py-0.5 ${
                badgeByCategory[card.inlineMeta.category] || 'border-gray-200 bg-gray-100 text-gray-700'
              }`}
            >
              {card.inlineMeta.category || 'N/A'}
            </span>
            <span>Active {card.inlineMeta.activePatients ?? 0}</span>
            <span>Available {card.inlineMeta.availableDoctors ?? 0}</span>
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}

function SummaryCards({ summary, loading, highestStressDetails }) {
  const cards = useMemo(
    () => [
      {
        key: 'activePatients',
        label: 'Total Active Patients',
        icon: Activity,
        value: summary?.totalActivePatients ?? 0,
        valueClass: 'metric-title text-3xl font-bold text-gray-900',
        render: (value) => <AnimatedMetric value={value} decimals={0} />,
      },
      {
        key: 'criticalDepartments',
        label: 'Departments Critical',
        icon: AlertTriangle,
        value: summary?.departmentsCritical ?? 0,
        valueClass: 'metric-title text-3xl font-bold text-gray-900',
        render: (value) => <AnimatedMetric value={value} decimals={0} />,
      },
      {
        key: 'highestStress',
        label: 'Highest Stress Dept',
        icon: Building2,
        value: summary?.highestStressScore ?? 0,
        text: summary?.highestStressDepartment || 'N/A',
        inlineMeta: {
          category: highestStressDetails?.category || 'N/A',
          activePatients: highestStressDetails?.activePatients ?? 0,
          availableDoctors: highestStressDetails?.availableDoctors ?? 0,
        },
        valueClass: 'metric-title text-3xl font-bold text-gray-900',
        render: (value) => <AnimatedMetric value={value} decimals={2} />,
      },
      {
        key: 'delayCost',
        label: 'Total Delay Cost',
        icon: IndianRupee,
        value: summary?.totalDelayCost ?? 0,
        valueClass: 'metric-title text-2xl font-semibold text-gray-900',
        render: (value) => (
          <AnimatedMetric value={value} formatter={(next) => formatCurrency(next)} />
        ),
      },
    ],
    [summary, highestStressDetails],
  )

  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`summary-skeleton-${index}`}
            className="glass-card rounded-2xl p-4"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-10 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <SummaryCard key={card.key} card={card} index={index} />
      ))}
    </section>
  )
}

export default SummaryCards
