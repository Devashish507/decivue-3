import React, { useState } from 'react';
import { governanceService } from '../services/api';
import Modal from './Modal';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const GovernanceActionPanel = ({ decision, onUpdate }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null); // 'APPROVE' or 'REJECT'
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    // Only show if status is Pending Approval
    if (decision.governanceStatus !== 'Pending Approval') return null;

    // In a real app, we would check if currentUser is the reviewer.
    // For now, we simulate this or just allow it (since we mocked auth)

    const handleActionClick = (type) => {
        setActionType(type);
        setJustification('');
        setModalOpen(true);
    };

    const submitAction = async () => {
        setLoading(true);
        try {
            // Mock user context - Impersonate the assigned reviewer for demo purposes
            const userContext = {
                userId: decision.reviewerId || 'u-reviewer-1', // Use actual reviewer if available
                userName: 'Reviewer (You)',
                justification
            };

            if (actionType === 'APPROVE') {
                await governanceService.approve(decision.id, userContext);
            } else {
                await governanceService.reject(decision.id, userContext);
            }

            setModalOpen(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Governance action failed:', error);
            alert('Failed to process action: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                    <h3 className="text-sm font-semibold text-amber-900">Review Required</h3>
                    <p className="text-sm text-amber-700 mt-1 mb-4">
                        This decision is pending approval. As a reviewer, please evaluate the changes.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleActionClick('APPROVE')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleActionClick('REJECT')}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={actionType === 'APPROVE' ? 'Approve Decision' : 'Reject Decision'}
            >
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Please provide a reason for your {actionType === 'APPROVE' ? 'approval' : 'rejection'}.
                        This will be logged in the audit trail.
                    </p>
                    <textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        rows={4}
                        placeholder="Enter justification..."
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitAction}
                            disabled={!justification.trim() || loading}
                            className={`px-4 py-2 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${actionType === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {loading ? 'Processing...' : `Confirm ${actionType === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GovernanceActionPanel;
