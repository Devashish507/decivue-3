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
    case 'Draft': return 'Draft'
    case 'Active': return 'Active'
    case 'Stale': return 'Stale'
    case 'Closed': return 'Closed'
    case 'fresh': return 'Fresh' // Legacy support
    case 'stable': return 'Stable' // Legacy support
    default: return lifecycle || 'Unknown'
  }
}

export function getLifecycleColor(lifecycle) {
  switch (lifecycle) {
    case 'Draft': return 'gray'
    case 'Active': return 'green'
    case 'Stale': return 'amber'
    case 'Closed': return 'red'
    case 'fresh': return 'blue' // Legacy support
    case 'stable': return 'green' // Legacy support
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
