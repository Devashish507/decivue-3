import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { decisionService } from '../services/api'

const DecisionContext = createContext()

export const useDecisions = () => {
  const context = useContext(DecisionContext)
  if (!context) {
    throw new Error('useDecisions must be used within a DecisionProvider')
  }
  return context
}

export const DecisionProvider = ({ children }) => {
  const [decisions, setDecisions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDecisions = useCallback(async (options = {}) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams();
      // Default to true unless explicitly set to false
      if (options.includeSubDecisions !== false) {
        queryParams.append('includeSubDecisions', 'true');
      }

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
      console.log('[useDecisions] fetching with query:', queryStr);

      const data = await decisionService.getAll(queryStr)
      setDecisions(data || [])
      setError(null)
    } catch (err) {
      console.warn('API unavailable, loading demo decisions:', err.message)
      // Fallback demo data when backend is not running
      const demoDecisions = [
        {
          id: 'demo-001',
          statement: 'Migrate to Microservices Architecture',
          context: 'Evaluate transitioning the monolithic backend to a microservices-based architecture to improve scalability and team autonomy.',
          explanation: 'Our monolith is slowing down deployments. Moving to microservices will allow independent scaling and faster feature delivery.',
          confidence: 72,
          initialConfidence: 60,
          riskLevel: 'high',
          impactLevel: 'high',
          lifecycleState: 'Active',
          progressPercentage: 45,
          healthStatus: 'review',
          calculated_health: { status: 'review', conflict_count: 1, health_score: 65 },
          start_date: '2026-01-15',
          target_date: '2026-06-30',
          assumptions: [
            { id: 'a1', text: 'Team has sufficient microservices experience', isActive: true },
            { id: 'a2', text: 'Cloud infrastructure budget is approved', isActive: true }
          ],
          timeline: [
            { type: 'CREATED', description: 'Decision created', timestamp: '2026-01-15T10:00:00Z' },
            { type: 'UPDATE', description: 'Confidence updated from 60% to 72%', timestamp: '2026-02-01T14:30:00Z' }
          ],
          reviews: [],
          notes: [],
          signals: [{ type: 'health', status: 'review', message: 'Health Status: review' }],
          insights: [{ type: 'info', message: 'High risk decision - monitor closely' }],
          lastReviewedAt: '2026-02-01T14:30:00Z',
          reviewDate: '2026-03-01',
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-02-01T14:30:00Z',
          isGovernanceRequired: true,
          governanceStatus: 'Pending Approval',
          teamMap: null,
          auditLogs: [],
          outgoingRelations: [],
          incomingRelations: [],
          parent: null,
          children: [],
          parentId: null,
        },
        {
          id: 'demo-002',
          statement: 'Adopt Remote-First Work Policy',
          context: 'Determine if the company should adopt a permanent remote-first policy post-pandemic.',
          explanation: 'Employee surveys show 85% prefer remote work. This decision evaluates the long-term benefits and challenges.',
          confidence: 88,
          initialConfidence: 75,
          riskLevel: 'low',
          impactLevel: 'high',
          lifecycleState: 'Active',
          progressPercentage: 80,
          healthStatus: 'healthy',
          calculated_health: { status: 'healthy', conflict_count: 0, health_score: 90 },
          start_date: '2026-01-01',
          target_date: '2026-04-01',
          assumptions: [
            { id: 'a3', text: 'Productivity remains consistent with remote work', isActive: true },
            { id: 'a4', text: 'Collaboration tools are sufficient', isActive: true }
          ],
          timeline: [
            { type: 'CREATED', description: 'Decision created', timestamp: '2026-01-01T09:00:00Z' },
            { type: 'REVIEWED', description: 'Quarterly review completed', timestamp: '2026-02-10T11:00:00Z' }
          ],
          reviews: [{ date: '2026-02-10T11:00:00Z', note: 'Quarterly review completed', type: 'REVIEWED' }],
          notes: [],
          signals: [{ type: 'health', status: 'healthy', message: 'Health Status: healthy' }],
          insights: [],
          lastReviewedAt: '2026-02-10T11:00:00Z',
          reviewDate: '2026-03-15',
          createdAt: '2026-01-01T09:00:00Z',
          updatedAt: '2026-02-10T11:00:00Z',
          isGovernanceRequired: false,
          governanceStatus: 'Approved',
          teamMap: null,
          auditLogs: [],
          outgoingRelations: [],
          incomingRelations: [],
          parent: null,
          children: [],
          parentId: null,
        },
        {
          id: 'demo-003',
          statement: 'Launch AI-Powered Customer Support Chatbot',
          context: 'Implement an AI chatbot to handle Tier-1 customer support queries and reduce response times.',
          explanation: 'Current support response time is 4 hours. An AI chatbot could reduce this to under 30 seconds for common queries.',
          confidence: 65,
          initialConfidence: 55,
          riskLevel: 'medium',
          impactLevel: 'medium',
          lifecycleState: 'Active',
          progressPercentage: 30,
          healthStatus: 'at-risk',
          calculated_health: { status: 'at-risk', conflict_count: 2, health_score: 45 },
          start_date: '2026-02-01',
          target_date: '2026-08-01',
          assumptions: [
            { id: 'a5', text: 'AI model accuracy meets 90% threshold', isActive: true },
            { id: 'a6', text: 'Customer satisfaction remains above 4.0/5.0', isActive: true }
          ],
          timeline: [
            { type: 'CREATED', description: 'Decision created', timestamp: '2026-02-01T08:00:00Z' },
            { type: 'UPDATE', description: 'Added risk assessment', timestamp: '2026-02-15T16:00:00Z' }
          ],
          reviews: [],
          notes: [],
          signals: [
            { type: 'health', status: 'at-risk', message: 'Health Status: at-risk' },
            { type: 'conflict', status: 'warning', message: '2 conflict(s) detected' }
          ],
          insights: [{ type: 'warning', message: 'Low confidence level - consider reviewing this decision' }],
          lastReviewedAt: '2026-02-15T16:00:00Z',
          reviewDate: '2026-03-01',
          createdAt: '2026-02-01T08:00:00Z',
          updatedAt: '2026-02-15T16:00:00Z',
          isGovernanceRequired: true,
          governanceStatus: 'Draft',
          teamMap: null,
          auditLogs: [],
          outgoingRelations: [],
          incomingRelations: [],
          parent: null,
          children: [],
          parentId: null,
        }
      ]
      setDecisions(demoDecisions)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchDecisions({ includeSubDecisions: true })
  }, [fetchDecisions])

  const getDecision = useCallback((id) => {
    return decisions.find(d => d.id === id)
  }, [decisions])

  const addDecision = async (newDecision) => {
    try {
      const created = await decisionService.create(newDecision)
      setDecisions(prev => [created, ...prev])
      return created
    } catch (err) {
      console.error('Failed to create decision:', err)
      throw err
    }
  }

  const updateDecision = async (id, updates) => {
    try {
      const updated = await decisionService.update(id, updates)
      setDecisions(prev => prev.map(d => d.id === id ? updated : d))
      return updated
    } catch (err) {
      console.error('Failed to update decision:', err)
      throw err
    }
  }

  const deleteDecision = async (id) => {
    try {
      await decisionService.delete(id)
      // Optimistic update
      setDecisions(prev => prev.filter(d => d.id !== id))
      // Background refresh to ensure consistency
      fetchDecisions({ includeSubDecisions: true })
      return true
    } catch (err) {
      console.error('Failed to delete decision:', err)
      throw err
    }
  }

  const reaffirmDecision = async (id) => {
    // Placeholder
  }

  const addNote = async (id, note) => {
    // Placeholder
  }

  const markReviewed = async (id) => {
    // Placeholder
  }

  const value = {
    decisions,
    loading,
    error,
    getDecision,
    addDecision,
    updateDecision,
    deleteDecision,
    reaffirmDecision,
    addNote,
    markReviewed,
    refresh: fetchDecisions,
    stats: {
      total: decisions.filter(d => !d.parentId).length,
      healthy: decisions.filter(d => !d.parentId && d.healthStatus === 'healthy').length,
      review: decisions.filter(d => !d.parentId && d.healthStatus === 'review').length,
      atRisk: decisions.filter(d => !d.parentId && d.healthStatus === 'at-risk').length,
    },
    alerts: decisions.filter(d => d.healthStatus === 'at-risk' || d.healthStatus === 'review').map(d => ({
      id: `alert-${d.id}`,
      type: d.healthStatus === 'at-risk' ? 'risk' : 'warning',
      severity: d.healthStatus === 'at-risk' ? 'risk' : 'warning',
      message: `Decision "${d.statement}" is ${d.healthStatus === 'at-risk' ? 'At Risk' : 'Needs Review'}`,
      decisionId: d.id,
      date: new Date().toISOString()
    }))
  }

  return (
    <DecisionContext.Provider value={value}>
      {children}
    </DecisionContext.Provider>
  )
}
