import React, { useState } from 'react';
import Modal from './Modal';

const GovernanceGuard = ({ decision, onAction, children }) => {
    const [justificationModal, setJustificationModal] = useState(false);
    const [justification, setJustification] = useState('');

    const isLocked = decision.is_governance_required &&
        ['Approved', 'Pending Approval'].includes(decision.governance_status);

    const handleClick = (e) => {
        if (isLocked) {
            e.preventDefault();
            e.stopPropagation();
            setJustificationModal(true);
        } else {
            if (onAction) onAction();
        }
    };

    const handleConfirm = () => {
        if (onAction) onAction(justification);
        setJustificationModal(false);
        setJustification('');
    };

    return (
        <>
            <div onClickCapture={handleClick} className={isLocked ? 'cursor-not-allowed opacity-80' : ''}>
                {children}
            </div>

            <Modal
                isOpen={justificationModal}
                onClose={() => setJustificationModal(false)}
                title="Governance Check Required"
            >
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-sm text-amber-800">
                        <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p>
                            This decision is under governance ({decision.governance_status}).
                            {decision.governance_status === 'Approved'
                                ? ' Any changes will require re-approval.'
                                : ' You must provide a justification for this change logging.'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Justification for Change
                        </label>
                        <textarea
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            rows={3}
                            placeholder="Explain why this change is necessary..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={() => setJustificationModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!justification.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit & Proceed
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default GovernanceGuard;
