import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HealthBadge from './HealthBadge'
import RiskTag from './RiskTag'
import ConfidenceGauge from './ConfidenceGauge'
import GovernanceBadge from './GovernanceBadge'
import { getLifecycleLabel, getLifecycleColor } from '../utils/helpers'
import { Calendar, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react'

export default function DecisionCard({ decision, onEdit, showDelete = false, onDelete }) {
  const getDaysSinceReview = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    return Math.floor((now - date) / (1000 * 60 * 60 * 24))
  }

  const daysSinceReview = getDaysSinceReview(decision.lastReviewedAt)
  const reviewStatusColor = daysSinceReview > 30 ? 'text-rose-500' : daysSinceReview > 14 ? 'text-amber-500' : 'text-slate-400'

  const lifecycleColorMap = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100/50',
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-100/50',
    amber: 'bg-amber-50 text-amber-700 border-amber-100/50',
    red: 'bg-rose-50 text-rose-700 border-rose-100/50',
  }

  const lcColor = getLifecycleColor(decision.lifecycleState)

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      className="group relative bg-white rounded-[2rem] border border-slate-100/80 p-6 flex flex-col h-full shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
    >
      {/* Dynamic Health Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[64px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none ${decision.confidence >= 70 ? 'bg-emerald-500' :
          decision.confidence >= 50 ? 'bg-amber-500' :
            'bg-rose-500'
        }`} />

      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <HealthBadge status={decision.healthStatus} size="sm" />

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${lifecycleColorMap[lcColor] || lifecycleColorMap.blue}`}>
              {getLifecycleLabel(decision.lifecycleState)}
            </span>

            {((decision.governance_status && decision.governance_status !== 'Draft') || decision.lifecycleState === 'Draft') && (
              <GovernanceBadge
                status={decision.governance_status || 'Draft'}
                required={decision.isGovernanceRequired}
                size="sm"
                compact={true}
              />
            )}
          </div>
          <Link
            to={`/decisions/${decision.id}`}
            className="block text-lg font-black text-slate-900 leading-tight hover:text-indigo-600 transition-colors line-clamp-2 tracking-tight"
          >
            {decision.statement || decision.title}
          </Link>
        </div>
        <div className="relative group-hover:scale-110 transition-transform duration-500">
          <ConfidenceGauge value={decision.confidence} size={56} strokeWidth={6} label={false} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400">{decision.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <p className="text-sm text-slate-500 mb-8 line-clamp-2 flex-1 leading-relaxed font-medium italic opacity-80 group-hover:opacity-100 transition-opacity">
        "{decision.explanation || decision.context || 'No description provided.'}"
      </p>

      {/* Footer Metrics */}
      <div className="space-y-6 mt-auto">
        {/* Progress System */}
        <div className="relative pt-2">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">
            <span>Execution Progress</span>
            <span className="text-slate-900">{Math.round(decision.progressPercentage || 0)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-[2px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${decision.progressPercentage || 0}%` }}
              transition={{ duration: 1, ease: 'circOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
          <div className="flex items-center gap-3">
            <RiskTag level={decision.riskLevel} />

            <div className="flex -space-x-2">
              {decision.teamMap?.owner_id && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700 shadow-sm" title={`Owner: ${decision.teamMap.owner_id}`}>
                  {decision.teamMap.owner_id.split('_').pop()?.charAt(0) || 'U'}
                </div>
              )}
              {decision.teamMap?.reviewer_id && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700 shadow-sm" title={`Reviewer: ${decision.teamMap.reviewer_id}`}>
                  {decision.teamMap.reviewer_id.split('_').pop()?.charAt(0) || 'R'}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
            <Calendar className={`w-3.5 h-3.5 ${reviewStatusColor}`} strokeWidth={3} />
            <span>{daysSinceReview !== null ? `${daysSinceReview}d ago` : 'First Draft'}</span>
          </div>
        </div>
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
        <button
          onClick={(e) => {
            e.preventDefault()
            onEdit && onEdit(decision)
          }}
          className="p-2.5 bg-white/90 backdrop-blur text-slate-400 hover:text-indigo-600 rounded-xl shadow-xl border border-slate-100 hover:border-indigo-100 transition-all active:scale-90"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Decorative arrow showing detail link */}
      <div className="absolute -bottom-1 -right-1 p-4 opacity-0 group-hover:opacity-10 scale-50 group-hover:scale-100 transition-all duration-500 text-indigo-900">
        <ArrowRight className="w-12 h-12 -rotate-45" />
      </div>
    </motion.div>
  )
}
