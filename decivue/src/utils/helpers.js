export function getHealthColor(status) {
  const s = status?.toLowerCase();
  if (s === 'healthy' || s === 'on track') return 'green';
  if (s === 'needs review' || s === 'behind schedule') return 'amber';
  if (s === 'at risk' || s === 'overdue') return 'red';
  return 'gray';
}

export function getHealthLabel(status) {
  return status || 'Unknown';
}

export function getLifecycleLabel(lifecycle) {
  switch (lifecycle) {
    case 'fresh': return 'Fresh'
    case 'stable': return 'Stable'
    case 'at-risk': return 'At Risk'
    case 'stale': return 'Stale'
    default: return 'Unknown'
  }
}

export function getLifecycleColor(lifecycle) {
  switch (lifecycle) {
    case 'fresh': return 'blue'
    case 'stable': return 'green'
    case 'at-risk': return 'amber'
    case 'stale': return 'red'
    default: return 'gray'
  }
}

export function getRiskColor(level) {
  const l = level?.toLowerCase();
  switch (l) {
    case 'low': return 'green'
    case 'medium': return 'amber'
    case 'high': return 'red'
    default: return 'gray'
  }
}

export function getProgressColor(percentage) {
  if (percentage >= 100) return 'green';
  if (percentage >= 50) return 'blue';
  return 'indigo';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function computeHealthScore(decisions) {
  if (!decisions.length) return 0
  const total = decisions.reduce((sum, d) => sum + d.confidence, 0)
  return Math.round(total / decisions.length)
}
