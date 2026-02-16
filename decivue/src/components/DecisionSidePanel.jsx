import React from 'react'

export default function DecisionSidePanel({ decision, onClose, onAction }) {
    if (!decision) return null

    return (
        <div className="absolute top-0 right-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl z-20 flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between bg-gray-50">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{decision.statement}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${decision.healthStatus === 'healthy' ? 'bg-green-100 text-green-700' :
                            decision.healthStatus === 'review' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                            {decision.healthStatus === 'healthy' ? 'Healthy' : decision.healthStatus === 'review' ? 'Needs Review' : 'At Risk'}
                        </span>
                        <span className="text-xs text-gray-500">ID: {decision.id}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onAction('edit', decision.id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                        title="Edit Decision"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Context */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Context</h3>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {decision.context}
                    </p>
                </section>

                {/* Assumptions */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Assumptions</h3>
                    <ul className="space-y-2">
                        {decision.assumptions.map((assumption, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {assumption}
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Scoring */}
                <section className="grid grid-cols-2 gap-4">
                    <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">Confidence</div>
                        <div className={`text-xl font-bold ${decision.confidence >= 70 ? 'text-green-600' : decision.confidence >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                            {decision.confidence}%
                        </div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                        <div className={`text-xl font-bold capitalize ${decision.riskLevel === 'low' ? 'text-green-600' : decision.riskLevel === 'medium' ? 'text-amber-600' : 'text-red-600'
                            }`}>
                            {decision.riskLevel}
                        </div>
                    </div>
                </section>

                {/* Signals/Timeline */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Recent Activity</h3>
                    <div className="space-y-3">
                        {decision.timeline.slice(-3).reverse().map((event, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                <span className="text-gray-500 text-xs w-20">{event.date}</span>
                                <span className="text-gray-700">{event.event}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
                <button
                    onClick={() => onAction('create_child', decision.id)}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Sub-Decision
                </button>
                <button
                    onClick={() => window.location.href = `/decisions/${decision.id}/focus`}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                    View Detailed Tree
                </button>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onAction('mark_reviewed', decision.id)}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Reaffirm
                    </button>
                    <button
                        onClick={() => onAction('add_note', decision.id)}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Add Note
                    </button>
                </div>
            </div>
        </div>
    )
}
