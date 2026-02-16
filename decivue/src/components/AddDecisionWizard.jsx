import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useWizardStore from '../stores/wizardStore';
import WizardStep1Basics from './wizard/WizardStep1Basics';
import WizardStep2Analysis from './wizard/WizardStep2Analysis';
import WizardStep3Relationships from './wizard/WizardStep3Relationships';
import WizardStep4Reasoning from './wizard/WizardStep4Reasoning';
import { decisionService } from '../services/api';

export default function AddDecisionWizard({ onClose, initialContext }) {
    const navigate = useNavigate();
    const {
        currentStep,
        nextStep,
        previousStep,
        getWizardData,
        resetWizard,
        setIsSubmitting,
        isSubmitting,
        updateWizardData
    } = useWizardStore();

    // Initialize context if provided
    React.useEffect(() => {
        if (initialContext) {
            updateWizardData('context', initialContext);
            // If it's a sub-decision, we might want to auto-set the relationship type or other fields
            if (initialContext.parentTitle) {
                // Optional: Set a default title or description based on parent
                // updateWizardData('basics', { ... });
            }
        }
    }, [initialContext]);

    const steps = [
        { title: 'The Basics', component: WizardStep1Basics },
        { title: 'Analysis', component: WizardStep2Analysis },
        { title: 'Connections', component: WizardStep3Relationships },
        { title: 'Reasoning', component: WizardStep4Reasoning }
    ];

    const CurrentStepComponent = steps[currentStep].component;

    const handleNext = () => {
        // Validate current step before proceeding
        if (validateCurrentStep()) {
            nextStep();
        }
    };

    const handleBack = () => {
        previousStep();
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const wizardData = getWizardData();

            console.log('Submitting wizard data:', wizardData);

            // Create decision through wizard endpoint
            const response = await decisionService.createFromWizard(wizardData);

            console.log('Decision created:', response);

            // Reset wizard
            resetWizard();

            // Close modal
            if (onClose) onClose();

            // Navigate to focus mode of new decision
            navigate(`/decisions/${response.id}/focus`);

        } catch (error) {
            console.error('Error creating decision:', error);
            let errorMessage = 'Failed to create decision';

            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || errorMessage;
                if (error.response.data.errors) {
                    const details = error.response.data.errors.map(e => e.message).join(', ');
                    errorMessage += `: ${details}`;
                }
            } else if (error.message) {
                errorMessage += `: ${error.message}`;
            }

            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateCurrentStep = () => {
        const { basics, setErrors } = useWizardStore.getState();
        let isValid = true;
        const newErrors = {};

        if (currentStep === 0) {
            if (!basics.title || !basics.title.trim()) {
                newErrors.title = 'Title is required';
                isValid = false;
            }
            if (!basics.description || !basics.description.trim()) {
                newErrors.description = 'Description is required';
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const isLastStep = currentStep === steps.length - 1;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Decision</h2>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to cancel? Your progress will be saved.')) {
                                    onClose();
                                }
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center gap-2">
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                <div className="flex items-center gap-2">
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${index < currentStep ? 'bg-green-500 text-white' :
                                        index === currentStep ? 'bg-blue-600 text-white' :
                                            'bg-gray-200 text-gray-500'
                                        }`}>
                                        {index < currentStep ? (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <span className={`text-sm font-medium hidden md:inline ${index === currentStep ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-0.5 w-12 transition-colors ${index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CurrentStepComponent />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all ${currentStep === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                resetWizard();
                                onClose();
                            }}
                            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        >
                            Cancel
                        </button>

                        {isLastStep ? (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Create Decision
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
