import React from 'react';
import { AlertCircle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewAlertCard = ({ alert }) => {
    const {
        id,
        title,
        urgencyScore,
        escalationLevel,
        nextReviewDate,
        daysOverdue,
        whatChanged,
        riskLevel
    } = alert;

    // Color mapping for escalation levels
    const escalationColors = {
        GOVERNANCE_RISK: 'bg-red-50 text-red-800 border-red-200',
        HIGH_PRIORITY: 'bg-orange-50 text-orange-800 border-orange-200',
        REMINDER: 'bg-amber-50 text-amber-800 border-amber-200',
        null: 'bg-blue-50 text-blue-800 border-blue-200'
    };

    const urgencyColor = urgencyScore >= 80 ? 'text-red-600' : urgencyScore >= 60 ? 'text-orange-600' : 'text-amber-600';
    const bgColor = escalationLevel ? escalationColors[escalationLevel] : escalationColors[null];

    // Format date
    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={`border ${bgColor} rounded-2xl p-4 transition-all duration-200 hover:shadow-md`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <Link to={`/decisions/${id}`} className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-2">
                        {title}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    {escalationLevel && (
                        <div className="flex items-center gap-2 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {escalationLevel.replace('_', ' ')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Urgency Score Badge */}
                <div className="ml-3">
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border ${urgencyColor} font-bold text-sm`}>
                        <TrendingUp className="w-4 h-4" />
                        {urgencyScore}
                    </div>
                </div>
            </div>

            {/* Days Overdue (if applicable) */}
            {daysOverdue !== null && daysOverdue > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue</span>
                </div>
            )}

            {/* Next Review Date */}
            <div className="text-sm text-gray-700 mb-3">
                <span className="font-medium">Next Review:</span> {formatDate(nextReviewDate)}
            </div>

            {/* What Changed */}
            {whatChanged && whatChanged.length > 0 && !whatChanged.includes('No previous review available') && (
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">What Changed:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                        {whatChanged.slice(0, 3).map((change, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-gray-400">•</span>
                                <span>{change}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Review Now Button */}
            <div className="mt-4">
                <Link
                    to={`/decisions/${id}`}
                    className="block w-full text-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all hover:shadow-md active:scale-[0.98]"
                >
                    Review Now
                </Link>
            </div>
        </div>
    );
};

export default ReviewAlertCard;
