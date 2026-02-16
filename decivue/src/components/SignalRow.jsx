const severityStyles = {
  good: { bg: 'bg-green-50', icon: 'text-green-500', text: 'text-green-800', border: 'border-green-200' },
  warning: { bg: 'bg-amber-50', icon: 'text-amber-500', text: 'text-amber-800', border: 'border-amber-200' },
  risk: { bg: 'bg-red-50', icon: 'text-red-500', text: 'text-red-800', border: 'border-red-200' },
}

const icons = {
  check: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  alert: (className) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function SignalRow({ signal }) {
  const style = severityStyles[signal.severity] || severityStyles.good
  const IconFn = icons[signal.icon] || icons.check

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}>
      {IconFn(`w-5 h-5 flex-shrink-0 ${style.icon}`)}
      <span className={`text-sm font-medium ${style.text}`}>{signal.message}</span>
    </div>
  )
}
