import { AnimatePresence, motion } from 'framer-motion'
import { BellRing } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

const formatTime = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value)

const typeLabelByKey = {
  alert: 'Alert',
  load: 'Load',
  simulation: 'Simulation',
}

const typeStyleByKey = {
  alert: 'border-red-200 bg-red-50 text-red-700',
  load: 'border-slate-200 bg-slate-100 text-slate-700',
  simulation: 'border-blue-200 bg-blue-50 text-blue-700',
}

const normalizeTime = (rawTime) => {
  if (!rawTime) {
    return formatTime(new Date())
  }
  if (typeof rawTime === 'string' && rawTime.includes(':') && rawTime.length <= 5) {
    return rawTime
  }
  const parsedDate = new Date(rawTime)
  if (Number.isNaN(parsedDate.getTime())) {
    return formatTime(new Date())
  }
  return formatTime(parsedDate)
}

function ActivityFeed({ events }) {
  const viewportRef = useRef(null)
  const previousTopEntryRef = useRef('')

  const entries = useMemo(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return [
        {
          id: 'activity-init',
          type: 'alert',
          time: formatTime(new Date()),
          message: 'Hospital activity monitor initialized.',
        },
      ]
    }

    return events
      .filter((event) => Boolean(event?.id))
      .map((event) => ({
        id: event.id,
        type: event?.type || 'load',
        time: normalizeTime(event?.time),
        message: event?.message || 'No activity message available.',
      }))
      .slice(0, 80)
  }, [events])

  useEffect(() => {
    const nextTopEntryId = entries[0]?.id || ''
    if (!nextTopEntryId || nextTopEntryId === previousTopEntryRef.current) {
      return
    }

    previousTopEntryRef.current = nextTopEntryId
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [entries])

  return (
    <aside className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5">
        <BellRing className="h-3.5 w-3.5 text-gray-500" />
        <h3 className="metric-title text-xs font-semibold uppercase tracking-wide text-gray-900">
          Activity Feed
        </h3>
      </div>

      <div ref={viewportRef} className="thin-scrollbar max-h-[300px] space-y-1.5 overflow-y-auto p-2.5">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.22 }}
              className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] tracking-wide text-gray-400">{entry.time}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    typeStyleByKey[entry.type] || typeStyleByKey.load
                  }`}
                >
                  {typeLabelByKey[entry.type] || 'Event'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-700">{entry.message}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  )
}

ActivityFeed.defaultProps = {
  events: [],
}

export default ActivityFeed
