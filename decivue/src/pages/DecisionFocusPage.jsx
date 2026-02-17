import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { decisionService } from '../services/api';
import ReasoningTreePanel from '../components/ReasoningTreePanel';
import RelationshipSpiderPanel from '../components/RelationshipSpiderPanel';
import AddRelationshipModal from '../components/AddRelationshipModal';
import AddDecisionWizard from '../components/AddDecisionWizard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DecisionTreeContainer from '../components/DecisionTreeContainer';
import { Target, ChevronLeft, Plus, Share2, Network, Binary, Sparkles, Activity } from 'lucide-react';

export default function DecisionFocusPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reasoning');
    const [showAddRelationship, setShowAddRelationship] = useState(false);
    const [showAddSubDecision, setShowAddSubDecision] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        loadDecision();
    }, [id]);

    const loadDecision = async () => {
        try {
            setLoading(true);
            const decision = await decisionService.getById(id);
            setDecision(decision);
        } catch (err) {
            console.error('Error loading decision:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRelationshipAdded = () => {
        setRefreshKey(prev => prev + 1);
        loadDecision();
    };

    if (loading) return (
        <div className="p-8 space-y-8 animate-pulse">
            <div className="h-32 bg-slate-100 rounded-[2rem]" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 h-96 bg-slate-50 rounded-3xl" />
                <div className="lg:col-span-2 h-96 bg-slate-50 rounded-3xl" />
            </div>
        </div>
    );

    if (!decision) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                <Target className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Node Not Located</h2>
            <p className="text-slate-500 font-medium mb-8">The requested intelligence node could not be retrieved.</p>
            <Link to="/decisions" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">
                <ChevronLeft className="w-5 h-5" />
                Return to Library
            </Link>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Immersive Header */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -u-z-10" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/decisions')}
                                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <Target className="w-4 h-4" />
                                Strategic Focus Mode
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{decision.title}</h1>
                                {decision.decision_type === 'SUB_DECISION' && (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100/50">
                                        Sub-Node
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Activity className="w-4 h-4 text-indigo-400" />
                                    <span>Confidence Coefficient: <span className="text-slate-900 font-bold">{decision.current_confidence || decision.confidence}%</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowAddSubDecision(true)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                        >
                            <Binary className="w-4 h-4 text-slate-400" />
                            Expand Sub-Node
                        </button>
                        <button
                            onClick={() => setShowAddRelationship(true)}
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Link Relationship
                        </button>
                        <Link
                            to={`/decisions/${id}`}
                            className="px-6 py-3.5 text-sm text-indigo-600 font-black uppercase tracking-widest hover:text-indigo-700 transition-colors"
                        >
                            Matrix Details →
                        </Link>
                    </div>
                </div>

                {/* Analytical Tabs (Mobile/Responsive) */}
                <div className="lg:hidden flex bg-slate-50 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('reasoning')}
                        className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'reasoning'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-400'
                            }`}
                    >
                        Reasoning Logic
                    </button>
                    <button
                        onClick={() => setActiveTab('relationships')}
                        className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'relationships'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-400'
                            }`}
                    >
                        Network Graph
                    </button>
                </div>
            </div>

            {/* Matrix Analysis Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Panel - Reasoning Logic (60%) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 ${activeTab === 'reasoning' ? 'block' : 'hidden lg:block'
                        }`}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Reasoning Architecture</h3>
                        </div>
                    </div>
                    <ReasoningTreePanel decisionId={id} />
                </motion.div>

                {/* Right Panel - Relationship Spider (40%) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 ${activeTab === 'relationships' ? 'block' : 'hidden lg:block'
                        }`}
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Dependency Network</h3>
                        </div>
                    </div>
                    <RelationshipSpiderPanel
                        decisionId={id}
                        currentDecisionTitle={decision.title}
                    />
                </motion.div>
            </div>

            {/* Visual Synthesis (Full Width) */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50"
            >
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Network className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Synthesized Decision Topology</h3>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] uppercase font-black tracking-widest rounded-full border border-indigo-200/50 shadow-sm">Real-time Topography</span>
                    </div>
                </div>
                <div className="h-[600px] relative group/tree">
                    <DecisionTreeContainer decisionId={id} />
                    <div className="absolute inset-0 pointer-events-none border-4 border-indigo-500/0 group-hover/tree:border-indigo-500/5 transition-all duration-700 rounded-[3rem]" />
                </div>
            </motion.div>

            {/* Modals & Overlays */}
            <AddRelationshipModal
                isOpen={showAddRelationship}
                onClose={() => setShowAddRelationship(false)}
                currentDecisionId={id}
                currentDecisionTitle={decision.title}
                onRelationshipAdded={handleRelationshipAdded}
            />
            {showAddSubDecision && (
                <AddDecisionWizard
                    onClose={() => setShowAddSubDecision(false)}
                    initialContext={{
                        parentDecisionId: id,
                        parentTitle: decision.title,
                        relationshipType: 'DERIVED_FROM'
                    }}
                />
            )}
        </div>
    );
}

