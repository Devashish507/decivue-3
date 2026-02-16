import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDecisions } from '../hooks/useDecisions'
import DecisionCard from '../components/DecisionCard'
import Modal from '../components/Modal'
import Tooltip from '../components/Tooltip'

export default function DecisionList() {
  const { decisions = [], loading, error, reaffirmDecision, addNote, markReviewed } = useDecisions()

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading decisions...</div>
      </div>
    )
  }

  if (error) {
    console.error('DecisionList error:', error);
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">Error loading decisions: {error.message}</div>
      </div>
    )
  }

  console.log('DecisionList - decisions:', decisions);
  console.log('DecisionList - decisions count:', decisions.length);

  const [searchQuery, setSearchQuery] = useState('')
  const [filterHealth, setFilterHealth] = useState('all')
  const [filterRisk, setFilterRisk] = useState('all')
  const [noteModal, setNoteModal] = useState({ open: false, decisionId: null })
  const [noteText, setNoteText] = useState('')
  const [confirmModal, setConfirmModal] = useState({ open: false, decisionId: null, action: null })
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const filtered = decisions.filter(d => {
    if (searchQuery && !d.statement.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterHealth !== 'all' && d.healthStatus !== filterHealth) return false
    if (filterRisk !== 'all' && d.riskLevel !== filterRisk) return false
    return true
  })

  const handleReaffirm = (id) => {
    setConfirmModal({ open: true, decisionId: id, action: 'reaffirm' })
  }

  const handleReview = (id) => {
    setConfirmModal({ open: true, decisionId: id, action: 'review' })
  }

  const handleConfirm = () => {
    if (confirmModal.action === 'reaffirm') {
      reaffirmDecision(confirmModal.decisionId)
      showToast('Decision reaffirmed successfully')
    } else if (confirmModal.action === 'review') {
      markReviewed(confirmModal.decisionId)
      showToast('Decision marked as reviewed')
    }
    setConfirmModal({ open: false, decisionId: null, action: null })
  }

  const handleNoteSubmit = () => {
    if (noteText.trim()) {
      addNote(noteModal.decisionId, noteText.trim())
      showToast('Note added successfully')
    }
    setNoteText('')
    setNoteModal({ open: false, decisionId: null })
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Decisions</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Browse and manage all tracked decisions in one place.
          </p>
        </div>
        <Link
          to="/decisions/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Decision
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Tooltip content="Filter by how healthy the decision is">
              <select
                value={filterHealth}
                onChange={e => setFilterHealth(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Health</option>
                <option value="healthy">Healthy</option>
                <option value="review">Needs Review</option>
                <option value="at-risk">At Risk</option>
              </select>
            </Tooltip>
            <Tooltip content="Filter by risk level">
              <select
                value={filterRisk}
                onChange={e => setFilterRisk(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Risk</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{filtered.length} decision{filtered.length !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No decisions found</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
          <Link
            to="/decisions/new"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create your first decision
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(decision => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              onReaffirm={handleReaffirm}
              onAddNote={(id) => setNoteModal({ open: true, decisionId: id })}
              onReview={handleReview}
            />
          ))}
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={noteModal.open}
        onClose={() => { setNoteModal({ open: false, decisionId: null }); setNoteText('') }}
        title="Add a Review Note"
      >
        <p className="text-sm text-gray-500 mb-3">Share your thoughts or observations about this decision.</p>
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder="Type your note here..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleNoteSubmit}
            disabled={!noteText.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Note
          </button>
          <button
            onClick={() => { setNoteModal({ open: false, decisionId: null }); setNoteText('') }}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, decisionId: null, action: null })}
        title={confirmModal.action === 'reaffirm' ? 'Reaffirm Decision' : 'Mark as Reviewed'}
      >
        <p className="text-sm text-gray-500 mb-4">
          {confirmModal.action === 'reaffirm'
            ? 'This will confirm the decision is still valid and boost its confidence slightly.'
            : 'This will update the last reviewed date to today.'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => setConfirmModal({ open: false, decisionId: null, action: null })}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
