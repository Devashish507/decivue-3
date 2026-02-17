import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDecisions } from '../hooks/useDecisions'
import StatCard from '../components/StatCard'
import ConfidenceGauge from '../components/ConfidenceGauge'
import ReviewAlertCard from '../components/ReviewAlertCard'
import Tooltip from '../components/Tooltip'
import { computeHealthScore } from '../utils/helpers'
import { Plus, Search, Filter, Info, Bell, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const { decisions, stats } = useDecisions()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [reviewAlerts, setReviewAlerts] = useState({ GOVERNANCE_RISK: [], HIGH_PRIORITY: [], REMINDER: [], upcoming: [] })
  const [loading, setLoading] = useState(true)
  const healthScore = computeHealthScore(decisions)

  useEffect(() => {
    const fetchReviewAlerts = async () => {
      try {
        const response = await fetch('/api/decisions/alerts')
        const data = await response.json()
        if (data.success) {
          setReviewAlerts(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch review alerts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReviewAlerts()
  }, [])

  const allAlerts = [
    ...reviewAlerts.GOVERNANCE_RISK,
    ...reviewAlerts.HIGH_PRIORITY,
    ...reviewAlerts.REMINDER,
    ...reviewAlerts.upcoming
  ]

  const filteredAlerts = allAlerts.filter(a => {
    if (searchQuery && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterStatus !== 'all') {
      if (filterStatus === 'governance' && a.escalationLevel !== 'GOVERNANCE_RISK') return false
      if (filterStatus === 'priority' && a.escalationLevel !== 'HIGH_PRIORITY') return false
      if (filterStatus === 'reminder' && a.escalationLevel !== 'REMINDER') return false
      if (filterStatus === 'upcoming' && a.escalationLevel !== null) return false
    }
    return true
  })

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
    if (score >= 60) return { label: 'Stable', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' }
    if (score >= 40) return { label: 'Caution', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' }
    return { label: 'Critical', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' }
  }

  const status = getHealthStatus(healthScore)

  return (
    <div className="space-y-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <div className="w-8 h-[1px] bg-indigo-600" />
            Strategic Overview
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Command Center</h1>
          <p className="text-slate-500 font-medium">Monitoring {decisions.length} active strategic threads.</p>
        </div>

        <Link
          to="/decisions/new"
          className="group inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Decision</span>
        </Link>
      </div>

      {/* Grid: Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Active Repository"
          value={stats.total}
          color="blue"
          icon={<Search className="w-6 h-6" />}
        />
        <StatCard
          label="Optimal Health"
          value={stats.healthy}
          color="green"
          icon={<Bell className="w-6 h-6" />}
        />
        <StatCard
          label="Pending Review"
          value={stats.review}
          color="amber"
          icon={<Filter className="w-6 h-6" />}
        />
        <StatCard
          label="High Risk Zones"
          value={stats.atRisk}
          color="red"
          icon={<Info className="w-6 h-6" />}
        />
      </div>

      {/* Middle Section: Health & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Health Analytics Widget */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-100 relative overflow-hidden group">
          <div className="absolute top-6 right-6 text-slate-300 hover:text-indigo-500 transition-colors cursor-help">
            <Tooltip content="Collective intelligence score based on confidence metrics, risk parameters, and execution progress.">
              <Info className="w-5 h-5" />
            </Tooltip>
          </div>

          <div className="absolute -z-10 top-0 left-0 w-full h-1/2 bg-gradient-to-b from-slate-50 to-transparent" />

          <h2 className="text-xs uppercase tracking-widest font-black text-slate-400 mb-8 px-4 py-1.5 bg-slate-50 rounded-full">Portfolio Intelligence</h2>

          <div className="relative mb-6">
            <div className={`absolute inset-0 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 ${status.bg}`} />
            <ConfidenceGauge value={healthScore} size={200} strokeWidth={18} />
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter border-2 ${status.border} ${status.bg} ${status.color} mb-4`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse bg-current`} />
            {status.label} Status
          </motion.div>

          <p className="text-sm text-slate-500 max-w-[260px] font-medium leading-relaxed">
            Your decision framework is currently operating at <span className="text-slate-900 font-bold">{healthScore}%</span> efficiency.
          </p>
        </div>

        {/* Intelligence Alerts System */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100 flex flex-col min-h-[500px] overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-gradient-to-r from-white to-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  Live Intelligence Alerts
                  <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                </h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Active monitoring: <span className="text-rose-500 font-bold">{reviewAlerts.GOVERNANCE_RISK.length} risks</span> detected.
                </p>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider border-none focus:ring-0 bg-transparent text-slate-600 cursor-pointer"
                >
                  <option value="all">Priority: All</option>
                  <option value="governance">Governance</option>
                  <option value="priority">High Priority</option>
                  <option value="reminder">Standard</option>
                  <option value="upcoming">Future</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-slate-50/30 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search intelligence cache..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 placeholder-slate-400 font-medium shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-premium">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-50 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest">Synchronizing Data...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 py-10 opacity-50">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                  <Bell className="w-10 h-10 text-slate-200" />
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-slate-900">System Clear</p>
                  <p className="text-sm font-medium">No alerts requiring immediate attention.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAlerts.map(alert => (
                  <ReviewAlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {filteredAlerts.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
              <button className="group text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2">
                Expand Intelligence Logs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
