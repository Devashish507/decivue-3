import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDecisions } from '../hooks/useDecisions';
import DecisionCard from '../components/DecisionCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AddDecisionWizard from '../components/AddDecisionWizard';
import EditDecisionModal from '../components/EditDecisionModal';
import { Plus, Search, Filter, SortAsc, BookOpen, Layers } from 'lucide-react';

export default function DecisionLibraryPage() {
    const { decisions, loading, error, refresh, updateDecision } = useDecisions();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('lastReviewed');
    const [filterHealth, setFilterHealth] = useState('all');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [editingDecision, setEditingDecision] = useState(null);

    const filteredDecisions = useMemo(() => {
        let filtered = decisions.filter(d => d.parentId === null || !d.parentId);

        if (searchQuery) {
            filtered = filtered.filter(d =>
                d.statement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.context?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filterHealth !== 'all') {
            filtered = filtered.filter(d => d.healthStatus === filterHealth);
        }

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
            <div className="p-8 space-y-8">
                <div className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 max-w-lg mx-auto shadow-xl shadow-rose-500/5">
                    <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-200">
                        <Filter className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-rose-900 mb-2">Connectivity Interrupted</h2>
                    <p className="text-rose-600 font-medium mb-6">{error}</p>
                    <button onClick={() => refresh()} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors">
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -u-z-10" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <BookOpen className="w-4 h-4" />
                            Knowledge Inventory
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Decision Library</h1>
                        <p className="text-slate-500 font-medium">
                            Synthesizing <span className="text-slate-900 font-bold">{filteredDecisions.length}</span> strategic nodes from available intelligence.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="group inline-flex items-center gap-2.5 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:bg-indigo-600 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Establish Node</span>
                    </button>
                </div>

                {/* Intelligent Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by intelligence markers, statement, or context..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-sm font-medium transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative group/select">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within/select:text-indigo-500 transition-colors" />
                            <select
                                value={filterHealth}
                                onChange={(e) => setFilterHealth(e.target.value)}
                                className="pl-11 pr-10 py-4 border border-slate-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none shadow-sm min-w-[200px]"
                            >
                                <option value="all">Integrity: All</option>
                                <option value="healthy">Optimal Integrity</option>
                                <option value="needs-review">Requires Review</option>
                                <option value="at-risk">Critical Latency</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>

                        <div className="relative group/select">
                            <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within/select:text-indigo-500 transition-colors" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="pl-11 pr-10 py-4 border border-slate-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-xs font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none shadow-sm min-w-[200px]"
                            >
                                <option value="lastReviewed">Sync Date</option>
                                <option value="confidence">Confidence Quotient</option>
                                <option value="risk">Risk Vector</option>
                                <option value="title">Lexical Order</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decision Grid */}
            <div className="relative">
                {filteredDecisions.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                            <Layers className="w-12 h-12 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">No intelligence matched</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                            {searchQuery || filterHealth !== 'all'
                                ? 'The current query does not intercept any existing decision nodes. Refine your filters.'
                                : 'The intelligence repository is currently empty. Establish your first decision node to begin.'}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredDecisions.map((decision, index) => (
                                <motion.div
                                    key={decision.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    <DecisionCard
                                        decision={decision}
                                        onEdit={(d) => setEditingDecision(d)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Modals & Wizards */}
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
