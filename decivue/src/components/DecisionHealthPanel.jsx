import React from 'react';
import { motion } from 'framer-motion';
import { getHealthColor, getHealthLabel, formatDate } from '../utils/helpers';
import ConfidenceGauge from './ConfidenceGauge';

export default function DecisionHealthPanel({ decision }) {
    if (!decision) return null;

    const health = decision.calculated_health || {};
    const timeStatus = health.time_status || 'On Track';
    const healthScore = health.score || 100;
    const progress = decision.progressPercentage || decision.progress_percentage || 0;

    // Calculate time progress for display
    let timeProgress = 0;
    if (decision.start_date && decision.target_date) {
        const total = new Date(decision.target_date) - new Date(decision.start_date);
        const elapsed = new Date() - new Date(decision.start_date);
        timeProgress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Decision Health Engine
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* 1. Health Score */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium text-gray-500 mb-2">Health Score</span>
                    <div className="relative flex items-center justify-center">
                        <svg className="w-24 h-24 transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * healthScore / 100)}
                                className={`${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <span className="absolute text-2xl font-bold text-gray-800">{Math.round(healthScore)}</span>
                    </div>
                    <span className={`mt-2 text-xs font-bold px-2 py-1 rounded-full ${healthScore > 80 ? 'bg-green-100 text-green-700' : healthScore > 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {getHealthLabel(health.status)}
                    </span>
                </div>

                {/* 2. Progress vs Time */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                            <span>Execution Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                            <div className="h-3 rounded-full bg-blue-600" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                            <span>Time Elapsed</span>
                            <span>{Math.round(timeProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 relative">
                            {/* Marker line for Today if within range? No just fill is fine */}
                            <div className={`h-3 rounded-full ${timeProgress > progress + 10 ? 'bg-red-400' : 'bg-gray-400'}`} style={{ width: `${timeProgress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Started: {formatDate(decision.start_date)}</span>
                            <span>Target: {formatDate(decision.target_date)}</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 border border-blue-100 md:col-span-2">
                        <strong>Status: </strong>
                        <span className={`${timeStatus === 'Behind Schedule' ? 'text-red-600 font-bold' :
                                timeStatus === 'Completed' ? 'text-green-600 font-bold' : 'text-blue-800'
                            }`}>
                            {timeStatus}
                        </span>
                        {timeStatus === 'Behind Schedule' && ' — Action recommended to get back on track.'}
                    </div>
                </div>

                {/* 3. Review Cycle */}
                <div className="flex flex-col gap-3">
                    <div className="p-3 bg-gray-50 rounded border border-gray-100">
                        <span className="text-xs text-gray-500 uppercase">Confidence</span>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-bold text-gray-900">{decision.current_confidence || decision.confidence}%</span>
                            <span className="text-xs text-gray-500 mb-1">Current</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${decision.current_confidence || decision.confidence}%` }}></div>
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded border border-gray-100 flex-1">
                        <span className="text-xs text-gray-500 uppercase">Next Review</span>
                        <div className="text-lg font-semibold text-gray-800 mt-1">
                            {formatDate(decision.review_due_date || decision.reviewDate)}
                        </div>
                        {health.log_events && health.log_events.length > 0 && (
                            <div className="mt-2 text-xs text-red-600 border-t border-gray-200 pt-2">
                                <span className="font-semibold block mb-1">Recent Impacts:</span>
                                <ul className="list-disc list-inside">
                                    {health.log_events.slice(0, 2).map((e, i) => (
                                        <li key={i} className="truncate">{e}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
