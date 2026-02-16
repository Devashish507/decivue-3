import axios from 'axios';

const api = axios.create({
    baseURL: '/api/decisions',
    headers: {
        'Content-Type': 'application/json',
    },
});

const transformDecision = (d) => {
    if (!d) {
        console.warn('transformDecision: Received null or undefined decision');
        return null;
    }

    // Validate that we have at least an ID
    if (!d.id) {
        console.error('transformDecision: Decision missing ID', d);
        return null;
    }

    console.log('Raw decision from API:', d);

    // Transform assumptions from backend format to frontend format (array of strings)
    const assumptions = (d.assumptions || [])
        .filter(a => a && a.is_active !== false)
        .map(a => ({
            id: a.id || `assumption-${Math.random()}`,
            text: a.assumption_text || a.text || a || 'No assumption text',
            isActive: a.is_active !== false
        }));

    // Transform history to timeline events
    const timeline = (d.history || [])
        .filter(h => h) // Filter out null/undefined entries
        .map(h => ({
            type: h.event_type || 'UPDATE',
            description: h.description || 'Decision updated',
            timestamp: h.createdAt || h.created_at || h.timestamp || new Date().toISOString(),
            previousValue: h.previous_value,
            newValue: h.new_value
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort newest first

    // Extract review events from history
    const reviews = (d.history || [])
        .filter(h => h && (h.event_type === 'REVIEWED' || h.event_type === 'REAFFIRMED'))
        .map(h => ({
            date: h.created_at || new Date().toISOString(),
            note: h.description || '',
            type: h.event_type
        }));

    // Generate health signals from calculated_health
    const signals = [];
    if (d.calculated_health) {
        const healthStatus = d.calculated_health.status || 'healthy';
        signals.push({
            type: 'health',
            status: healthStatus,
            message: `Health Status: ${healthStatus}`
        });

        const conflictCount = d.calculated_health.conflict_count || 0;
        if (conflictCount > 0) {
            signals.push({
                type: 'conflict',
                status: 'warning',
                message: `${conflictCount} conflict(s) detected`
            });
        }
    }

    // Generate insights based on decision data
    const insights = [];
    const confidence = d.current_confidence || d.initial_confidence || 50;
    if (confidence < 50) {
        insights.push({
            type: 'warning',
            message: 'Low confidence level - consider reviewing this decision'
        });
    }
    if (d.risk_level === 'High') {
        insights.push({
            type: 'info',
            message: 'High risk decision - monitor closely'
        });
    }

    const transformed = {
        id: d.id,
        statement: d.title || 'Untitled Decision',
        context: d.context || 'No context provided',
        explanation: d.context || 'No explanation available', // Added for DecisionCard
        parentId: d.parent_id || null,

        // Use calculated confidence if available, otherwise fallback to current or initial
        confidence: d.calculated_confidence || d.current_confidence || d.initial_confidence || 50,
        initialConfidence: d.initial_confidence || 50,

        riskLevel: (d.risk_level || 'Medium').toLowerCase(),
        impactLevel: (d.impact_level || 'Medium').toLowerCase(),
        conflict: null,
        lifecycleState: d.lifecycle_state || 'Draft',
        progressPercentage: d.progress_percentage || 0,
        tracking: d.tracking ? {
            status: d.tracking.status,
            weight: d.tracking.weight,
            completion: d.tracking.completion_percentage
        } : null,
        healthStatus: (d.calculated_health?.status || 'healthy').toLowerCase().replace(' ', '-'),
        calculated_health: d.calculated_health, // Pass through raw health data
        start_date: d.start_date,
        target_date: d.target_date,
        assumptions: assumptions,
        timeline: timeline,
        reviews: reviews,
        notes: d.notes || [],
        signals: signals,
        insights: insights,
        lastReviewedAt: d.last_reviewed_at || d.created_at || new Date().toISOString(),
        reviewDate: d.review_due_date || null,
        createdAt: d.created_at || new Date().toISOString(),
        updatedAt: d.updated_at || d.created_at || new Date().toISOString(),

        // Governance
        isGovernanceRequired: d.is_governance_required,
        governanceStatus: d.governance_status || 'Draft',
        reviewerId: d.reviewer_id || (d.teamMap ? d.teamMap.reviewer_id : null),
        auditLogs: d.auditLogs || [],

        // Relationship data for graph visualization
        outgoingRelations: d.outgoingRelations || [],
        incomingRelations: d.incomingRelations || [],

        parent: d.parent ? {
            id: d.parent.id,
            title: d.parent.title || 'Untitled Parent'
        } : null,
        children: d.children ? d.children.map(c => ({
            id: c.id,
            title: c.title,
            lifecycleState: c.lifecycle_state,
            confidence: c.current_confidence,
            riskLevel: c.risk_level,
            progressPercentage: c.progress_percentage,
            isGovernanceRequired: c.is_governance_required,
            healthStatus: (c.calculated_health?.status || c.health_score ? (c.health_score > 80 ? 'healthy' : 'at-risk') : 'healthy') // Simple fallback for lists
        })) : []
    };

    console.log('Transformed decision:', transformed);
    return transformed;
};

export const decisionService = {
    getAll: async (query = '') => {
        try {
            const response = await api.get('/' + query);
            console.log('API getAll response:', response.data);
            const list = Array.isArray(response.data.data) ? response.data.data : [];
            return list.map(transformDecision).filter(Boolean);
        } catch (error) {
            console.error('API getAll error:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            console.log('[API Service] Fetching decision by ID:', id);
            const response = await api.get(`/${id}`);
            console.log('[API Service] Raw API response:', response.data);

            if (!response.data.success) {
                console.error('[API Service] API returned error:', response.data.message);
                throw new Error(response.data.message || 'Failed to fetch decision');
            }

            if (!response.data.data) {
                console.error('[API Service] API response missing data field');
                throw new Error('API response is missing decision data');
            }

            console.log('[API Service] Starting transformation for decision:', response.data.data.id);

            try {
                const transformed = transformDecision(response.data.data);

                if (!transformed) {
                    console.error('[API Service] Transformation returned null for decision:', id);
                    throw new Error('Decision transformation failed - returned null');
                }

                console.log('[API Service] Successfully transformed decision:', transformed.id);
                return transformed;
            } catch (transformError) {
                console.error('[API Service] Transformation error:', transformError);
                console.error('[API Service] Failed decision data:', response.data.data);
                throw new Error(`Failed to transform decision: ${transformError.message}`);
            }
        } catch (error) {
            console.error('[API Service] getById error:', error);
            throw error;
        }
    },

    getTree: async (id) => {
        const response = await api.get(`/${id}/tree`);
        return response.data.data;
    },

    update: async (id, decisionData) => {
        // Map frontend field names to backend schema
        const backendData = {
            title: decisionData.statement || decisionData.title,
            context: decisionData.context,
            current_confidence: decisionData.confidence,
            risk_level: decisionData.riskLevel ? decisionData.riskLevel.charAt(0).toUpperCase() + decisionData.riskLevel.slice(1) : undefined,
            impact_level: decisionData.impactLevel ? decisionData.impactLevel.charAt(0).toUpperCase() + decisionData.impactLevel.slice(1) : undefined,
            lifecycle_state: decisionData.lifecycleState,
            start_date: decisionData.start_date,
            target_date: decisionData.target_date
        };

        const response = await api.put(`/${id}`, backendData);
        return transformDecision(response.data.data);
    },

    create: async (decisionData) => {
        // Map frontend field names to backend schema
        const backendData = {
            title: decisionData.statement,  // statement -> title
            context: decisionData.context,
            initial_confidence: decisionData.confidence,  // confidence -> initial_confidence
            current_confidence: decisionData.confidence,  // confidence -> current_confidence
            risk_level: decisionData.riskLevel ? decisionData.riskLevel.charAt(0).toUpperCase() + decisionData.riskLevel.slice(1) : 'Medium',  // riskLevel -> risk_level (capitalize)
            impact_level: decisionData.impactLevel ? decisionData.impactLevel.charAt(0).toUpperCase() + decisionData.impactLevel.slice(1) : 'Medium',  // impactLevel -> impact_level (capitalize)
            review_due_date: decisionData.reviewDate,  // reviewDate -> review_due_date
            lifecycle_state: 'Active'  // Set default lifecycle state
        };

        const response = await api.post('/', backendData);
        const createdDecision = response.data.data;

        // Create assumptions if provided
        if (decisionData.assumptions && decisionData.assumptions.length > 0) {
            // Note: This requires an assumptions endpoint which may not exist yet
            // For now, we'll just log this
            console.log('Assumptions to create:', decisionData.assumptions);
        }

        return transformDecision(createdDecision);
    },

    // Action methods
    reaffirm: async (id) => {
        const response = await api.post(`/${id}/reaffirm`);
        return response.data;
    },

    addNote: async (id, note, tag = null) => {
        const payload = { note };
        if (tag) payload.review_tag = tag;
        const response = await api.post(`/${id}/notes`, payload);
        return response.data;
    },

    markReviewed: async (id, payload = {}) => {
        const response = await api.post(`/${id}/review`, payload);
        return response.data;
    },

    reviewDecision: async (id, notes, status = 'Completed') => {
        const response = await api.post(`/${id}/review-decision`, { notes, status });
        return response.data;
    },

    updateAssumptions: async (id, assumptions) => {
        const response = await api.put(`/${id}/assumptions`, { assumptions });
        return response.data;
    },

    updateSubDecisionProgress: async (id, progressData) => {
        const response = await api.patch(`/sub-decision/${id}/progress`, progressData);
        return response.data;
    },

    // Relationship methods
    getRelationships: async (id) => {
        const response = await api.get(`/${id}/relationships`);
        return response.data;
    },

    getReasoningTree: async (id) => {
        const response = await api.get(`/${id}/reasoning`);
        return response.data;
    },

    createRelationship: async (id, relationshipData) => {
        const response = await api.post(`/${id}/relationships`, relationshipData);
        return response.data;
    },

    searchDecisions: async (query, filters = {}) => {
        const params = new URLSearchParams({ q: query, ...filters });
        const response = await api.get(`/search?${params}`);
        return response.data.data;
    },

    createFromWizard: async (wizardData) => {
        const response = await api.post('/wizard/create', wizardData);
        return response.data.data;
    },

    validateWizard: async (wizardData) => {
        const response = await api.post('/wizard/validate', wizardData);
        return response.data.data;
    },

    // Sub-Decision Methods
    createSubDecision: async (parentId, data) => {
        const response = await api.post(`/${parentId}/sub`, data);
        return transformDecision(response.data.data);
    },

    updateProgress: async (subDecisionId, data) => {
        const response = await api.patch(`/sub-decision/${subDecisionId}/progress`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/${id}`);
        return response.data;
    },

    // Attachment Methods
    getAttachments: async (decisionId) => {
        const response = await api.get(`/${decisionId}/attachments`);
        return response.data.data;
    },

    uploadAttachment: async (decisionId, formData, onProgress) => {
        const response = await api.post(`/${decisionId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        });
        return response.data.data;
    },

    deleteAttachment: async (attachmentId) => {
        // Since baseURL is /api/decisions, we need to go up one level for /api/attachments
        const response = await axios.delete(`/api/attachments/${attachmentId}`);
        return response.data;
    },

    // Version History
    getVersions: async (id) => {
        const response = await api.get(`/${id}/versions`);
        return response.data.data;
    },
    getVersionDetails: async (id, versionId) => {
        const response = await api.get(`/${id}/versions/${versionId}`);
        return response.data.data;
    },

    // Assumption Management
    editAssumption: async (decisionId, assumptionId, text) => {
        const response = await api.put(`/${decisionId}/assumptions/${assumptionId}`, { text });
        return response.data;
    },
    deleteAssumption: async (decisionId, assumptionId) => {
        const response = await api.delete(`/${decisionId}/assumptions/${assumptionId}`);
        return response.data;
    }
};

export const teamService = {
    getAll: async () => {
        const response = await axios.get('/api/teams');
        return response.data;
    },
    create: async (data) => {
        const response = await axios.post('/api/teams', data);
        return response.data;
    },
    getDashboard: async (id) => {
        const response = await axios.get(`/api/teams/${id}/dashboard`);
        if (response.data.success && response.data.data.decisions) {
            response.data.data.decisions = response.data.data.decisions.map(transformDecision);
        }
        return response.data;
    },
    addMember: async (teamId, data) => {
        const response = await axios.post(`/api/teams/${teamId}/members`, data);
        return response.data;
    },
    removeMember: async (teamId, userId) => {
        const response = await axios.delete(`/api/teams/${teamId}/members/${userId}`);
        return response.data;
    },
    updateMemberRole: async (teamId, userId, role) => {
        const response = await axios.put(`/api/teams/${teamId}/members/${userId}`, { role });
        return response.data;
    }
};

export const governanceService = {
    requestApproval: async (id, data) => {
        const response = await axios.post(`/api/governance/decisions/${id}/request-approval`, data);
        return response.data;
    },
    approve: async (id, data) => {
        const response = await axios.post(`/api/governance/decisions/${id}/approve`, data);
        return response.data;
    },
    reject: async (id, data) => {
        const response = await axios.post(`/api/governance/decisions/${id}/reject`, data);
        return response.data;
    },
    logAction: async (id, data) => {
        const response = await axios.post(`/api/governance/decisions/${id}/log`, data);
        return response.data;
    }
};
