import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDecisions } from '../hooks/useDecisions'
import HealthBadge from '../components/HealthBadge'
import ConfidenceGauge from '../components/ConfidenceGauge'
import RiskTag from '../components/RiskTag'
import SignalRow from '../components/SignalRow'
import Timeline from '../components/Timeline'
import InsightBox from '../components/InsightBox'
import ConflictCompareCard from '../components/ConflictCompareCard'
import Modal from '../components/Modal'
import Tooltip from '../components/Tooltip'
import DecisionTreeContainer from '../components/DecisionTreeContainer'
import DecisionHealthPanel from '../components/DecisionHealthPanel'
import DecisionChatbot from '../components/DecisionChatbot'
import { decisionService } from '../services/api'
import { getLifecycleLabel, getLifecycleColor, formatDate } from '../utils/helpers'
import AddDecisionWizard from '../components/AddDecisionWizard'
import AttachmentsSection from '../components/AttachmentsSection'
import VersionHistory from '../components/VersionHistory'
import VersionComparison from '../components/VersionComparison'

const lifecycleBadgeColors = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
}

export default function DecisionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { reaffirmDecision, addNote, markReviewed, updateDecision } = useDecisions() // Keep actions from useDecisions

  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // If user somehow lands on /decisions/new, redirect to home library
    if (id === 'new') {
      navigate('/decisions');
      return;
    }

    const fetchDecision = async () => {
      try {
        console.log(`[DecisionDetail] Fetching decision with ID: ${id}`);
        const data = await decisionService.getById(id)
        if (!data) {
          console.error(`[DecisionDetail] Transformation returned null for ID: ${id}`);
          setError(new Error('Decision data could not be loaded. The decision may have incomplete data.'));
        } else {
          console.log(`[DecisionDetail] Successfully loaded decision:`, data);
          setDecision(data)
        }
      } catch (err) {
        console.error(`[DecisionDetail] Error fetching decision ${id}:`, err);
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDecision()
  }, [id, navigate])

  const [activeTab, setActiveTab] = useState('overview')
  const [noteModal, setNoteModal] = useState(false)
  const [assumptionModal, setAssumptionModal] = useState(false)
  const [subDecisionModal, setSubDecisionModal] = useState(false) // New state
  const [reviewDateModal, setReviewDateModal] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [newAssumption, setNewAssumption] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)
  const [toast, setToast] = useState(null)
  const [comparingVersion, setComparingVersion] = useState(null) // State for version comparison
  const [editingAssumption, setEditingAssumption] = useState(null) // { id, text }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>
  if (error || !decision) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load decision</h2>
        <p className="text-gray-500 mb-2">
          {error?.message || 'The decision you are looking for does not exist or has been removed.'}
        </p>
        {error && (
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            Decision ID: {id}
          </p>
        )}
        <Link to="/decisions" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to Decisions
        </Link>
      </div>
    )
  }

  const lifecycleColor = getLifecycleColor(decision.lifecycleState)

  const refreshDecision = async () => {
    try {
      const data = await decisionService.getById(id)
      setDecision(data)
    } catch (err) {
      console.error('Error refreshing decision:', err)
    }
  }

  const handleReaffirm = async () => {
    try {
      await decisionService.reaffirm(id)
      showToast('Decision reaffirmed')
      await refreshDecision()
    } catch (err) {
      showToast('Error: ' + err.message)
    }
    setConfirmAction(null)
  }

  const handleMarkSubDecisionDone = async (subId) => {
    try {
      await decisionService.updateProgress(subId, {
        status: 'Completed',
        completion_percentage: 100
      })
      showToast('Sub-decision marked as completed')
      await refreshDecision()
    } catch (err) {
      showToast('Error: ' + err.message)
    }
  }

  const handleMarkReviewed = async () => {
    try {
      // 1. Submit the review
      await decisionService.reviewDecision(id, noteText, 'Completed');

      // 2. If a date was picked, update the due date separately (since reviewDecision logic might strictly just log the review)
      // Actually, my legacy markReviewed did update due date. 
      // I should allow reviewDecision to handle it or call markReviewed as well?
      // For now, let's just use the legacy call for the date if provided, separate from the review log
      if (reviewDate) {
        await decisionService.markReviewed(id, { reviewDueDate: reviewDate });
      }

      showToast('Review completed successfully');
      await refreshDecision();
      setReviewDateModal(false);
      setReviewDate('');
      setNoteText('');
    } catch (err) {
      showToast('Error: ' + err.message);
    }
    setConfirmAction(null);
  }

  const handleAddNote = async () => {
    if (noteText.trim()) {
      try {
        await decisionService.addNote(id, noteText.trim(), selectedTag)
        showToast('Note added')
        await refreshDecision()
      } catch (err) {
        showToast('Error: ' + err.message)
      }
    }
    setNoteText('')
    setSelectedTag(null)
    setNoteModal(false)
  }

  const handleAddAssumption = async () => {
    if (newAssumption.trim()) {
      try {
        const updatedAssumptions = [...decision.assumptions.map(a => a.text || a), newAssumption.trim()]
        await decisionService.updateAssumptions(id, updatedAssumptions)
        showToast('Assumption added')
        await refreshDecision()
      } catch (err) {
        showToast('Error: ' + err.message)
      }
    }
    setNewAssumption('')
    setAssumptionModal(false)
  }

  const handleEditAssumption = async (assumptionId, newText) => {
    try {
      await decisionService.editAssumption(id, assumptionId, newText)
      showToast('Assumption updated')
      setEditingAssumption(null)
      await refreshDecision()
    } catch (err) {
      showToast('Error: ' + err.message)
    }
  }

  const handleDeleteAssumption = async (assumptionId) => {
    try {
      await decisionService.deleteAssumption(id, assumptionId)
      showToast('Assumption deleted')
      await refreshDecision()
    } catch (err) {
      showToast('Error: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Back */}
      <Link to="/decisions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to decisions
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <HealthBadge status={decision.healthStatus} />
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${lifecycleBadgeColors[lifecycleColor]}`}>
                {getLifecycleLabel(decision.lifecycleState)}
              </span>
              <Link
                to={`/tree?focusId=${decision.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                View in Tree
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{decision.statement}</h1>
            <p className="text-sm text-gray-500">{decision.context}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="relative">
              <ConfidenceGauge value={decision.confidence} size={130} strokeWidth={12} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'tree'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Decision Tree
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'assistant'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Assistant
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'attachments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Attachments
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'versions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Versions
          </button>
        </nav>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Panel */}
            <DecisionHealthPanel decision={decision} />

            {/* Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Decision Summary</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{decision.context}</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <RiskTag level={decision.riskLevel} />
                <Tooltip content="How much this decision affects the organization">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-gray-600 cursor-help">
                    {decision.impactLevel.charAt(0).toUpperCase() + decision.impactLevel.slice(1)} Impact
                  </span>
                </Tooltip>
                <span className="text-xs text-gray-400">
                  Created {formatDate(decision.createdAt)} · Reviewed {formatDate(decision.lastReviewedAt)}
                </span>
              </div>
            </div>

            {/* Assumptions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-700">Assumptions</h2>
                  <Tooltip content="These are the things we're betting on. If any of these change, the decision may need review.">
                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </Tooltip>
                </div>
              </div>
              <ul className="space-y-2">
                {(decision.assumptions || []).map((a, i) => {
                  const assumptionId = a.id || a._id;
                  const assumptionText = a.text || a;
                  const isEditing = editingAssumption?.id === assumptionId;

                  return (
                    <li key={assumptionId || i} className="group flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium text-gray-500">
                        {i + 1}
                      </span>
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingAssumption.text}
                            onChange={e => setEditingAssumption({ ...editingAssumption, text: e.target.value })}
                            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditAssumption(assumptionId, editingAssumption.text)}
                            disabled={!editingAssumption.text.trim()}
                            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                          >Save</button>
                          <button
                            onClick={() => setEditingAssumption(null)}
                            className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700"
                          >Cancel</button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1">{assumptionText}</span>
                          {assumptionId && (
                            <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => setEditingAssumption({ id: assumptionId, text: assumptionText })}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit assumption"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteAssumption(assumptionId)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete assumption"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Health Signals */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Health Signals</h2>
                <Tooltip content="These signals tell you what's going well and what might need attention.">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Tooltip>
              </div>
              <div className="space-y-2">
                {(decision.signals || []).map((signal, i) => (
                  <SignalRow key={i} signal={signal} />
                ))}
              </div>
            </div>

            {/* Conflict Detection */}
            {decision.conflict && (
              <ConflictCompareCard decision={decision} conflict={decision.conflict} />
            )}

            {/* Sub-Decisions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700">Sub-Decisions</h2>
                <button
                  onClick={() => setSubDecisionModal(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Sub-Decision
                </button>
              </div>

              {decision.children && decision.children.length > 0 ? (
                <div className="space-y-3">
                  {decision.children.map(child => (
                    <div
                      key={child.id}
                      onClick={() => navigate(`/decisions/${child.id}/focus`)}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-all group"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                            {child.title}
                          </h3>
                          <RiskTag level={child.riskLevel} size="xs" />
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          {/* Fallback to 0 if not present */}
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${child.progressPercentage || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {child.lifecycleState !== 'Completed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkSubDecisionDone(child.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Mark as Done"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-700">
                            {Math.round(child.confidence || 0)}%
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-wide">Confidence</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">No sub-decisions yet</p>
                  <button
                    onClick={() => setSubDecisionModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Break down this decision
                  </button>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Decision Timeline</h2>
              <Timeline events={[...(decision.timeline || [])].reverse()} />
            </div>

            {/* Notes */}
            {(decision.notes || []).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Notes</h2>
                <ul className="space-y-2">
                  {decision.notes.map((note, i) => (
                    <li key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setConfirmAction('reaffirm')}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reaffirm Decision
                </button>
                <button
                  onClick={() => setNoteModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Add Review Note
                </button>
                <button
                  onClick={() => setAssumptionModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Update Assumptions
                </button>
                <button
                  onClick={() => setReviewDateModal(true)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mark Reviewed
                </button>
              </div>
            </div>

            {/* Insights Panel */}
            <InsightBox insights={decision.insights} />

            {/* Quick Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Info</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-400">Created</dt>
                  <dd className="text-sm text-gray-700">{formatDate(decision.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Last Reviewed</dt>
                  <dd className="text-sm text-gray-700">{formatDate(decision.lastReviewedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Next Review</dt>
                  <dd className="text-sm text-gray-700">{formatDate(decision.reviewDate)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-400">Confidence</dt>
                  <dd className="text-sm font-semibold text-gray-700">{decision.confidence}%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : activeTab === 'tree' ? (
        <DecisionTreeContainer decisionId={decision.id} />
      ) : activeTab === 'assistant' ? (
        <DecisionChatbot isInline={true} />
      ) : activeTab === 'versions' ? (
        <div className="bg-white rounded-xl border border-gray-200 min-h-[400px]">
          {comparingVersion ? (
            <VersionComparison
              decisionId={id}
              versionId={comparingVersion.id}
              currentDecision={decision}
              onClose={() => setComparingVersion(null)}
            />
          ) : (
            <VersionHistory
              decisionId={id}
              onCompare={(version) => setComparingVersion(version)}
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[400px]">
          <AttachmentsSection decisionId={decision.id} />
        </div>
      )}

      {/* Note Modal */}
      <Modal isOpen={noteModal} onClose={() => { setNoteModal(false); setNoteText(''); setSelectedTag(null); }} title="Add a Review Note">
        <p className="text-sm text-gray-500 mb-3">Share your thoughts or observations about this decision.</p>

        {/* Quick Tags */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-2">Quick Tags (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {['Reaffirmed', 'Revised', 'Escalated', 'Deferred'].map(tag => {
              const isSelected = selectedTag === tag;
              const tagStyles = {
                'Reaffirmed': isSelected
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-white text-green-700 border-green-200 hover:bg-green-50',
                'Revised': isSelected
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50',
                'Escalated': isSelected
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50',
                'Deferred': isSelected
                  ? 'bg-gray-100 text-gray-800 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              };

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${tagStyles[tag]}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Type your note here..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={handleAddNote} disabled={!noteText.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Save Note
          </button>
          <button onClick={() => { setNoteModal(false); setNoteText(''); setSelectedTag(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        </div>
      </Modal>

      {/* Assumption Modal */}
      <Modal isOpen={assumptionModal} onClose={() => { setAssumptionModal(false); setNewAssumption('') }} title="Add an Assumption">
        <p className="text-sm text-gray-500 mb-3">What new assumption should be tracked for this decision?</p>
        <input
          type="text"
          value={newAssumption}
          onChange={e => setNewAssumption(e.target.value)}
          placeholder="e.g., Budget approval is expected by March..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2 mt-4">
          <button onClick={handleAddAssumption} disabled={!newAssumption.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Add Assumption
          </button>
          <button onClick={() => { setAssumptionModal(false); setNewAssumption('') }} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        </div>
      </Modal>



      {/* Sub-Decision Modal */}
      <AnimatePresence>
        {subDecisionModal && (
          <AddDecisionWizard
            onClose={() => setSubDecisionModal(false)}
            initialContext={{
              parentDecisionId: id,
              parentTitle: decision.title
            }}
          />
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <Modal isOpen={reviewDateModal} onClose={() => { setReviewDateModal(false); setReviewDate(''); setNoteText(''); }} title="Complete Review">
        <p className="text-sm text-gray-500 mb-4">Confirm you have reviewed this decision. This will reset the health decay timer.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="What did you find? Is the decision still valid?"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Review Date (Optional)
            </label>
            <input
              type="date"
              value={reviewDate}
              onChange={e => setReviewDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handleMarkReviewed} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Confirm Review
          </button>
          <button onClick={() => { setReviewDateModal(false); setReviewDate(''); setNoteText(''); }} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        </div>
      </Modal>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-5 mt-8">
        <h2 className="text-sm font-semibold text-red-800 mb-2">Danger Zone</h2>
        <p className="text-sm text-red-600 mb-4">
          Deleting a decision is permanent and cannot be undone. All associated data (notes, history, etc.) will be removed.
        </p>
        <button
          onClick={() => setConfirmAction('delete')}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Decision
        </button>
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction === 'reaffirm' ? 'Reaffirm Decision' :
            confirmAction === 'delete' ? 'Delete Decision?' :
              'Mark as Reviewed'
        }
      >
        <div className="text-sm text-gray-500 mb-4">
          {confirmAction === 'reaffirm' && (
            <p>This will confirm the decision is still valid and boost its confidence slightly.</p>
          )}
          {confirmAction === 'delete' && (
            <div className="space-y-2">
              <p className="font-medium text-red-600">Are you sure you want to delete this decision?</p>
              <p>This action cannot be undone. Sub-decisions will be unlinked (orphaned).</p>
            </div>
          )}
          {confirmAction !== 'reaffirm' && confirmAction !== 'delete' && (
            <p>This will update the last reviewed date to today.</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              if (confirmAction === 'reaffirm') await handleReaffirm();
              else if (confirmAction === 'delete') {
                try {
                  await decisionService.delete(id);
                  showToast('Decision deleted');
                  navigate('/decisions'); // Redirect to library
                } catch (err) {
                  showToast('Error: ' + err.message);
                }
              }
              else await handleMarkReviewed();
              setConfirmAction(null);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors ${confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            Confirm
          </button>
          <button onClick={() => setConfirmAction(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        </div>
      </Modal>
    </div >
  )
}
