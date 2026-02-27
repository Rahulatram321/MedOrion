import { useEffect, useRef, useState } from 'react'
import { BellRing } from 'lucide-react'

const formatTime = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(value)

function ActivityFeed({ events }) {
  const [entries, setEntries] = useState([
    {
      id: 'activity-init',
      time: formatTime(new Date()),
      message: 'Hospital activity monitor initialized',
    },
  ])
  const processedIds = useRef(new Set(['activity-init']))

  useEffect(() => {
    if (!Array.isArray(events) || events.length === 0) {
      return
    }

    const unseen = events.filter((event) => event?.id && !processedIds.current.has(event.id))
    if (unseen.length === 0) {
      return
    }

    unseen.forEach((event) => processedIds.current.add(event.id))
    const formatted = unseen
      .map((event) => ({
        id: event.id,
        time: event.time ? formatTime(new Date(event.time)) : formatTime(new Date()),
        message: event.message,
      }))
      .reverse()

    setEntries((previous) => [...formatted, ...previous].slice(0, 80))
  }, [events])

  return (
    <aside className="fixed bottom-6 right-6 z-40 w-[min(305px,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5">
        <BellRing className="h-3.5 w-3.5 text-gray-500" />
        <h3 className="metric-title text-xs font-semibold uppercase tracking-wide text-gray-900">
          Activity Feed
        </h3>
      </div>

      <div className="thin-scrollbar max-h-[300px] space-y-1.5 overflow-y-auto p-2.5">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
            <p className="text-[11px] tracking-wide text-gray-400">{entry.time}</p>
            <p className="mt-1 text-xs text-gray-700">{entry.message}</p>
          </article>
        ))}
      </div>
    </aside>
  )
}

export default ActivityFeed
