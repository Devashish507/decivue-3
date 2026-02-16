import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { decisionService } from '../services/api';
import ReasoningTreePanel from '../components/ReasoningTreePanel';
import RelationshipSpiderPanel from '../components/RelationshipSpiderPanel';
import AddRelationshipModal from '../components/AddRelationshipModal';
import AddDecisionWizard from '../components/AddDecisionWizard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DecisionTreeContainer from '../components/DecisionTreeContainer';

export default function DecisionFocusPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [decision, setDecision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reasoning'); // 'reasoning' or 'relationships'
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
            console.log('Loaded decision in FocusPage:', decision);
            setDecision(decision);
        } catch (err) {
            console.error('Error loading decision:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRelationshipAdded = () => {
        // Refresh decision data to show new relationship
        setRefreshKey(prev => prev + 1);
        loadDecision();
    };

    if (loading) {
        return (
            <div className="p-6">
                <LoadingSkeleton />
            </div>
        );
    }

    if (!decision) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Decision not found</h2>
                    <Link to="/decisions" className="text-blue-600 hover:text-blue-700">
                        Return to Decision Library
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3 mb-3">
                        <button
                            onClick={() => navigate('/decisions')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Link to="/decisions" className="hover:text-gray-700">Decision Library</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Focus Mode</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">{decision.title}</h1>
                                {decision.decision_type === 'SUB_DECISION' && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        Sub-Decision
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Confidence: {decision.current_confidence || decision.confidence}%</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddSubDecision(true)}
                                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm hover:shadow flex items-center gap-2"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                Add Sub-Decision
                            </button>
                            <button
                                onClick={() => setShowAddRelationship(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Relationship
                            </button>
                            <Link
                                to={`/decisions/${id}`}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View Details →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('reasoning')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reasoning'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Reasoning Tree
                        </button>
                        <button
                            onClick={() => setActiveTab('relationships')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'relationships'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Relationships
                        </button>
                    </div>
                </div>
            </div>

            {/* Content - Split Panel Layout */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Left Panel - Reasoning Tree (60%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 ${activeTab === 'reasoning' ? 'block' : 'hidden lg:block'
                            }`}
                    >
                        <ReasoningTreePanel decisionId={id} />
                    </motion.div>

                    {/* Right Panel - Relationship Spider (40%) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 ${activeTab === 'relationships' ? 'block' : 'hidden lg:block'
                            }`}
                    >
                        <RelationshipSpiderPanel
                            decisionId={id}
                            currentDecisionTitle={decision.title}
                        />
                    </motion.div>
                </div>

                {/* Visual Tree Section (Full Width) */}
                <div className="mt-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                                </svg>
                                Decision Tree Mapping
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase font-bold rounded">Visual Network</span>
                            </div>
                        </div>
                        <div className="h-[500px]">
                            <DecisionTreeContainer decisionId={id} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Relationship Modal */}
            <AddRelationshipModal
                isOpen={showAddRelationship}
                onClose={() => setShowAddRelationship(false)}
                currentDecisionId={id}
                currentDecisionTitle={decision.title}
                onRelationshipAdded={handleRelationshipAdded}
            />
            {/* Add Sub-Decision Wizard */}
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

