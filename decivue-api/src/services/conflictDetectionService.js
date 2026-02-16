/**
 * Conflict Detection Service
 * Detects potential conflicts when linking decisions
 */

const { Decision, DecisionRelation } = require('../models');
const { Op } = require('sequelize');

class ConflictDetectionService {
    /**
     * Detect conflicts for a new decision with proposed relationships
     * @param {Object} decisionData - New decision data
     * @param {Array} proposedRelationships - Array of {targetId, type}
     * @returns {Promise<Array>} Array of conflict warnings
     */
    async detectConflicts(decisionData, proposedRelationships) {
        const warnings = [];

        for (const rel of proposedRelationships) {
            const targetDecision = await Decision.findByPk(rel.targetId);
            if (!targetDecision) continue;

            // Check for resource overlap
            const resourceWarnings = this.checkResourceOverlap(decisionData, targetDecision);
            warnings.push(...resourceWarnings);

            // Check for timeline overlap
            const timelineWarnings = this.checkTimelineOverlap(decisionData, targetDecision);
            warnings.push(...timelineWarnings);

            // Check for budget conflicts
            const budgetWarnings = this.checkBudgetConflict(decisionData, targetDecision);
            warnings.push(...budgetWarnings);

            // Check for opposite risk strategies
            const riskWarnings = this.checkOppositeRiskStrategies(decisionData, targetDecision, rel.type);
            warnings.push(...riskWarnings);

            // Check for conflicting assumptions
            const assumptionWarnings = await this.checkConflictingAssumptions(decisionData, targetDecision);
            warnings.push(...assumptionWarnings);
        }

        return warnings;
    }

    /**
     * Check for resource overlap (same category, same priority)
     */
    checkResourceOverlap(decision1, decision2) {
        const warnings = [];

        if (decision1.category === decision2.category &&
            decision1.priority_level === decision2.priority_level) {
            warnings.push({
                type: 'RESOURCE_OVERLAP',
                severity: 'WARNING',
                message: `Both decisions target the same category (${decision1.category}) with ${decision1.priority_level} priority`,
                targetDecision: decision2.title
            });
        }

        return warnings;
    }

    /**
     * Check for timeline overlap
     */
    checkTimelineOverlap(decision1, decision2) {
        const warnings = [];

        if (decision1.target_review_date && decision2.target_review_date) {
            const date1 = new Date(decision1.target_review_date);
            const date2 = new Date(decision2.target_review_date);
            const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

            if (daysDiff < 30) { // Within 30 days
                warnings.push({
                    type: 'TIMELINE_OVERLAP',
                    severity: 'INFO',
                    message: `Review dates are within 30 days of each other`,
                    targetDecision: decision2.title,
                    details: `This decision: ${date1.toLocaleDateString()}, Related: ${date2.toLocaleDateString()}`
                });
            }
        }

        return warnings;
    }

    /**
     * Check for budget allocation conflicts
     */
    checkBudgetConflict(decision1, decision2) {
        const warnings = [];

        // High impact + High priority decisions might compete for budget
        if (decision1.impact_level === 'High' && decision2.impact_level === 'High' &&
            decision1.priority_level === 'HIGH' && decision2.priority_level === 'HIGH') {
            warnings.push({
                type: 'BUDGET_CONFLICT',
                severity: 'WARNING',
                message: `Both decisions have high impact and priority, potential budget competition`,
                targetDecision: decision2.title
            });
        }

        return warnings;
    }

    /**
     * Check for opposite risk mitigation strategies
     */
    checkOppositeRiskStrategies(decision1, decision2, relationType) {
        const warnings = [];

        // If one is risk mitigation and they conflict
        if (relationType === 'CONFLICTS_WITH' &&
            (decision1.decision_type === 'RISK_MITIGATION' || decision2.decision_type === 'RISK_MITIGATION')) {
            warnings.push({
                type: 'OPPOSITE_RISK_STRATEGY',
                severity: 'CRITICAL',
                message: `Conflicting risk mitigation strategies detected`,
                targetDecision: decision2.title,
                details: 'These decisions may implement opposite approaches to risk management'
            });
        }

        return warnings;
    }

    /**
     * Check for conflicting assumptions
     */
    async checkConflictingAssumptions(decision1, decision2) {
        const warnings = [];

        // This would require analyzing assumption text for conflicts
        // For now, return a placeholder warning if both have many assumptions
        // In a real implementation, you'd use NLP or keyword matching

        if (decision1.assumptions && decision2.assumptions &&
            decision1.assumptions.length > 3 && decision2.assumptions.length > 3) {
            warnings.push({
                type: 'ASSUMPTION_CHECK',
                severity: 'INFO',
                message: `Both decisions have multiple assumptions - review for potential conflicts`,
                targetDecision: decision2.title
            });
        }

        return warnings;
    }

    /**
     * Validate decision data before creation
     */
    async validateDecisionData(decisionData) {
        const errors = [];

        // Required fields
        if (!decisionData.title || decisionData.title.trim() === '') {
            errors.push({ field: 'title', message: 'Title is required' });
        }

        if (!decisionData.context || decisionData.context.trim() === '') {
            errors.push({ field: 'context', message: 'Description is required' });
        }

        if (decisionData.initial_confidence < 0 || decisionData.initial_confidence > 100) {
            errors.push({ field: 'initial_confidence', message: 'Confidence must be between 0 and 100' });
        }

        // Check for duplicate titles
        if (decisionData.title) {
            const existing = await Decision.findOne({
                where: { title: decisionData.title }
            });

            if (existing) {
                errors.push({
                    field: 'title',
                    message: 'A decision with this title already exists',
                    severity: 'WARNING'
                });
            }
        }

        return errors;
    }
}

module.exports = new ConflictDetectionService();
