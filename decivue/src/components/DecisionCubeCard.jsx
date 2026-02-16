import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ConfidenceGauge from './ConfidenceGauge';
import HealthBadge from './HealthBadge';

const lifecycleColors = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-300',
    Active: 'bg-green-100 text-green-700 border-green-300',
    Stable: 'bg-blue-100 text-blue-700 border-blue-300',
    'At Risk': 'bg-orange-100 text-orange-700 border-orange-300',
    Stale: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Invalidated: 'bg-red-100 text-red-700 border-red-300',
    Closed: 'bg-gray-100 text-gray-600 border-gray-300'
};

const riskBorderColors = {
    Low: 'border-l-green-500',
    Medium: 'border-l-yellow-500',
    High: 'border-l-red-500'
};

export default function DecisionCubeCard({ decision, onEdit }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/decisions/${decision.id}/focus`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        if (onEdit) onEdit(decision);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={handleClick}
            className={`
                bg-white rounded-xl border-2 border-gray-200 
                ${riskBorderColors[decision.riskLevel] || 'border-l-gray-400'}
                border-l-4
                p-5 cursor-pointer shadow-sm hover:shadow-lg
                transition-shadow duration-200
                flex flex-col h-full relative group
            `}
        >
            {/* Edit Button Overlay */}
            <button
                onClick={handleEdit}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md border border-gray-100 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all z-10"
                title="Edit Decision"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                        {decision.statement || decision.title}
                    </h3>
                </div>
                <div className="ml-1 flex-shrink-0">
                    <ConfidenceGauge value={decision.confidence} size={60} strokeWidth={6} />
                </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
                <HealthBadge status={decision.calculated_health?.status || decision.healthStatus} />
                {decision.calculated_health?.time_status && (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${decision.calculated_health.time_status === 'On Track' ? 'bg-green-100 text-green-700 border-green-300' :
                        decision.calculated_health.time_status === 'Behind Schedule' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            decision.calculated_health.time_status === 'At Risk' ? 'bg-red-100 text-red-700 border-red-300' :
                                'bg-blue-100 text-blue-700 border-blue-300'
                        }`}>
                        {decision.calculated_health.time_status}
                    </span>
                )}
            </div>

            {/* Context Preview */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                {decision.context || decision.explanation || 'No context provided'}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(decision.progressPercentage || decision.progress_percentage || 0)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-1.5 rounded-full ${(decision.calculated_health?.time_status === 'Behind Schedule') ? 'bg-amber-500' :
                            (decision.calculated_health?.time_status === 'At Risk') ? 'bg-red-500' :
                                (decision.progress_percentage >= 100) ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${decision.progressPercentage || decision.progress_percentage || 0}%` }}
                    />
                </div>
            </div>

            {/* Sub-Decisions */}
            {decision.children && decision.children.length > 0 && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                        Sub-Decisions ({decision.children.length})
                    </p>
                    <div className="space-y-1">
                        {decision.children.slice(0, 3).map(child => (
                            <div
                                key={child.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/decisions/${child.id}/focus`);
                                }}
                                className="flex items-center justify-between text-xs p-1.5 hover:bg-white rounded cursor-pointer transition-colors group"
                            >
                                <span className="font-medium text-gray-700 group-hover:text-blue-600 truncate flex-1 mr-2">
                                    {child.title}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${child.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                                    child.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {child.riskLevel}
                                </span>
                            </div>
                        ))}
                        {decision.children.length > 3 && (
                            <div className="text-[10px] text-center text-gray-400 pt-1">
                                +{decision.children.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Reviewed {formatDate(decision.lastReviewedAt)}</span>
                </div>
                <div className={`font-medium ${decision.riskLevel === 'High' ? 'text-red-600' :
                    decision.riskLevel === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                    {decision.riskLevel} Risk
                </div>
            </div>
        </motion.div>
    );
}
