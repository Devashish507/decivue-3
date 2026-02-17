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
      console.error('Failed to fetch decisions:', err)
      setError(err)
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
