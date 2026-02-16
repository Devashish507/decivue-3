import React, { useState } from 'react';
import useWizardStore from '../../stores/wizardStore';

export default function WizardStep4Reasoning() {
    const {
        reasoning,
        updateReasoning,
        addOption,
        removeOption,
        addAssumption,
        removeAssumption
    } = useWizardStore();

    const [newOption, setNewOption] = useState('');
    const [newAssumption, setNewAssumption] = useState('');

    const handleAddOption = () => {
        if (newOption.trim()) {
            addOption({ title: newOption, description: '' });
            setNewOption('');
        }
    };

    const handleAddAssumption = () => {
        if (newAssumption.trim()) {
            addAssumption({ text: newAssumption });
            setNewAssumption('');
        }
    };

    return (
        <div className="space-y-8">
            {/* Goal Definition */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Definition
                </label>
                <p className="text-xs text-gray-500 mb-2">What exactly does this decision aim to achieve?</p>
                <textarea
                    value={reasoning.goalDefinition}
                    onChange={(e) => updateReasoning({ goalDefinition: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Choose a vendor that balances cost with reliability..."
                />
            </div>

            {/* Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Considered Options
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                        placeholder="Add an option (e.g. In-house development)"
                    />
                    <button
                        onClick={handleAddOption}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
                <ul className="space-y-2">
                    {reasoning.options.map((opt, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                            <span className="text-sm text-gray-800">{opt.title}</span>
                            <button onClick={() => removeOption(idx)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                    {reasoning.options.length === 0 && (
                        <li className="text-sm text-gray-400 italic text-center py-2">No options added yet</li>
                    )}
                </ul>
            </div>

            {/* Assumptions */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Assumptions
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newAssumption}
                        onChange={(e) => setNewAssumption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                        placeholder="Add an assumption (e.g. Budget will be approved)"
                    />
                    <button
                        onClick={handleAddAssumption}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add
                    </button>
                </div>
                <ul className="space-y-2">
                    {reasoning.assumptions.map((assump, idx) => (
                        <li key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                            <span className="text-sm text-gray-800">{typeof assump === 'string' ? assump : assump.text}</span>
                            <button onClick={() => removeAssumption(idx)} className="text-gray-400 hover:text-red-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                    ))}
                    {reasoning.assumptions.length === 0 && (
                        <li className="text-sm text-gray-400 italic text-center py-2">No assumptions added yet</li>
                    )}
                </ul>
            </div>

            {/* Review */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence Justification
                </label>
                <textarea
                    value={reasoning.confidenceJustification}
                    onChange={(e) => updateReasoning({ confidenceJustification: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Why this level of confidence?"
                />
            </div>
        </div>
    );
}
