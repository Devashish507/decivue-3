import { motion } from 'framer-motion'

export default function ConfidenceGauge({ value, size = 120, strokeWidth = 10, label = true }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const getColor = (v) => {
    if (v >= 70) return '#10b981' // emerald-500
    if (v >= 50) return '#f59e0b' // amber-500
    return '#f43f5e' // rose-500
  }

  const getTrackColor = (v) => {
    if (v >= 70) return '#ecfdf5' // emerald-50
    if (v >= 50) return '#fffbeb' // amber-50
    return '#fff1f2' // rose-50
  }

  const valueSize = size < 60 ? 'text-[10px]' : size < 80 ? 'text-xs' : 'text-2xl'

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getTrackColor(value)}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          className="drop-shadow-[0_0_4px_rgba(0,0,0,0.1)]"
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${valueSize} font-black text-slate-900 tracking-tighter`}>{Math.round(value)}%</span>
        </div>
      )}
    </div>
  )
}

export function InlineConfidenceGauge({ value }) {
  const getColor = (v) => {
    if (v >= 70) return 'from-emerald-400 to-emerald-600'
    if (v >= 50) return 'from-amber-400 to-amber-600'
    return 'from-rose-400 to-rose-600'
  }

  const getTrack = (v) => {
    if (v >= 70) return 'bg-emerald-100/50'
    if (v >= 50) return 'bg-amber-100/50'
    return 'bg-rose-100/50'
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`w-24 h-2 rounded-full ${getTrack(value)} relative overflow-hidden p-[1px]`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full bg-gradient-to-r ${getColor(value)} shadow-sm`}
        />
      </div>
      <span className="text-xs font-black text-slate-900 tracking-tight tabular-nums">{Math.round(value)}%</span>
    </div>
  )
}
