import React, { useEffect, useState } from 'react';
import { decisionService } from '../services/api';

export default function VersionComparison({ decisionId, versionId, currentDecision, onClose }) {
    const [versionData, setVersionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVersionDetails();
    }, [versionId]);

    const loadVersionDetails = async () => {
        try {
            setLoading(true);
            const data = await decisionService.getVersionDetails(decisionId, versionId);
            setVersionData(data.data || data); // Handle potential response wrapping
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading comparison...</div>;
    if (!versionData) return <div className="p-8 text-center text-red-500">Failed to load version data</div>;

    const rawSnapshot = versionData.snapshot_json || {};
    const snapshot = typeof rawSnapshot === 'string' ? JSON.parse(rawSnapshot) : rawSnapshot;

    // Helper to render diff for text fields
    // snapshotField = key in the version snapshot (backend names)
    // currentField = key in the current decision (frontend transformed names)
    const renderFieldDiff = (snapshotField, currentField, label) => {
        const oldVal = snapshot[snapshotField];
        const newVal = currentDecision[currentField];
        // Normalize for comparison (convert to string to handle number vs string)
        const isChanged = String(oldVal ?? '') !== String(newVal ?? '');

        if (!isChanged) return null;

        return (
            <div className="grid grid-cols-2 gap-4 border-b border-gray-200 py-4 last:border-0">
                <div className="col-span-2 font-medium text-gray-700 mb-1">{label}</div>
                {/* Old Value */}
                <div className="bg-red-50 p-3 rounded border border-red-100">
                    <div className="text-xs text-red-500 font-semibold mb-1 uppercase tracking-wide">Version {versionData.version_number}</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{oldVal ?? <span className="text-gray-400 italic">Empty</span>}</div>
                </div>
                {/* New Value */}
                <div className="bg-green-50 p-3 rounded border border-green-100">
                    <div className="text-xs text-green-500 font-semibold mb-1 uppercase tracking-wide">Current</div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{newVal ?? <span className="text-gray-400 italic">Empty</span>}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h3 className="font-semibold text-gray-800">
                    Comparing Version {versionData.version_number} vs Current
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Close Comparison ✕
                </button>
            </div>

            {/* Comparison Body */}
            <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4 mb-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                    <div>Previous (v{versionData.version_number})</div>
                    <div>Current</div>
                </div>

                {renderFieldDiff('title', 'statement', 'Title')}
                {renderFieldDiff('context', 'context', 'Context / Description')}
                {renderFieldDiff('current_confidence', 'confidence', 'Confidence Level (%)')}
                {renderFieldDiff('risk_level', 'riskLevel', 'Risk Level')}
                {renderFieldDiff('impact_level', 'impactLevel', 'Impact Level')}
                {renderFieldDiff('lifecycle_state', 'lifecycleState', 'Lifecycle State')}

                {/* Fallback if no main fields changed */}
                {!renderFieldDiff('title', 'statement', '') && !renderFieldDiff('context', 'context', '') && (
                    <div className="text-center py-8 text-gray-400">
                        No major fields (Title, Context, Confidence) differ between these versions.
                        <br />
                        <span className="text-xs">Check timeline or other metadata.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
