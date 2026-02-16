import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HealthBadge from './HealthBadge'
import RiskTag from './RiskTag'
import ConfidenceGauge from './ConfidenceGauge'
import GovernanceBadge from './GovernanceBadge'
import { getLifecycleLabel, getLifecycleColor } from '../utils/helpers'

export default function DecisionCard({ decision, onEdit }) {
  // Calculate days since last review
  const getDaysSinceReview = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    return Math.floor((now - date) / (1000 * 60 * 60 * 24))
  }

  const daysSinceReview = getDaysSinceReview(decision.lastReviewedAt)
  const reviewStatusColor = daysSinceReview > 30 ? 'text-red-500' : daysSinceReview > 14 ? 'text-amber-500' : 'text-gray-400'

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
    >
      {/* Decorative top border based on health */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${decision.healthStatus === 'healthy' ? 'bg-green-500' :
        decision.healthStatus === 'needs-review' ? 'bg-amber-500' :
          'bg-red-500'
        }`} />

      {/* Header: Title & Health Ring */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <HealthBadge status={decision.healthStatus} size="sm" />
            <GovernanceBadge
              status={decision.governance_status || 'Draft'}
              required={decision.isGovernanceRequired}
              size="sm"
              compact={true}
            />
            {/* Lifecycle Badge */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getLifecycleColor(decision.lifecycleState) === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
              getLifecycleColor(decision.lifecycleState) === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                getLifecycleColor(decision.lifecycleState) === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  getLifecycleColor(decision.lifecycleState) === 'red' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-gray-50 text-gray-500 border-gray-200'
              }`}>
              {getLifecycleLabel(decision.lifecycleState)}
            </span>
          </div>
          <Link
            to={`/decisions/${decision.id}`}
            className="block text-lg font-bold text-gray-900 leading-snug hover:text-blue-600 transition-colors line-clamp-2"
          >
            {decision.statement || decision.title}
          </Link>
        </div>
        <div className="flex-shrink-0">
          <ConfidenceGauge value={decision.confidence} size={48} strokeWidth={5} label={false} />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
        {decision.explanation || decision.context || 'No description provided.'}
      </p>

      {/* Metrics & Progress */}
      <div className="mt-auto space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-500 font-medium">Progress</span>
            <span className="text-gray-900 font-bold">{Math.round(decision.progressPercentage || 0)}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${decision.progressPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Footer: Risk & Review */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <RiskTag level={decision.riskLevel} />

          <div className="flex items-center gap-1.5 text-xs font-medium">
            <svg className={`w-3.5 h-3.5 ${reviewStatusColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-500">
              {daysSinceReview !== null ? `${daysSinceReview}d ago` : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Overlay (Visible on Hover) */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEdit && onEdit(decision)
          }}
          className="p-2 bg-white text-gray-400 hover:text-blue-600 rounded-lg shadow-md border border-gray-100 hover:border-blue-100 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}
