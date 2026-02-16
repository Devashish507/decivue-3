import { getHealthLabel, getHealthColor } from '../utils/helpers'

const colorStyles = {
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

const dotColors = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
}

export default function HealthBadge({ status, size = 'md' }) {
  const color = getHealthColor(status)
  const label = getHealthLabel(status)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${colorStyles[color]}`}>
      <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
      {label}
    </span>
  )
}
