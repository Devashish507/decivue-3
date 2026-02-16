import React, { useEffect, useState } from 'react';
import { decisionService } from '../services/api';
import { formatDistanceToNow, parseISO } from 'date-fns';

export default function VersionHistory({ decisionId, onCompare }) {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadVersions();
    }, [decisionId]);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const data = await decisionService.getVersions(decisionId);
            setVersions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading version history...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
    if (versions.length === 0) return <div className="p-4 text-center text-gray-400">No edit history available for this decision.</div>;

    return (
        <div className="space-y-6 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Version History</h3>
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
