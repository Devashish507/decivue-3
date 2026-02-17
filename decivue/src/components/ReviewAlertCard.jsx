import React from 'react';
import { AlertCircle, TrendingUp, Clock, ArrowRight, ShieldAlert, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

    const escalationLevels = {
        GOVERNANCE_RISK: {
            bg: 'bg-rose-50/50',
            text: 'text-rose-700',
            border: 'border-rose-100',
            icon: ShieldAlert,
            label: 'Governance Risk'
        },
        HIGH_PRIORITY: {
            bg: 'bg-amber-50/50',
            text: 'text-amber-700',
            border: 'border-amber-100',
            icon: Zap,
            label: 'High Priority'
        },
        REMINDER: {
            bg: 'bg-indigo-50/50',
            text: 'text-indigo-700',
            border: 'border-indigo-100',
            icon: Clock,
            label: 'Standard Reminder'
        },
        default: {
            bg: 'bg-slate-50/50',
            text: 'text-slate-700',
            border: 'border-slate-100',
            icon: AlertCircle,
            label: 'Review'
        }
    };

    const config = escalationLevels[escalationLevel] || escalationLevels.default;
    const urgencyColor = urgencyScore >= 80 ? 'text-rose-600' : urgencyScore >= 60 ? 'text-amber-600' : 'text-indigo-600';

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative group border ${config.border} ${config.bg} rounded-3xl p-5 flex flex-col h-full shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300`}
        >
            {/* Urgency Badge */}
            <div className="absolute top-5 right-5">
                <div className={`flex flex-col items-center bg-white rounded-2xl px-3 py-2 border ${config.border} shadow-sm group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:translate-y-[-2px] transition-all duration-300`}>
                    <span className={`text-[10px] uppercase tracking-widest font-black ${urgencyColor} group-hover:text-white transition-colors`}>Urgency</span>
                    <span className={`text-lg font-black text-slate-900 group-hover:text-white transition-colors`}>{urgencyScore}</span>
                </div>
            </div>

            {/* Header Content */}
            <div className="pr-16 mb-4">
                <div className={`p-2 rounded-xl bg-white w-fit mb-3 border ${config.border} ${config.text}`}>
                    <config.icon className="w-5 h-5" />
                </div>
                <Link to={`/decisions/${id}`} className="group/link block">
                    <h3 className="text-base font-black text-slate-900 group-hover/link:text-indigo-600 transition-colors line-clamp-1 flex items-center gap-1.5 leading-tight">
                        {title}
                        <ArrowRight className="w-4 h-4 translate-x-[-4px] opacity-0 group-hover/link:translate-x-0 group-hover/link:opacity-100 transition-all" />
                    </h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}>
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Overdue/Timing Info */}
            {daysOverdue !== null && daysOverdue > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-full w-fit text-[10px] font-black uppercase tracking-widest mb-4 animate-pulse">
                    <Clock className="w-3 h-3" />
                    <span>{daysOverdue} Days Critical</span>
                </div>
            )}

            {/* Change History (Snippet) */}
            {whatChanged && whatChanged.length > 0 && !whatChanged.includes('No previous review available') && (
                <div className="flex-1">
                    <div className="space-y-2 mb-4 bg-white/50 rounded-2xl p-3 border border-white">
                        {whatChanged.slice(0, 2).map((change, idx) => (
                            <div key={idx} className="flex gap-2 text-xs font-medium text-slate-500">
                                <div className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                                <span className="line-clamp-2 italic leading-relaxed">"{change}"</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-200/50">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Next Review: <span className="text-slate-900 font-bold">{formatDate(nextReviewDate)}</span>
                </div>
                <Link
                    to={`/decisions/${id}`}
                    className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200 active:scale-95"
                >
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
};

export default ReviewAlertCard;
