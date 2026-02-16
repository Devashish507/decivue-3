import React, { useState, useEffect } from 'react';
import useWizardStore from '../../stores/wizardStore';
import { decisionService } from '../../services/api';

export default function WizardStep1Basics() {
    const { basics, updateBasics, errors, context } = useWizardStore();
    const [touched, setTouched] = useState({});
    const [parents, setParents] = useState([]);

    useEffect(() => {
        fetchParents();
    }, []);

    const fetchParents = async () => {
        try {
            const res = await decisionService.searchDecisions('');
            setParents(res);
        } catch (e) {
            console.error("Failed to fetch parents", e);
        }
    };

    const handleChange = (field, value) => {
        updateBasics({ [field]: value });
        setTouched({ ...touched, [field]: true });
    };

    const handleParentChange = (e) => {
        const pid = e.target.value;
        const valueToStore = pid === '' ? null : pid;
        handleChange('parentDecisionId', valueToStore);
    };

    return (
        <div className="space-y-8 py-2">
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">What are we deciding?</h3>
                <p className="text-sm text-gray-500 italic">"A clear statement is half the decision made."</p>
            </div>

            <div className="space-y-6">
                {/* Parent Decision Selector */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest">
                        Context (Optional Parent)
                    </label>
                    {context?.parentDecisionId ? (
                        <div className="flex items-center gap-3 py-1">
                            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    {context.parentTitle || 'Parent Decision'}
                                </p>
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                    Linked Sub-Decision
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                value={basics.parentDecisionId || ''}
                                onChange={handleParentChange}
                                className="block w-full bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                            >
                                <option value="">-- Start New Strategic Branch --</option>
                                {parents.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest group-focus-within:text-blue-600 transition-colors">
                        Decision Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={basics.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={`w-full px-0 py-2 border-b-2 text-xl font-medium outline-none transition-all placeholder:text-gray-300 ${errors.title && touched.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-500'
                            }`}
                        placeholder="e.g. Migrate to Microservices"
                    />
                    {errors.title && touched.title && (
                        <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none bg-red-50 py-1 px-2 rounded w-fit">{errors.title}</p>
                    )}
                </div>

                {/* Description */}
                <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-widest group-focus-within:text-blue-600 transition-colors">
                        Background & Context <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={basics.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-2 outline-none transition-all resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-blue-500 focus:bg-white focus:shadow-sm'
                            }`}
                        placeholder="What problem are we solving? Why now? Who does this affect?"
                    />
                    {errors.description && (
                        <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none bg-red-50 py-1 px-2 rounded w-fit">{errors.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
