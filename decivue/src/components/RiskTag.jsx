import { getRiskColor } from '../utils/helpers'
import { AlertTriangle } from 'lucide-react'

const colorStyles = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
  amber: 'bg-amber-50 text-amber-700 border-amber-100/50',
  red: 'bg-rose-50 text-rose-700 border-rose-100/50',
  gray: 'bg-slate-50 text-slate-700 border-slate-100/50',
}

export default function RiskTag({ level = 'Medium' }) {
  if (!level) level = 'Medium'
  const color = getRiskColor(level)
  const label = level.charAt(0).toUpperCase() + level.slice(1) + ' Risk'

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${colorStyles[color]}`}>
      <AlertTriangle className="w-3 h-3" strokeWidth={3} />
      {label}
    </span>
  )
}
