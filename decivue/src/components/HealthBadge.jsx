import { getHealthLabel, getHealthColor } from '../utils/helpers'
import { motion } from 'framer-motion'

const colorStyles = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100/50 shadow-emerald-500/5',
  amber: 'bg-amber-50 text-amber-700 border-amber-100/50 shadow-amber-500/5',
  red: 'bg-rose-50 text-rose-700 border-rose-100/50 shadow-rose-500/5',
  gray: 'bg-slate-50 text-slate-700 border-slate-100/50 shadow-slate-500/5',
}

const dotColors = {
  green: 'bg-emerald-500 shadow-emerald-200',
  amber: 'bg-amber-500 shadow-amber-200',
  red: 'bg-rose-500 shadow-rose-200',
  gray: 'bg-slate-500 shadow-slate-200',
}

export default function HealthBadge({ status, size = 'md' }) {
  const color = getHealthColor(status)
  const label = getHealthLabel(status)
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-black uppercase tracking-widest leading-none shadow-sm ${sizeClass} ${colorStyles[color]}`}>
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`w-1.5 h-1.5 rounded-full shadow-lg ${dotColors[color]}`}
      />
      {label}
    </span>
  )
}
