import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { decisionService } from '../services/api';

export default function ReasoningTreePanel({ decisionId }) {
    const navigate = useNavigate();
    const [reasoningTree, setReasoningTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadReasoningTree();
    }, [decisionId]);

    const loadReasoningTree = async () => {
        try {
            setLoading(true);
            const response = await decisionService.getReasoningTree(decisionId);
            setReasoningTree(response.data);
        } catch (err) {
            console.error('Error loading reasoning tree:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                Error loading reasoning tree: {error}
            </div>
        );
    }

    if (!reasoningTree) {
        return (
            <div className="text-center py-8 text-gray-500">
                No reasoning data available
            </div>
        );
    }

    // Graph Mode Data Mapping
    let displayTree = reasoningTree;
    if (reasoningTree.mode === 'graph') {
        const nodes = reasoningTree.nodes || [];
        displayTree = {
            goal: reasoningTree.goal,
            subDecisions: reasoningTree.subDecisions,
            assumptions: nodes.filter(n => n.type === 'ASSUMPTION').map(n => ({ id: n.id, text: n.text, isActive: true })),
            risks: nodes.filter(n => n.type === 'RISK').map(n => ({ id: n.id, text: n.text })),
            confidenceFactors: nodes.filter(n => n.type === 'CONFIDENCE').map(n => ({ id: n.id, text: n.text })),
            options: nodes.filter(n => n.type === 'OPTION').map(n => ({ id: n.id, text: n.text }))
        };
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Decision Reasoning</h3>
                <p className="text-sm text-gray-500">Internal logic and assumptions {reasoningTree.mode === 'graph' && '(Graph Mode)'}</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {/* Goal Node */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-5 shadow-lg"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-wide">Goal</span>
                    </div>
                    <h4 className="font-bold text-lg">{displayTree.goal.title}</h4>
                    {displayTree.goal.context && (
                        <p className="text-sm mt-2 text-blue-100">{displayTree.goal.context}</p>
                    )}
                </motion.div>

                {/* Sub-Decisions */}
                {displayTree.subDecisions && displayTree.subDecisions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Sub-Decisions ({displayTree.subDecisions.length})
                        </h4>
                        <div className="space-y-2">
                            {displayTree.subDecisions.map((subDecision, index) => (
                                <motion.div
                                    key={subDecision.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    onClick={() => navigate(`/decisions/${subDecision.id}/focus`)}
                                    className="bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-pointer hover:bg-orange-100 hover:border-orange-300 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <h5 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                                                {subDecision.title}
                                            </h5>
                                            {subDecision.context && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{subDecision.context}</p>
                                            )}
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Options (New for Graph) */}
                {displayTree.options && displayTree.options.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <span className="text-indigo-500 text-lg">❑</span> Options
                        </h4>
                        <div className="space-y-2">
                            {displayTree.options.map((opt) => (
                                <div key={opt.id} className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-sm">
                                    {opt.text}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Assumptions */}
                {displayTree.assumptions && displayTree.assumptions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            Assumptions
                        </h4>
                        <div className="space-y-2">
                            {displayTree.assumptions.map((assumption, index) => (
                                <div
                                    key={assumption.id}
                                    className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 ${assumption.isActive ? 'bg-green-500 border-green-600' : 'bg-gray-300 border-gray-400'}`}></div>
                                        <p className="text-sm text-gray-800">{assumption.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Risks */}
                {displayTree.risks && displayTree.risks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Risks
                        </h4>
                        <div className="space-y-2">
                            {displayTree.risks.map((risk, index) => (
                                <div
                                    key={risk.id}
                                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                                >
                                    <p className="text-sm text-gray-800">{risk.text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Confidence Factors */}
                {displayTree.confidenceFactors && displayTree.confidenceFactors.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Confidence Factors
                        </h4>
                        <div className="space-y-2">
                            {displayTree.confidenceFactors.map((factor, index) => (
                                <div
                                    key={factor.id}
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                                >
                                    <p className="text-sm text-gray-800">{factor.text}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
