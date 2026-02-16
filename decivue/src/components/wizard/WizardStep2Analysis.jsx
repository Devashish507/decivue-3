import React from 'react';
import useWizardStore from '../../stores/wizardStore';
import { motion } from 'framer-motion';

export default function WizardStep2Analysis() {
    const { type, basics, updateType, updateBasics, context } = useWizardStore();

    const handleTypeSelect = (decisionType) => {
        updateType({ decisionType });
    };

    const handleChange = (field, value) => {
        updateBasics({ [field]: value });
    };

    const types = [
        {
            id: 'MAIN_STRATEGIC',
            title: 'Main Strategic',
            description: 'Sets overall direction.',
            icon: '🎯',
            color: 'blue'
        },
        {
            id: 'SUPPORTING',
            title: 'Supporting',
            description: 'Enables a main decision.',
            icon: '🤝',
            color: 'green'
        },
        {
            id: 'DEPENDENT',
            title: 'Dependent',
            description: 'Relies on another outcome.',
            icon: '🔗',
            color: 'purple'
        },
        {
            id: 'RISK_MITIGATION',
            title: 'Mitigation',
            description: 'Addresses specific risks.',
            icon: '🛡️',
            color: 'red'
        },
        {
            id: 'SUB_DECISION',
            title: 'Sub-Decision',
            description: 'A component of a larger choice.',
            icon: '📦',
            color: 'orange'
        }
    ];

    const visibleTypes = context?.parentDecisionId
        ? types.filter(t => t.id === 'SUB_DECISION' || t.id === 'DEPENDENT' || t.id === 'SUPPORTING')
        : types.filter(t => t.id !== 'SUB_DECISION');

    return (
        <div className="space-y-8">
            {/* Type Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Decision Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {visibleTypes.map((t) => {
                        const isSelected = type.decisionType === t.id;
                        return (
                            <motion.div
                                key={t.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTypeSelect(t.id)}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${isSelected
                                    ? `border-${t.color}-500 bg-${t.color}-50 text-${t.color}-900`
                                    : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'
                                    }`}
                            >
                                <span className="text-2xl">{t.icon}</span>
                                <span className="text-xs font-bold whitespace-nowrap">{t.title}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Confidence */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-sm font-medium text-gray-700 uppercase tracking-wider">Confidence</label>
                            <span className={`text-lg font-bold ${basics.initialConfidence >= 70 ? 'text-green-600' :
                                basics.initialConfidence >= 40 ? 'text-amber-600' : 'text-red-600'
                                }`}>{Number(basics.initialConfidence).toFixed(2)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="0.01"
                            value={basics.initialConfidence}
                            onChange={(e) => handleChange('initialConfidence', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase">
                            <span>Uncertain</span>
                            <span>Very Sure</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Impact</label>
                            <select
                                value={basics.impactLevel}
                                onChange={(e) => handleChange('impactLevel', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Risk</label>
                            <select
                                value={basics.riskLevel}
                                onChange={(e) => handleChange('riskLevel', e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Date and Priority */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-2 text-center md:text-left">Target Review Date</label>
                        <input
                            type="date"
                            value={basics.targetReviewDate || ''}
                            onChange={(e) => handleChange('targetReviewDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center shadow-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-2 text-center italic">When should this decision be re-evaluated for validity?</p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Priority Level</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => handleChange('priorityLevel', p)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${basics.priorityLevel === p
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
