import { motion } from 'framer-motion'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

function SystemBanner({ summary }) {
  const criticalCount = summary?.departmentsCritical ?? 0
  const highLoad = criticalCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border px-4 py-4 md:px-6 ${
        highLoad
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      <div className="flex items-center gap-3">
        {highLoad ? (
          <ShieldAlert className="h-5 w-5 shrink-0" />
        ) : (
          <ShieldCheck className="h-5 w-5 shrink-0" />
        )}
        <p className="metric-title text-sm font-semibold tracking-wide md:text-base">
          {highLoad
            ? 'System Under High Load - Immediate Action Recommended'
            : 'System Operating Within Safe Limits'}
        </p>
      </div>
    </motion.div>
  )
}

export default SystemBanner
