export default function ConfidenceGauge({ value, size = 120, strokeWidth = 10, label = true }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const getColor = (v) => {
    if (v >= 70) return '#22c55e'
    if (v >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const getTrackColor = (v) => {
    if (v >= 70) return '#dcfce7'
    if (v >= 50) return '#fef3c7'
    return '#fee2e2'
  }

  // Adjust font size based on gauge size
  const valueSize = size < 80 ? 'text-lg' : 'text-2xl'

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getTrackColor(value)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${valueSize} font-bold text-gray-900`}>{value}%</span>
      </div>
    </div>
  )
}

export function InlineConfidenceGauge({ value }) {
  const getColor = (v) => {
    if (v >= 70) return 'bg-green-500'
    if (v >= 50) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getTrack = (v) => {
    if (v >= 70) return 'bg-green-100'
    if (v >= 50) return 'bg-amber-100'
    return 'bg-red-100'
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`w-20 h-2 rounded-full ${getTrack(value)}`}>
        <div className={`h-2 rounded-full ${getColor(value)} transition-all duration-500`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700">{value}%</span>
    </div>
  )
}
