import React from 'react';
import useWizardStore from '../../stores/wizardStore';
import { motion } from 'framer-motion';

export default function WizardStep2Type() {
    const { type, updateType, context } = useWizardStore();

    const handleTypeSelect = (decisionType) => {
        updateType({ decisionType });
    };

    const types = [
        {
            id: 'MAIN_STRATEGIC',
            title: 'Main Strategic Decision',
            description: 'A primary decision that sets direction for other choices.',
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            color: 'blue'
        },
        {
            id: 'SUPPORTING',
            title: 'Supporting Decision',
            description: 'Enables or enhances a main strategic decision.',
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'green'
        },
        {
            id: 'DEPENDENT',
            title: 'Dependent Decision',
            description: 'Relies on the outcome of another decision.',
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
            ),
            color: 'purple'
        },
        {
            id: 'RISK_MITIGATION',
            title: 'Risk Mitigation',
            description: 'Specifically addresses identified risks.',
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'red'
        },
        {
            id: 'SUB_DECISION',
            title: 'Sub-Decision',
            description: 'An independent decision linked directly to a parent context.',
            icon: (className) => (
                <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            color: 'orange'
        }
    ];

    // Filter types if creating a sub-decision from context
    const visibleTypes = context?.parentDecisionId
        ? types.filter(t => t.id === 'SUB_DECISION' || t.id === 'DEPENDENT' || t.id === 'SUPPORTING')
        : types.filter(t => t.id !== 'SUB_DECISION');

    // Auto-select SUB_DECISION if coming from context and nothing selected yet
    React.useEffect(() => {
        if (context?.parentDecisionId && type.decisionType === 'MAIN_STRATEGIC') {
            updateType({ decisionType: 'SUB_DECISION' });
        }
    }, [context]);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Select Decision Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleTypes.map((t) => {
                    const isSelected = type.decisionType === t.id;
                    const Icon = t.icon;

                    return (
                        <motion.div
                            key={t.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleTypeSelect(t.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                    ? `border-${t.color}-500 bg-${t.color}-50`
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${isSelected ? `bg-${t.color}-100 text-${t.color}-600` : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {Icon('w-6 h-6')}
                                </div>
                                <div>
                                    <h4 className={`font-medium ${isSelected ? `text-${t.color}-900` : 'text-gray-900'}`}>
                                        {t.title}
                                    </h4>
                                    <p className={`text-sm mt-1 ${isSelected ? `text-${t.color}-700` : 'text-gray-500'}`}>
                                        {t.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {context?.parentDecisionId && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                        Listing limited to types relevant for sub-decisions of <strong>"{context.parentTitle}"</strong>.
                    </p>
                </div>
            )}
        </div>
    );
}
