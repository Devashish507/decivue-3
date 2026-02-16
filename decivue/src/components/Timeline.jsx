import { formatDate } from '../utils/helpers'

const typeStyles = {
  CREATED: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '✨'
  },
  REVIEWED: {
    dot: 'bg-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✓'
  },
  REAFFIRMED: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: '✓'
  },
  NOTE: {
    dot: 'bg-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '📝'
  },
  UPDATE: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '🔄'
  },
}

// Helper to format timestamp with time
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Unknown date'

  // Parse the timestamp - handle both ISO strings and Date objects
  const date = new Date(timestamp)

  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid timestamp:', timestamp)
    return 'Invalid date'
  }

  // Manual formatting to ensure stability
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  const currentYear = new Date().getFullYear()

  // Format time manually
  let hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12

  const timeStr = `${hours}:${minutes} ${ampm}`

  // Build date string
  const dateStr = year !== currentYear ? `${month} ${day}, ${year}` : `${month} ${day}`

  // Always show full date and time
  return `${dateStr}, ${timeStr}`
}

// Extract tag from note description
const extractTag = (description) => {
  const tagMatch = description?.match(/^\[([^\]]+)\]/)
  if (tagMatch) {
    return {
      tag: tagMatch[1],
      text: description.replace(/^\[[^\]]+\]\s*/, '')
    }
  }
  return { tag: null, text: description }
}

// Tag color mapping
const tagColors = {
  'Reaffirmed': 'bg-green-100 text-green-800 border-green-300',
  'Revised': 'bg-blue-100 text-blue-800 border-blue-300',
  'Escalated': 'bg-amber-100 text-amber-800 border-amber-300',
  'Deferred': 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function Timeline({ events }) {
  if (!events || !events.length) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No timeline events yet
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      {events.map((event, i) => {
        const style = typeStyles[event.type] || typeStyles.UPDATE
        const { tag, text } = extractTag(event.description)
        const isLast = i === events.length - 1

        // Format timestamp once when component mounts, not on every render
        const formattedTimestamp = formatDateTime(event.timestamp)

        return (
          <div key={i} className="flex gap-4 group">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={`w-2.5 h-2.5 rounded-full ${style.dot} ring-4 ring-white shadow-sm flex-shrink-0 transition-transform group-hover:scale-125`}
                title={event.type}
              />
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gradient-to-b from-gray-200 to-transparent mt-2 min-h-[24px]" />
              )}
            </div>

            {/* Event content */}
            <div className={`flex-1 rounded-lg border ${style.border} ${style.bg} p-3 transition-all group-hover:shadow-sm`}>
              {/* Header with timestamp */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {event.type}
                  </span>
                  {tag && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tagColors[tag] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {tag}
                    </span>
                  )}
                </div>
                <time className="text-xs text-gray-500 whitespace-nowrap font-medium">
                  {formattedTimestamp}
                </time>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-900 leading-relaxed">
                {text || event.description}
              </p>

              {/* Previous/New values if present */}
              {(event.previousValue || event.newValue) && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600 space-y-1">
                  {event.previousValue && (
                    <div>
                      <span className="font-medium">Previous:</span> {event.previousValue}
                    </div>
                  )}
                  {event.newValue && (
                    <div>
                      <span className="font-medium">New:</span> {event.newValue}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
