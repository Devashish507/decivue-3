import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDecisions } from '../hooks/useDecisions'
import DecisionCard from '../components/DecisionCard'
import Modal from '../components/Modal'
import Tooltip from '../components/Tooltip'
import { Plus, Search, Filter, Layers, Zap, BookOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DecisionList() {
  const { decisions = [], loading, error, reaffirmDecision, addNote, markReviewed } = useDecisions()

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

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-40 bg-slate-100 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50 rounded-3xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 max-w-lg mx-auto shadow-xl shadow-rose-500/5">
          <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200">
            <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-rose-900 mb-2">Sync Error</h2>
          <p className="text-rose-600 font-medium mb-8 leading-relaxed">We encountered a turbulence in the intelligence stream: {error.message}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200">
            Attempt Re-sync
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-[100] bg-slate-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 border border-indigo-500/30 backdrop-blur-xl"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black uppercase tracking-widest text-[10px]">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -u-z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-[0.2em]">
              <BookOpen className="w-4 h-4" />
              Strategic Repository
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Decision Matrix</h1>
            <p className="text-slate-500 font-medium max-w-md">
              Monitoring <span className="text-slate-900 font-bold">{filtered.length} active nodes</span> across the intelligence framework.
            </p>
          </div>

          <Link
            to="/decisions/new"
            className="group inline-flex items-center gap-2.5 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:bg-indigo-600 transition-all hover:-translate-y-1 active:scale-95 text-sm"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Establish Node
          </Link>
        </div>

        {/* Intelligence Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group/search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search across lexical pathways and node statements..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative group/select">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within/select:text-indigo-500 transition-colors" />
              <select
                value={filterHealth}
                onChange={e => setFilterHealth(e.target.value)}
                className="pl-11 pr-10 py-4 border border-slate-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none shadow-sm min-w-[180px]"
              >
                <option value="all">Integrity: All</option>
                <option value="healthy">Optimal Integrity</option>
                <option value="review">Needs Calibration</option>
                <option value="at-risk">Critical Latency</option>
              </select>
            </div>

            <div className="relative group/select">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within/select:text-indigo-500 transition-colors" />
              <select
                value={filterRisk}
                onChange={e => setFilterRisk(e.target.value)}
                className="pl-11 pr-10 py-4 border border-slate-100 bg-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-slate-600 cursor-pointer appearance-none shadow-sm min-w-[180px]"
              >
                <option value="all">Impact: All Levels</option>
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Impact</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      <div className="relative">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Layers className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No nodes Intercepted</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
              Your current filter configuration did not match any stored intelligence. Try recalibrating your search.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((decision, idx) => (
                <motion.div
                  key={decision.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <DecisionCard
                    decision={decision}
                    onReaffirm={handleReaffirm}
                    onAddNote={(id) => setNoteModal({ open: true, decisionId: id })}
                    onReview={handleReview}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals & Intervention UI */}
      <Modal
        isOpen={noteModal.open}
        onClose={() => { setNoteModal({ open: false, decisionId: null }); setNoteText('') }}
        title="Analytical Annotation"
      >
        <div className="space-y-6 pt-4">
          <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-4 border-indigo-100 pl-4">Record your observations or relevant intelligence for future synthesis.</p>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type your strategic observation here..."
            rows={5}
            className="w-full px-5 py-4 text-sm border border-slate-100 bg-slate-50/50 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 text-slate-700 font-medium resize-none transition-all"
          />
          <div className="flex gap-3">
            <button
              onClick={handleNoteSubmit}
              disabled={!noteText.trim()}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-95"
            >
              Archive Note
            </button>
            <button
              onClick={() => { setNoteModal({ open: false, decisionId: null }); setNoteText('') }}
              className="px-8 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, decisionId: null, action: null })}
        title={confirmModal.action === 'reaffirm' ? 'Calibrate Confidence' : 'Synchronize Review'}
      >
        <div className="space-y-6 pt-4">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {confirmModal.action === 'reaffirm'
              ? 'This action will validate the decision integrity and optimize the confidence quotient across the network.'
              : 'This action will synchronize the decision timeframe to current temporal markers.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
            >
              Authorize Action
            </button>
            <button
              onClick={() => setConfirmModal({ open: false, decisionId: null, action: null })}
              className="px-8 py-4 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Abstain
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
