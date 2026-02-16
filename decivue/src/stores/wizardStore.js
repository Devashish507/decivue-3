import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Wizard State Store
 * Manages state for the multi-step decision creation wizard
 */
const useWizardStore = create(
    persist(
        (set, get) => ({
            // Current step (0-3)
            currentStep: 0,

            // Form data for each step
            basics: {
                title: '',
                description: '',
                category: '',
                priorityLevel: 'MEDIUM',
                impactLevel: 'Medium',
                initialConfidence: 50,
                targetReviewDate: null,
                riskLevel: 'Medium'
            },

            type: {
                decisionType: 'MAIN_STRATEGIC'
            },

            relationships: [],

            reasoning: {
                goalDefinition: '',
                options: [],
                assumptions: [],
                risks: [],
                confidenceJustification: ''
            },

            // Validation errors
            errors: {},

            // Conflict warnings from backend
            conflictWarnings: [],

            // Loading states
            isValidating: false,
            isSubmitting: false,

            // Context (e.g. parent decision)
            context: {},

            // Actions
            setCurrentStep: (step) => set({ currentStep: step }),

            nextStep: () => set((state) => ({
                currentStep: Math.min(state.currentStep + 1, 3)
            })),

            previousStep: () => set((state) => ({
                currentStep: Math.max(state.currentStep - 1, 0)
            })),

            updateWizardData: (section, data) => set((state) => ({
                [section]: { ...state[section], ...data }
            })),

            updateBasics: (data) => set((state) => ({
                basics: { ...state.basics, ...data }
            })),

            updateType: (data) => set((state) => ({
                type: { ...state.type, ...data }
            })),

            addRelationship: (relationship) => set((state) => ({
                relationships: [...state.relationships, relationship]
            })),

            removeRelationship: (index) => set((state) => ({
                relationships: state.relationships.filter((_, i) => i !== index)
            })),

            updateRelationships: (relationships) => set({ relationships }),

            updateReasoning: (data) => set((state) => ({
                reasoning: { ...state.reasoning, ...data }
            })),

            addOption: (option) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    options: [...state.reasoning.options, option]
                }
            })),

            removeOption: (index) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    options: state.reasoning.options.filter((_, i) => i !== index)
                }
            })),

            updateOption: (index, data) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    options: state.reasoning.options.map((opt, i) =>
                        i === index ? { ...opt, ...data } : opt
                    )
                }
            })),

            addAssumption: (assumption) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    assumptions: [...state.reasoning.assumptions, assumption]
                }
            })),

            removeAssumption: (index) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    assumptions: state.reasoning.assumptions.filter((_, i) => i !== index)
                }
            })),

            addRisk: (risk) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    risks: [...state.reasoning.risks, risk]
                }
            })),

            removeRisk: (index) => set((state) => ({
                reasoning: {
                    ...state.reasoning,
                    risks: state.reasoning.risks.filter((_, i) => i !== index)
                }
            })),

            setErrors: (errors) => set({ errors }),

            setConflictWarnings: (warnings) => set({ conflictWarnings: warnings }),

            setIsValidating: (isValidating) => set({ isValidating }),

            setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

            // Get complete wizard data
            getWizardData: () => {
                const state = get();
                // Sync parentId from basics to context if present (for backend compatibility)
                const context = { ...state.context };
                if (state.basics.parentDecisionId) {
                    context.parentDecisionId = state.basics.parentDecisionId;
                    context.relationshipType = 'DERIVED_FROM'; // Default relationship
                }

                return {
                    basics: state.basics,
                    type: state.type,
                    relationships: state.relationships,
                    reasoning: state.reasoning,
                    context: context
                };
            },

            // Reset wizard
            resetWizard: () => set({
                currentStep: 0,
                basics: {
                    title: '',
                    description: '',
                    category: '',
                    priorityLevel: 'MEDIUM',
                    impactLevel: 'Medium',
                    initialConfidence: 50,
                    targetReviewDate: null,
                    riskLevel: 'Medium'
                },
                type: {
                    decisionType: 'MAIN_STRATEGIC'
                },
                relationships: [],
                reasoning: {
                    goalDefinition: '',
                    options: [],
                    assumptions: [],
                    risks: [],
                    confidenceJustification: ''
                },
                context: {},
                errors: {},
                conflictWarnings: [],
                isValidating: false,
                isSubmitting: false
            })
        }),
        {
            name: 'decision-wizard-storage',
            partialize: (state) => ({
                basics: state.basics,
                type: state.type,
                relationships: state.relationships,
                reasoning: state.reasoning,
                currentStep: state.currentStep
            })
        }
    )
);

export default useWizardStore;
