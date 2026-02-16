import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecisions } from '../hooks/useDecisions';
import DecisionCard from '../components/DecisionCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AddDecisionWizard from '../components/AddDecisionWizard';
import EditDecisionModal from '../components/EditDecisionModal';

export default function DecisionLibraryPage() {
    const { decisions, loading, error, refresh, updateDecision } = useDecisions();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('lastReviewed'); // lastReviewed, confidence, risk, title
    const [filterHealth, setFilterHealth] = useState('all'); // all, healthy, needs-review, at-risk
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingDecision, setEditingDecision] = useState(null);



    // Filter and sort decisions
    const filteredDecisions = useMemo(() => {
        // Show only root decisions in the library by default
        let filtered = decisions.filter(d => d.parentId === null || !d.parentId);

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(d =>
                d.statement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.context?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Health filter
        if (filterHealth !== 'all') {
            filtered = filtered.filter(d => d.healthStatus === filterHealth);
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'confidence':
                    return (b.confidence || 0) - (a.confidence || 0);
                case 'risk':
                    const riskOrder = { High: 3, Medium: 2, Low: 1 };
                    return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
                case 'title':
                    return (a.statement || a.title || '').localeCompare(b.statement || b.title || '');
                case 'lastReviewed':
                default:
                    return new Date(b.lastReviewedAt || 0) - new Date(a.lastReviewedAt || 0);
            }
        });

        return filtered;
    }, [decisions, searchQuery, sortBy, filterHealth]);

    if (loading) {
        return (
            <div className="p-6">
                <LoadingSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    Error loading decisions: {error}
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Decision Library</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {filteredDecisions.length} {filteredDecisions.length === 1 ? 'decision' : 'decisions'}
                            </p>
                        </div>
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            New Decision
                        </button>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                        {/* Search */}
                        <div className="flex-1 relative w-full">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search decisions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Health Filter */}
                        <select
                            value={filterHealth}
                            onChange={(e) => setFilterHealth(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="all">All Health States</option>
                            <option value="healthy">Healthy</option>
                            <option value="needs-review">Needs Review</option>
                            <option value="at-risk">At Risk</option>
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="lastReviewed">Last Reviewed</option>
                            <option value="confidence">Confidence</option>
                            <option value="risk">Risk Level</option>
                            <option value="title">Title (A-Z)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Wizard Modal */}
            <AnimatePresence>
                {isWizardOpen && (
                    <AddDecisionWizard
                        onClose={() => {
                            setIsWizardOpen(false);
                            refresh();
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Decision Grid */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {filteredDecisions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No decisions found</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery || filterHealth !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first decision'}
                        </p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {filteredDecisions.map((decision, index) => (
                            <motion.div
                                key={decision.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <DecisionCard
                                    decision={decision}
                                    onEdit={(d) => setEditingDecision(d)}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Edit Modal */}
            <EditDecisionModal
                isOpen={!!editingDecision}
                decision={editingDecision}
                onClose={() => setEditingDecision(null)}
                onUpdate={async (id, data) => {
                    await updateDecision(id, data);
                    setEditingDecision(null);
                }}
            />
        </div>
    );
}
