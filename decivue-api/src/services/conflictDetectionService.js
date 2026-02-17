/**
 * Conflict Detection Service
 * Auto-detects confidence-based conflicts using the hardcoded conflict map.
 * Inserts CONFLICTS_WITH relations and triggers health recalculation.
 */

const { Decision, DecisionRelation, DecisionHistory } = require('../models');
const { Op } = require('sequelize');
const conflictMap = require('./conflictMap');

class ConflictDetectionService {

    /**
     * Detect and insert confidence-based conflicts for a decision.
     * Called automatically on decision create/update.
     */
    async detectAndInsertConfidenceConflicts(decisionId) {
        try {
            const decision = await Decision.findByPk(decisionId);
            if (!decision) {
                console.log(`[ConflictDetection] Decision ${decisionId} not found`);
                return [];
            }

            const confidenceScore = decision.current_confidence;
            const conflictingScores = conflictMap[confidenceScore];

            if (!conflictingScores || conflictingScores.length === 0) {
                console.log(`[ConflictDetection] No conflict mapping for confidence ${confidenceScore}`);
                return [];
            }

            console.log(`[ConflictDetection] Checking decision ${decisionId} (confidence: ${confidenceScore}) against mapped conflicts: [${conflictingScores.join(', ')}]`);

            const conflictingDecisions = await Decision.findAll({
                where: {
                    id: { [Op.ne]: decisionId },
                    current_confidence: { [Op.in]: conflictingScores }
                }
            });

            if (conflictingDecisions.length === 0) {
                console.log(`[ConflictDetection] No decisions found with conflicting confidence scores`);
                return [];
            }

            const detectedConflicts = [];

            for (const conflictDecision of conflictingDecisions) {
                const existingConflict = await DecisionRelation.findOne({
                    where: {
                        [Op.or]: [
                            {
                                source_decision_id: decisionId,
                                target_decision_id: conflictDecision.id,
                                relation_type: 'CONFLICTS_WITH'
                            },
                            {
                                source_decision_id: conflictDecision.id,
                                target_decision_id: decisionId,
                                relation_type: 'CONFLICTS_WITH'
                            }
                        ]
                    }
                });

                if (existingConflict) {
                    console.log(`[ConflictDetection] Conflict already exists between ${decisionId} and ${conflictDecision.id}, skipping`);
                    continue;
                }

                console.log(`[ConflictDetection] CONFLICT DETECTED: ${decision.title} (${confidenceScore}) <-> ${conflictDecision.title} (${conflictDecision.current_confidence})`);

                const forwardRelation = await DecisionRelation.create({
                    source_decision_id: decisionId,
                    target_decision_id: conflictDecision.id,
                    relation_type: 'CONFLICTS_WITH',
                    notes: `Auto-detected: confidence conflict (${confidenceScore} vs ${conflictDecision.current_confidence})`
                });

                await DecisionRelation.create({
                    source_decision_id: conflictDecision.id,
                    target_decision_id: decisionId,
                    relation_type: 'CONFLICTS_WITH',
                    notes: `Auto-detected: confidence conflict (${conflictDecision.current_confidence} vs ${confidenceScore})`
                });

                await DecisionHistory.create({
                    decision_id: decisionId,
                    event_type: 'CONFLICT_DETECTED',
                    description: `Conflict detected with "${conflictDecision.title}" - confidence scores ${confidenceScore} vs ${conflictDecision.current_confidence}`
                });

                await DecisionHistory.create({
                    decision_id: conflictDecision.id,
                    event_type: 'CONFLICT_DETECTED',
                    description: `Conflict detected with "${decision.title}" - confidence scores ${conflictDecision.current_confidence} vs ${confidenceScore}`
                });

                detectedConflicts.push({
                    decisionA_id: decisionId,
                    decisionA_title: decision.title,
                    decisionA_confidence: confidenceScore,
                    decisionB_id: conflictDecision.id,
                    decisionB_title: conflictDecision.title,
                    decisionB_confidence: conflictDecision.current_confidence,
                    conflict_type: 'confidence_conflict',
                    status: 'detected',
                    relation_id: forwardRelation.id
                });

                try {
                    const healthService = require('./healthService');
                    await healthService.updateDecisionHealth(conflictDecision.id);
                    console.log(`[ConflictDetection] Health recalculated for conflicting decision ${conflictDecision.id}`);
                } catch (healthErr) {
                    console.error(`[ConflictDetection] Failed to recalculate health for ${conflictDecision.id}:`, healthErr.message);
                }
            }

            if (detectedConflicts.length > 0) {
                try {
                    const healthService = require('./healthService');
                    await healthService.updateDecisionHealth(decisionId);
                    console.log(`[ConflictDetection] Health recalculated for primary decision ${decisionId}`);
                } catch (healthErr) {
                    console.error(`[ConflictDetection] Failed to recalculate health for ${decisionId}:`, healthErr.message);
                }
            }

            console.log(`[ConflictDetection] Total conflicts detected: ${detectedConflicts.length}`);
            return detectedConflicts;

        } catch (error) {
            console.error('[ConflictDetection] Error in detectAndInsertConfidenceConflicts:', error);
            return [];
        }
    }

