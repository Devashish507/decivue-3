import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle } from 'lucide-react';

const AssignRoleModal = ({ isOpen, onClose, decisionId, currentRoles = {}, onRoleUpdate }) => {
    const [ownerId, setOwnerId] = useState(currentRoles.ownerId || '');
    const [reviewerId, setReviewerId] = useState(currentRoles.reviewerId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset state when opening
    React.useEffect(() => {
        if (isOpen) {
            setOwnerId(currentRoles.ownerId || '');
            setReviewerId(currentRoles.reviewerId || '');
            setError(null);
        }
    }, [isOpen, currentRoles]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Update locally — no backend call
            const updatedData = {
                owner_id: ownerId || null,
                reviewer_id: reviewerId || null
            };
            onRoleUpdate(updatedData);
            onClose();
        } catch (err) {
            console.error('Failed to update roles:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Assign Team Roles
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Decision Owner (ID)
                                </label>
                                <input
                                    type="text"
                                    value={ownerId}
                                    onChange={(e) => setOwnerId(e.target.value)}
                                    placeholder="Enter User ID (e.g., user_123)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Responsible for driving this decision.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reviewer (ID)
                                </label>
                                <input
                                    type="text"
                                    value={reviewerId}
                                    onChange={(e) => setReviewerId(e.target.value)}
                                    placeholder="Enter User ID (e.g., reviewer_456)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Responsible for reviewing and approving.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3 border-t border-gray-50 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow transition-all font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {isLoading ? 'Saving...' : 'Save Roles'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AssignRoleModal;
