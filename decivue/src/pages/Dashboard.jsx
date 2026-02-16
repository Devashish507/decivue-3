import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDecisions } from '../hooks/useDecisions'
import StatCard from '../components/StatCard'
import ConfidenceGauge from '../components/ConfidenceGauge'
import ReviewAlertCard from '../components/ReviewAlertCard'
import Tooltip from '../components/Tooltip'
import { computeHealthScore } from '../utils/helpers'

export default function Dashboard() {
  const { decisions, stats } = useDecisions()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [reviewAlerts, setReviewAlerts] = useState({ GOVERNANCE_RISK: [], HIGH_PRIORITY: [], REMINDER: [], upcoming: [] })
  const [loading, setLoading] = useState(true)
  const healthScore = computeHealthScore(decisions)

  // Fetch review intelligence alerts
  useEffect(() => {
    const fetchReviewAlerts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/decisions/alerts')
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

  // Flatten all alerts for filtering
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

  // Determine health color/label
  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (score >= 40) return { label: 'Fair', color: 'text-amber-600', bg: 'bg-amber-50' }
    return { label: 'Correction Needed', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const status = getHealthStatus(healthScore)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your decision portfolio health and status.
          </p>
        </div>
        <Link
          to="/decisions/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Decision
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Decisions"
          value={stats.total}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Healthy"
          value={stats.healthy}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Needs Review"
          value={stats.review}
          color="amber"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="At Risk"
          value={stats.atRisk}
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Widget */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
            <Tooltip content="Weighted average of confidence, risk, and progress across all decisions">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </div>

          <h2 className="text-base font-semibold text-gray-900 mb-6">Portfolio Health</h2>

          <div className="relative mb-4">
            <div className={`absolute inset-0 blur-2xl opacity-20 ${status.bg}`}></div>
            <ConfidenceGauge value={healthScore} size={180} strokeWidth={16} />
          </div>

          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color} mb-2`}>
            {status.label}
          </div>

          <p className="text-sm text-gray-500 max-w-[240px]">
            Your decision portfolio is maintaining a <strong>{status.label.toLowerCase()}</strong> status.
          </p>
        </div>

        {/* Review Intelligence Alerts Widget */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Review Intelligence Alerts</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {reviewAlerts.GOVERNANCE_RISK.length} governance risks · {reviewAlerts.upcoming.length} upcoming reviews
              </p>
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 text-gray-600 cursor-pointer hover:bg-gray-100"
              >
                <option value="all">All Alerts</option>
                <option value="governance">Governance Risk</option>
                <option value="priority">High Priority</option>
                <option value="reminder">Reminders</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          <div className="p-2 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-medium text-gray-500">Loading alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">All clear</p>
                <p className="text-xs text-gray-400">No review alerts at this time</p>
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <ReviewAlertCard key={alert.id} alert={alert} />
              ))
            )}
          </div>

          {filteredAlerts.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl text-center">
              <button className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors">
                View All Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
