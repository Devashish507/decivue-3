import React, { useState } from 'react';
import useWizardStore from '../../stores/wizardStore';
import { decisionService } from '../../services/api';

export default function WizardStep3Relationships() {
    const { relationships, addRelationship, removeRelationship, context } = useWizardStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 2) {
            setSearching(true);
            try {
                // In a real app, debounce this
                const results = await decisionService.searchDecisions(query);
                // Filter out already added decisions and parent
                const filtered = results.filter(d =>
                    !relationships.find(r => r.targetDecisionId === d.id) &&
                    d.id !== context?.parentDecisionId
                );
                setSearchResults(filtered);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleAdd = (decision, type) => {
        addRelationship({
            targetDecisionId: decision.id,
            targetTitle: decision.title,
            relationType: type
        });
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Decisions</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Link this decision to others to visualize impact and dependencies.
                </p>

                {/* Parent Decision Display */}
                {context?.parentDecisionId && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Parent Decision</span>
                                <h4 className="font-medium text-gray-900 mt-1">{context.parentTitle || 'Parent Decision'}</h4>
                                <p className="text-sm text-gray-600">Relationship: Derived From</p>
                            </div>
                            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search existing decisions..."
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Results */}
                {searchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-60 overflow-y-auto shadow-sm">
                        {searchResults.map(result => (
                            <div key={result.id} className="p-3 hover:bg-gray-50 border-b last:border-0 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-800">{result.title}</p>
                                    <p className="text-xs text-gray-500">{result.category} • {result.lifecycle_state}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAdd(result, 'DEPENDS_ON')}
                                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                    >
                                        Depends On
                                    </button>
                                    <button
                                        onClick={() => handleAdd(result, 'SUPPORTS')}
                                        className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                    >
                                        Supports
                                    </button>
                                    <button
                                        onClick={() => handleAdd(result, 'CONFLICTS_WITH')}
                                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                    >
                                        Conflicts
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Relationships */}
            {relationships.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Relationships</h4>
                    <div className="space-y-2">
                        {relationships.map((rel, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${rel.relationType === 'CONFLICTS_WITH' ? 'bg-red-100 text-red-800' :
                                        rel.relationType === 'SUPPORTS' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {rel.relationType.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-700">{rel.targetTitle}</span>
                                </div>
                                <button
                                    onClick={() => removeRelationship(index)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
