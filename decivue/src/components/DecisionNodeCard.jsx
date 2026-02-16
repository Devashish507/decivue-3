import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

const HealthBadge = ({ status }) => {
    const styles = {
        healthy: 'bg-green-100 text-green-700',
        review: 'bg-amber-100 text-amber-700',
        'at-risk': 'bg-red-100 text-red-700',
    }
    const labels = {
        healthy: 'Healthy',
        review: 'Needs Review',
        'at-risk': 'At Risk',
    }
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${styles[status] || styles['review']}`}>
            {labels[status]}
        </span>
    )
}

const DecisionNodeCard = memo(({ data, selected }) => {
    const { decision, onAddChild } = data

    // Dynamic border color based on health status
    const borderColor = {
        healthy: 'border-l-green-500',
        review: 'border-l-amber-500',
        'at-risk': 'border-l-red-500',
    }[decision.healthStatus] || 'border-l-gray-300'

    return (
        <div className={`
      relative w-80 bg-white rounded-lg shadow-sm border border-gray-200 
      ${borderColor} border-l-4 transition-all duration-200
      ${selected ? 'ring-2 ring-blue-500 shadow-md transform scale-105 z-10' : 'hover:shadow-md'}
    `}>
            <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-3 !h-3" />

            <div className="p-4">
                {/* Header: Status & Risk */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5">
                        <HealthBadge status={decision.healthStatus} />
                        {decision.trend && (
                            <span title={`Trend: ${decision.trend}`} className={`
                                flex items-center justify-center w-4 h-4 rounded-full text-[10px]
                                ${decision.trend === 'up' ? 'bg-green-50 text-green-600' :
                                    decision.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}
                            `}>
                                {decision.trend === 'up' ? '↑' : decision.trend === 'down' ? '↓' : '→'}
                            </span>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (data.onEdit) data.onEdit(decision);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit Decision"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                    {decision.conflict && (
                        <div className="text-red-500 animate-pulse" title="Conflict Detected">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="flex items-center justify-between mb-3 gap-2">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 flex-1" title={decision.statement}>
                        {decision.statement}
                    </h3>
                    <a
                        href={`/decisions/${decision.id}/focus`}
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/decisions/${decision.id}/focus`;
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-100 whitespace-nowrap"
                    >
                        Focus →
                    </a>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5" title="Confidence Score">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="16" cy="16" r="14" stroke="#e5e7eb" strokeWidth="3" fill="none" />
                                <circle
                                    cx="16"
                                    cy="16"
                                    r="14"
                                    stroke={decision.confidence >= 70 ? '#16a34a' : decision.confidence >= 50 ? '#d97706' : '#dc2626'}
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray={88}
                                    strokeDashoffset={88 - (88 * decision.confidence) / 100}
                                    className="transition-all duration-500"
                                />
                            </svg>
                            <span className="absolute text-[10px] font-medium text-gray-700">{decision.confidence}%</span>
                        </div>
                        <span>Conf.</span>
                    </div>

                    <div className="text-right">
                        <div className="font-medium text-gray-900">{decision.riskLevel === 'high' ? 'High Risk' : decision.riskLevel === 'medium' ? 'Med Risk' : 'Low Risk'}</div>
                        <div className="text-[10px] mt-0.5">
                            {decision.lastReviewedAt ? `Updated ${new Date(decision.lastReviewedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Not reviewed'}
                        </div>
                    </div>
                </div>

                {/* Action: Add Child (Hover only or selected) */}
                <button
                    className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 shadow-sm rounded-full p-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50"
                    onClick={(e) => {
                        e.stopPropagation()
                        onAddChild(decision.id)
                    }}
                    title="Add sub-decision"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-3 !h-3" />
        </div>
    )
})

export default DecisionNodeCard
