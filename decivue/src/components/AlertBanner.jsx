import { useState } from 'react'

const severityStyles = {
  risk: 'border-red-200 bg-red-50',
  warning: 'border-amber-200 bg-amber-50',
  info: 'border-blue-200 bg-blue-50',
}

const severityDot = {
  risk: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const severityText = {
  risk: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-blue-800',
}

export default function AlertBanner({ alert }) {
  const [showWhy, setShowWhy] = useState(false)
  const style = severityStyles[alert.severity] || severityStyles.info
  const dot = severityDot[alert.severity] || severityDot.info
  const text = severityText[alert.severity] || severityText.info

  return (
    <div className={`rounded-lg border p-3 ${style} transition-all`}>
      <div className="flex items-start gap-3">
        <span className={`w-2 h-2 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${text}`}>{alert.message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{alert.timestamp}</span>
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 underline decoration-dotted"
            >
              {showWhy ? 'Hide explanation' : 'Why this alert?'}
            </button>
          </div>
          {showWhy && (
            <p className="text-xs text-gray-600 mt-2 p-2 bg-white/60 rounded-md">
              {alert.why}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
