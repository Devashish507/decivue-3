import React, { useState } from 'react';

export default function AddSubDecisionForm({ parentId, onCancel, onSuccess }) {
    const [title, setTitle] = useState('');
    const [context, setContext] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // We can add weight/impact fields later if needed, keeping it simple for now

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Dynamically import service to avoid circular dependencies if any
            const { decisionService } = await import('../services/api');

            await decisionService.createSubDecision(parentId, {
                title: title.trim(),
                context: context.trim(),
                weight: 1, // Default weight
                status: 'Pending'
            });

            onSuccess();
        } catch (err) {
            console.error('Failed to create sub-decision:', err);
            setError(err.message || 'Failed to create sub-decision');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub-Decision Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Select Database Vendor"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context / Description
                </label>
                <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Briefly explain why this sub-decision is needed..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={!title.trim() || loading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Creating...' : 'Create Sub-Decision'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
