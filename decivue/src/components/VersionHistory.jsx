import React, { useEffect, useState, useMemo } from 'react';
import { decisionService } from '../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { calculateDrift } from '../utils/driftCalculator';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VersionHistory({ decisionId, currentDecision, onCompare }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDriftDetails, setShowDriftDetails] = useState(false);

    useEffect(() => {
        loadVersions();
    }, [decisionId, currentDecision]); // Added currentDecision dependency

    const loadVersions = async () => {
        try {
            setLoading(true);
            const versionsData = await decisionService.getVersions(decisionId);
            console.log('API Response Versions (JSON):', JSON.stringify(versionsData, null, 2));
            // Sort versions descending (newest first)
            setVersions(versionsData.sort((a, b) => b.version_number - a.version_number));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const driftData = useMemo(() => {
        if (!versions.length || !currentDecision) return null;

        // Find the oldest VALID version (one with a parseable snapshot)
        // Versions are currently sorted DESC (newest first), so we need to reverse to check oldest first
        const sortedVersions = [...versions].sort((a, b) => a.version_number - b.version_number);

        let original = sortedVersions[0]; // Default to oldest

        // Try to find the first version with valid snapshot data
        for (const v of sortedVersions) {
            try {
                const snapshot = typeof v.snapshot_json === 'string' ? JSON.parse(v.snapshot_json) : v.snapshot_json;
                if (snapshot && (snapshot.title || snapshot.statement)) {
                    original = v;
                    break;
                }
            } catch (e) {
                // Continue to next version if this one is broken
            }
        }

        return calculateDrift(currentDecision, original);
    }, [versions, currentDecision]);

    if (loading) return <div className="p-4 text-center text-gray-500">Loading version history...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    if (versions.length === 0) return <div className="p-4 text-center text-gray-400">No edit history available for this decision.</div>;

    const getDriftColor = (status) => {
        switch (status) {
            case 'SIGNIFICANTLY DRIFTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'SLIGHTLY DRIFTED': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const getDriftIcon = (status) => {
        if (status === 'ON TRACK') return <CheckCircle className="w-5 h-5" />;
        return <AlertTriangle className="w-5 h-5" />;
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Version History</h3>
                <button onClick={loadVersions} className="text-xs text-blue-600 hover:text-blue-800 underline">Refresh History</button>
            </div>

            {/* Drift Indicator */}
            {driftData && (
                <div className={`rounded-xl border p-4 mb-6 transition-colors ${getDriftColor(driftData.status).replace('text-', 'border-').replace('bg-', 'bg-opacity-50 ')} bg-opacity-10`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getDriftColor(driftData.status)}`}>
                                {getDriftIcon(driftData.status)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    {driftData.status}
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getDriftColor(driftData.status)}`}>
                                        Drift Score: {driftData.score}
                                    </span>
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Compared to original version
                                </p>
                            </div>
                        </div>
                        {driftData.details.length >= 0 && (
                            <button
                                onClick={() => setShowDriftDetails(!showDriftDetails)}
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                            >
                                {showDriftDetails ? 'Hide Details' : 'View Details'}
                                {showDriftDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                    </div>

                    {showDriftDetails && driftData.details.length >= 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 pt-4 border-t border-gray-200/50 overflow-hidden"
                        >
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Drift Factors</h5>
                            {driftData.details.length > 0 ? (
                                <ul className="space-y-2 mb-4">
                                    {driftData.details.map((detail, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">No significant drift detected.</p>
                            )}

                            {/* Detailed Debug Info */}
                            <div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-600 border border-gray-200 overflow-x-auto">
                                {(() => {
                                    const safeGetSnapshot = (v) => {
                                        if (!v || !v.snapshot_json) return {};
                                        try {
                                            return typeof v.snapshot_json === 'string' ? JSON.parse(v.snapshot_json) : v.snapshot_json;
                                        } catch (e) {
                                            return { title: 'Error parsing snapshot' };
                                        }
                                    };

                                    // Use the same logic as driftData to find the baseline
                                    const sortedVersions = [...versions].sort((a, b) => a.version_number - b.version_number);
                                    let original = sortedVersions[0];
                                    for (const v of sortedVersions) {
                                        try {
                                            const s = typeof v.snapshot_json === 'string' ? JSON.parse(v.snapshot_json) : v.snapshot_json;
                                            if (s && (s.title || s.statement)) {
                                                original = v;
                                                break;
                                            }
                                        } catch (e) { }
                                    }

                                    const originalSnapshot = safeGetSnapshot(original);
                                    const versionNum = original ? original.version_number : 'N/A';

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="border-r border-gray-200 pr-2">
                                                    <p className="font-semibold text-blue-600">Current (Live)</p>
                                                    <p>Title: "{currentDecision.statement || currentDecision.title}"</p>
                                                    <p>Prior: {currentDecision.priorityLevel || currentDecision.priority_level}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-purple-600">Original (v{versionNum})</p>
                                                    <p>Title: "{originalSnapshot.title || 'N/A'}"</p>
                                                    <p>Prior: {originalSnapshot.priority_level || originalSnapshot.priorityLevel || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="mb-1"><strong>Raw Original Snapshot (v{versionNum}):</strong></p>
                                                <pre className="bg-gray-100 p-1 rounded text-[10px] break-all whitespace-pre-wrap">
                                                    {JSON.stringify(originalSnapshot, null, 2).substring(0, 300) + '...'}
                                                </pre>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8">
                {/* Current State Indicator */}
                <div className="mb-8 ml-6">
                    <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-green-500 ring-4 ring-white"></span>
                    <h4 className="flex items-center text-md font-bold text-gray-900">
                        Current Version
                        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Latest</span>
                    </h4>
                    <p className="text-sm text-gray-500">Now</p>
                </div>

                {versions.map((version) => {
                    const confidenceDrop = (version.confidence_before || 0) - (version.confidence_after || 0);
                    const isConfidenceDrop = confidenceDrop > 0;

                    return (
                        <div key={version.id} className="relative ml-6 pb-2">
                            <span className="absolute -left-[2.4rem] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white"></span>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-md font-medium text-gray-900">Version {version.version_number}</h4>
                                    <p className="text-sm text-gray-500">{formatDistanceToNow(parseISO(version.created_at))} ago • By {version.created_by || 'Unknown'}</p>
                                </div>
                                <button
                                    onClick={() => onCompare(version)}
                                    className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                >
                                    Compare
                                </button>
                            </div>

                            {/* Changes Summary (Placeholder until detailed logic) */}
                            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                <ul className="list-disc list-inside space-y-1">
                                    {version.confidence_before !== version.confidence_after && (
                                        <li className={isConfidenceDrop ? 'text-red-600 font-medium' : 'text-gray-700'}>
                                            Confidence changed: {version.confidence_before}% → {version.confidence_after}%
                                            {isConfidenceDrop && <span className="ml-2">↓ {confidenceDrop}% (Drop)</span>}
                                        </li>
                                    )}
                                    {/* More diff details would go here based on changed_fields_json */}
                                    <li>Snapshot created before update</li>
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
