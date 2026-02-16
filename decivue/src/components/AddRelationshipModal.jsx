import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { decisionService } from '../services/api';

const relationshipTypes = [
    { value: 'DEPENDS_ON', label: 'Depends On', color: 'blue', description: 'This decision requires the selected decision' },
    { value: 'SUPPORTS', label: 'Supports', color: 'green', description: 'This decision helps the selected decision' },
    { value: 'CONFLICTS_WITH', label: 'Conflicts With', color: 'red', description: 'This decision contradicts the selected decision' },
    { value: 'DERIVED_FROM', label: 'Derived From', color: 'purple', description: 'This decision came from the selected decision' },
    { value: 'SUB_DECISION', label: 'Sub-decision', color: 'orange', description: 'This is a smaller decision part of the selected decision' },
    { value: 'RELATES_TO', label: 'Relates To', color: 'gray', description: 'General relationship' }
];

export default function AddRelationshipModal({ isOpen, onClose, currentDecisionId, currentDecisionTitle, onRelationshipAdded }) {
    const [allDecisions, setAllDecisions] = useState([]);
    const [existingRelationships, setExistingRelationships] = useState([]);
    const [selectedDecision, setSelectedDecision] = useState(null);
    const [selectedType, setSelectedType] = useState('DEPENDS_ON');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadAllDecisions();
            loadExistingRelationships();
        }
    }, [isOpen, currentDecisionId]);

    const loadAllDecisions = async () => {
        try {
            setIsLoading(true);
            // Use getAll to fetch all decisions
            const response = await decisionService.getAll();

            // Filter out current decision
            const filtered = response.filter(d => d.id !== currentDecisionId);

            setAllDecisions(filtered);
        } catch (error) {
            console.error('[AddRelationship] Error loading decisions:', error);
            alert('Failed to load decisions: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const loadExistingRelationships = async () => {
        try {
            const response = await decisionService.getRelationships(currentDecisionId);
            const relationships = response.data || { outgoing: [], incoming: [] };

            // Get all related decision IDs (both outgoing and incoming)
            const relatedIds = [
                ...relationships.outgoing.map(r => r.decision.id),
                ...relationships.incoming.map(r => r.decision.id)
            ];

            setExistingRelationships(relatedIds);
            console.log(`Found ${relatedIds.length} existing relationships to filter out`);
        } catch (error) {
            console.error('Error loading existing relationships:', error);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDecision) {
            alert('Please select a decision from the dropdown');
            return;
        }

        try {
            setIsSubmitting(true);
            await decisionService.createRelationship(currentDecisionId, {
                targetDecisionId: selectedDecision.id,
                relationType: selectedType,
                notes: notes.trim() || null
            });

            // Notify parent to refresh
            if (onRelationshipAdded) {
                onRelationshipAdded();
            }

            // Reset and close
            resetForm();
            onClose();
        } catch (error) {
            console.error('Error creating relationship:', error);
            alert('Failed to create relationship: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedDecision(null);
        setSelectedType('DEPENDS_ON');
        setNotes('');
        setAllDecisions([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Add Relationship</h2>
                        <button
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        From: <span className="font-medium text-gray-700">{currentDecisionTitle}</span>
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    {/* Select Decision Dropdown */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Decision
                        </label>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <>
                                <select
                                    value={selectedDecision?.id || ''}
                                    onChange={(e) => {
                                        const decision = allDecisions.find(d => d.id === e.target.value);
                                        setSelectedDecision(decision || null);
                                    }}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                                >
                                    <option value="">-- Choose a decision ({allDecisions.length} available) --</option>
                                    {allDecisions
                                        .filter(d => !existingRelationships.includes(d.id))
                                        .map((decision) => {
                                            // Use 'statement' field which is how transformDecision maps 'title'
                                            const displayText = `${decision.statement || decision.title || 'Untitled'}${decision.category ? ` (${decision.category})` : ''}${decision.confidence ? ` - ${decision.confidence}%` : ''}`;
                                            return (
                                                <option key={decision.id} value={decision.id}>
                                                    {displayText}
                                                </option>
                                            );
                                        })}
                                </select>
                                {allDecisions.length > 0 && allDecisions.filter(d => !existingRelationships.includes(d.id)).length === 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        ✓ All {allDecisions.length} decisions are already related to this decision.
                                    </p>
                                )}
                                {allDecisions.length === 0 && (
                                    <p className="text-sm text-amber-600 mt-2">
                                        ⚠️ No other decisions found in the system.
                                    </p>
                                )}
                            </>
                        )}

                        {/* Selected Decision Preview */}
                        {selectedDecision && (
                            <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900 mb-2">{selectedDecision.statement || selectedDecision.title}</div>
                                        <div className="flex items-center gap-3 text-xs">
                                            {selectedDecision.category && (
                                                <span className="px-2 py-1 bg-white border border-blue-300 rounded font-medium text-blue-700">
                                                    {selectedDecision.category}
                                                </span>
                                            )}
                                            <span className="text-gray-600">
                                                Confidence: <span className="font-semibold">{selectedDecision.confidence || selectedDecision.current_confidence}%</span>
                                            </span>
                                            <span className={`px-2 py-1 rounded font-medium ${selectedDecision.lifecycleState === 'Active' ? 'bg-green-100 text-green-700' :
                                                selectedDecision.lifecycleState === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {selectedDecision.lifecycleState || selectedDecision.lifecycle_state}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDecision(null)}
                                        className="text-blue-600 hover:text-blue-800 ml-3"
                                        title="Clear selection"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Relationship Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Relationship Type
                        </label>
                        <div className="space-y-2">
                            {relationshipTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value)}
                                    className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${selectedType === type.value
                                        ? `border-${type.color}-500 bg-${type.color}-50`
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedType === type.value
                                            ? `border-${type.color}-500 bg-${type.color}-500`
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedType === type.value && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{type.label}</div>
                                            <div className="text-xs text-gray-600 mt-0.5">{type.description}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes about this relationship..."
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedDecision || isSubmitting}
                        className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Relationship
                            </>
                        )}
                    </button>
                </div>
            </motion.div >
        </div >
    );
}
