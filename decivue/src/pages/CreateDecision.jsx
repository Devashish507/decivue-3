import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDecisions } from '../hooks/useDecisions'
import Tooltip from '../components/Tooltip'

const steps = [
  { id: 1, title: 'Decision Statement', description: 'What was decided?' },
  { id: 2, title: 'Context & Assumptions', description: 'Why and what are we assuming?' },
  { id: 3, title: 'Confidence & Risk', description: 'How confident are we?' },
  { id: 4, title: 'Review Settings', description: 'When should we check back?' },
]

export default function CreateDecision() {
  const navigate = useNavigate()
  const { decisions, addDecision } = useDecisions()
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    statement: '',
    context: '',
    assumptions: [''],
    confidence: 70,
    impactLevel: 'medium',
    riskLevel: 'low',
    relatedDecisions: [],
    reviewDate: '',
  })

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const addAssumption = () => {
    setForm(prev => ({ ...prev, assumptions: [...prev.assumptions, ''] }))
  }

  const updateAssumption = (index, value) => {
    setForm(prev => ({
      ...prev,
      assumptions: prev.assumptions.map((a, i) => i === index ? value : a),
    }))
  }

  const removeAssumption = (index) => {
    setForm(prev => ({
      ...prev,
      assumptions: prev.assumptions.filter((_, i) => i !== index),
    }))
  }

  const validateStep = () => {
    const newErrors = {}
    if (currentStep === 1) {
      if (!form.statement.trim()) newErrors.statement = 'Please describe what was decided'
    }
    if (currentStep === 2) {
      if (!form.context.trim()) newErrors.context = 'Please explain why this decision was made'
    }
    if (currentStep === 4) {
      if (!form.reviewDate) newErrors.reviewDate = 'Please set a review date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 4))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (!validateStep()) return
    const cleanAssumptions = form.assumptions.filter(a => a.trim())
    addDecision({
      ...form,
      assumptions: cleanAssumptions.length > 0 ? cleanAssumptions : ['No assumptions recorded'],
    })
    navigate('/decisions')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Record a New Decision</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Walk through each step to capture all the important details about this decision.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                  {currentStep > step.id ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.id}
                </div>
                <span className="text-xs text-gray-500 mt-1 hidden sm:block text-center">{step.title}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{steps[currentStep - 1].title}</h2>
        <p className="text-sm text-gray-500 mb-6">{steps[currentStep - 1].description}</p>

        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">What was decided?</label>
                <Tooltip content="Write the decision in plain, clear language. For example: 'We decided to switch to a new CRM tool.'">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="text"
                value={form.statement}
                onChange={e => updateField('statement', e.target.value)}
                placeholder="Describe the decision in one sentence..."
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.statement ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.statement && <p className="text-xs text-red-500 mt-1">{errors.statement}</p>}
              <p className="text-xs text-gray-400 mt-1">Tip: Be specific. A clear statement makes it easier to review later.</p>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">Why was this decided?</label>
                <Tooltip content="Explain the reasoning. This helps future you (and your team) understand the 'why' behind it.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <textarea
                value={form.context}
                onChange={e => updateField('context', e.target.value)}
                placeholder="Explain the context and reasoning..."
                rows={4}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.context ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.context && <p className="text-xs text-red-500 mt-1">{errors.context}</p>}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">What are we assuming?</label>
                <Tooltip content="List the things that need to be true for this decision to work. If these change, the decision may need review.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              {form.assumptions.map((a, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={a}
                    onChange={e => updateAssumption(i, e.target.value)}
                    placeholder={`Assumption ${i + 1}...`}
                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {form.assumptions.length > 1 && (
                    <button
                      onClick={() => removeAssumption(i)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAssumption}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                + Add another assumption
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm font-medium text-gray-700">How confident are you?</label>
                <Tooltip content="Slide to show how sure you are about this decision right now. It's okay to start low — you can update it later.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.confidence}
                  onChange={e => updateField('confidence', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className={`text-2xl font-bold min-w-[4rem] text-right ${form.confidence >= 70 ? 'text-green-600' : form.confidence >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>{form.confidence}%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Not confident</span>
                <span>Very confident</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Impact Level</label>
                  <Tooltip content="How much does this decision affect the team or organization?">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </div>
                <select
                  value={form.impactLevel}
                  onChange={e => updateField('impactLevel', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">Low — Minor change</option>
                  <option value="medium">Medium — Noticeable effect</option>
                  <option value="high">High — Major change</option>
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Risk Level</label>
                  <Tooltip content="What's the chance this decision could cause problems if it's wrong?">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </div>
                <select
                  value={form.riskLevel}
                  onChange={e => updateField('riskLevel', e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="low">Low — Unlikely to cause issues</option>
                  <option value="medium">Medium — Some risk involved</option>
                  <option value="high">High — Significant risk</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">When should this be reviewed?</label>
                <Tooltip content="Pick a date when someone should check if this decision is still valid.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <input
                type="date"
                value={form.reviewDate}
                onChange={e => updateField('reviewDate', e.target.value)}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reviewDate ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {errors.reviewDate && <p className="text-xs text-red-500 mt-1">{errors.reviewDate}</p>}
              <p className="text-xs text-gray-400 mt-1">We'll remind you when it's time to review.</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-medium text-gray-700">Related decisions (optional)</label>
                <Tooltip content="If this decision is connected to others, select them here. This helps detect potential conflicts.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(decisions || []).map(d => (
                  <label key={d.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.relatedDecisions.includes(d.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          updateField('relatedDecisions', [...form.relatedDecisions, d.id])
                        } else {
                          updateField('relatedDecisions', form.relatedDecisions.filter(id => id !== d.id))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 line-clamp-1">{d.statement}</span>
                  </label>
                ))}
                {(!decisions || decisions.length === 0) && (
                  <p className="text-xs text-gray-400 italic p-2">No other decisions available to link.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
          {currentStep > 1 ? (
            <button
              onClick={prevStep}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Decision
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
