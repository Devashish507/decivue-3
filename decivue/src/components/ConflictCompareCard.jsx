export default function ConflictCompareCard({ decision, conflict }) {
  if (!conflict) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-sm font-semibold text-red-800">Potential Conflict Detected</h3>
      </div>
      <p className="text-sm text-red-700 mb-4">{conflict.reason}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <p className="text-xs text-gray-500 mb-1">This decision</p>
          <p className="text-sm font-medium text-gray-900">{decision.statement}</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Conflicting decision</p>
          <p className="text-sm font-medium text-gray-900">{conflict.withDecisionStatement}</p>
        </div>
      </div>
    </div>
  )
}