    /**
     * Get all CONFLICTS_WITH relations for a decision
     */
    async getConflictsForDecision(decisionId) {
        try {
            const outgoing = await DecisionRelation.findAll({
                where: {
                    source_decision_id: decisionId,
                    relation_type: 'CONFLICTS_WITH'
                },
                include: [{
                    model: Decision,
                    as: 'targetDecision',
                    attributes: ['id', 'title', 'current_confidence', 'risk_level', 'lifecycle_state']
                }]
            });

            const incoming = await DecisionRelation.findAll({
                where: {
                    target_decision_id: decisionId,
                    relation_type: 'CONFLICTS_WITH'
                },
                include: [{
                    model: Decision,
                    as: 'sourceDecision',
                    attributes: ['id', 'title', 'current_confidence', 'risk_level', 'lifecycle_state']
                }]
            });

            const conflictsMap = new Map();

            outgoing.forEach(function (rel) {
                if (rel.targetDecision) {
                    conflictsMap.set(rel.targetDecision.id, {
                        relationId: rel.id,
                        conflictingDecision: {
                            id: rel.targetDecision.id,
                            title: rel.targetDecision.title,
                            confidence: rel.targetDecision.current_confidence,
                            riskLevel: rel.targetDecision.risk_level,
                            lifecycleState: rel.targetDecision.lifecycle_state
                        },
                        notes: rel.notes,
                        detectedAt: rel.created_at
                    });
                }
            });

            incoming.forEach(function (rel) {
                if (rel.sourceDecision && !conflictsMap.has(rel.sourceDecision.id)) {
                    conflictsMap.set(rel.sourceDecision.id, {
                        relationId: rel.id,
                        conflictingDecision: {
                            id: rel.sourceDecision.id,
                            title: rel.sourceDecision.title,
                            confidence: rel.sourceDecision.current_confidence,
                            riskLevel: rel.sourceDecision.risk_level,
                            lifecycleState: rel.sourceDecision.lifecycle_state
                        },
                        notes: rel.notes,
                        detectedAt: rel.created_at
                    });
                }
            });

            return Array.from(conflictsMap.values());

        } catch (error) {
            console.error('[ConflictDetection] Error getting conflicts:', error);
            return [];
        }
    }

    /**
     * Validate decision data before creation
     */
    async validateDecisionData(decisionData) {
        const errors = [];

        if (!decisionData.title || decisionData.title.trim() === '') {
            errors.push({ field: 'title', message: 'Title is required' });
        }

        if (!decisionData.context || decisionData.context.trim() === '') {
            errors.push({ field: 'context', message: 'Description is required' });
        }

        if (decisionData.initial_confidence < 0 || decisionData.initial_confidence > 100) {
            errors.push({ field: 'initial_confidence', message: 'Confidence must be between 0 and 100' });
        }

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
