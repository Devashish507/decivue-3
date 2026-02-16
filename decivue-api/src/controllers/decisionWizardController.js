const { Decision, DecisionRelation, DecisionHistory, DecisionNode, DecisionEdge } = require('../models');
const reasoningTreeGenerator = require('../services/reasoningTreeGenerator');
const conflictDetectionService = require('../services/conflictDetectionService');
const healthService = require('../services/healthService');

/**
 * Create a new decision through the wizard
 * POST /api/decisions/wizard/create
 */
exports.createDecisionFromWizard = async (req, res) => {
    try {
        const wizardData = req.body;
        console.log('[Wizard] Creating decision from wizard data');

        // Validate decision data
        const validationErrors = await conflictDetectionService.validateDecisionData({
            title: wizardData.basics.title,
            context: wizardData.basics.description,
            initial_confidence: wizardData.basics.initialConfidence
        });

        if (validationErrors.length > 0) {
            const criticalErrors = validationErrors.filter(e => e.severity !== 'WARNING');
            if (criticalErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: criticalErrors
                });
            }
        }

        // Handle Parent ID
        // Check context first (locked parent), then basics (user selected)
        const parentId = wizardData.context?.parentDecisionId || wizardData.basics?.parentDecisionId || null;

        console.log('---------------------------------------------------');
        console.log('[Wizard] Incoming Data Basics:', JSON.stringify(wizardData.basics, null, 2));
        console.log('[Wizard] Incoming Data Context:', JSON.stringify(wizardData.context, null, 2));
        console.log('[Wizard] Extracted Parent ID:', parentId);
        console.log('---------------------------------------------------');

        // Create the decision
        const decision = await Decision.create({
            title: wizardData.basics.title,
            context: wizardData.basics.description,
            decision_type: wizardData.type.decisionType,
            parent_id: parentId, // Explicit hierarchy
            category: wizardData.basics.category,
            priority_level: wizardData.basics.priorityLevel,
            impact_level: wizardData.basics.impactLevel,
            initial_confidence: wizardData.basics.initialConfidence,
            current_confidence: wizardData.basics.initialConfidence,
            risk_level: wizardData.basics.riskLevel || 'Medium',
            target_review_date: wizardData.basics.targetReviewDate,
            confidence_justification: wizardData.reasoning?.confidenceJustification,
            lifecycle_state: 'Draft'
        });

        console.log(`[Wizard] Decision created: ${decision.id} (Parent: ${parentId})`);

        // Generate reasoning tree (using new Nodes/Edges if applicable)
        // For now, we still use the generator service but we'll also populate the new tables
        const tree = await reasoningTreeGenerator.generateTreeFromWizard(wizardData, decision.id); // Legacy support

        // Populate new Graph Tables (Nodes/Edges)
        await exports.createGraphNodes(decision.id, wizardData.reasoning);

        // Create relationships
        if (wizardData.relationships && wizardData.relationships.length > 0) {
            await exports.createRelationships(decision.id, wizardData.relationships);
            console.log(`[Wizard] Created ${wizardData.relationships.length} relationships`);
        }

        // If parent exists, create relationship link purely for spider visualization if not already covered
        if (parentId) {
            const relType = wizardData.context.relationshipType || 'DERIVED_FROM';
            // Check if not already created in relationships array
            const alreadyLinked = wizardData.relationships && wizardData.relationships.find(r => r.targetDecisionId === parentId);

            if (!alreadyLinked) {
                await DecisionRelation.create({
                    source_decision_id: parentId,
                    target_decision_id: decision.id,
                    relation_type: relType,
                    notes: 'Created as Sub-Decision'
                });
                // Inverse
                const inverseType = getInverseRelationType(relType);
                if (inverseType) {
                    await DecisionRelation.create({
                        source_decision_id: decision.id,
                        target_decision_id: parentId,
                        relation_type: inverseType,
                        notes: `Inverse of: ${relType}`
                    });
                }
            }
        }

        // Create initial history event
        await DecisionHistory.create({
            decision_id: decision.id,
            event_type: 'CREATED',
            description: 'Decision created through wizard',
            metadata: JSON.stringify({
                decision_type: decision.decision_type,
                category: decision.category,
                initial_confidence: decision.initial_confidence,
                parent_id: parentId
            })
        });

        // Calculate initial health
        const healthResult = await healthService.calculateHealth(decision);

        // Return complete decision
        const completeDecision = {
            ...decision.toJSON(),
            calculated_health: {
                score: healthResult.healthScore,
                status: healthResult.newHealthStatus,
                conflict_count: healthResult.conflicts
            },
            reasoning_tree: tree,
            relationships: wizardData.relationships || []
        };

        res.status(201).json({
            success: true,
            data: completeDecision,
            message: 'Decision created successfully'
        });

    } catch (error) {
        console.error('[Wizard] Error creating decision:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Helper: Populate Graph Nodes and Edges
 */
exports.createGraphNodes = async (decisionId, reasoningData) => {
    try {
        if (!reasoningData) return;

        // 1. Goal Node
        const goalContent = reasoningData.goal || reasoningData.goalDefinition || 'Goal';
        const goalNode = await DecisionNode.create({
            decision_id: decisionId,
            node_type: 'goal',
            content: goalContent,
            parent_node_id: null
        });

        // 2. Options
        if (reasoningData.options && Array.isArray(reasoningData.options)) {
            for (const opt of reasoningData.options) {
                const optContent = opt.text || opt.title || (typeof opt === 'string' ? opt : 'Option');
                const optNode = await DecisionNode.create({
                    decision_id: decisionId,
                    node_type: 'option',
                    content: optContent,
                    parent_node_id: goalNode.id
                });

                // Edge: Goal -> Option
                await DecisionEdge.create({
                    decision_id: decisionId,
                    source_node_id: goalNode.id,
                    target_node_id: optNode.id,
                    relationship_type: 'has_option'
                });
            }
        }

        // 3. Assumptions (Linked to Goal for now, or specifc options if data allowed)
        if (reasoningData.assumptions && Array.isArray(reasoningData.assumptions)) {
            for (const asm of reasoningData.assumptions) {
                const asmNode = await DecisionNode.create({
                    decision_id: decisionId,
                    node_type: 'assumption',
                    content: asm.text || asm,
                    parent_node_id: goalNode.id
                });

                // Edge: Goal -> Assumption
                await DecisionEdge.create({
                    decision_id: decisionId,
                    source_node_id: goalNode.id,
                    target_node_id: asmNode.id,
                    relationship_type: 'based_on'
                });
            }
        }

        // 4. Risks
        if (reasoningData.risks && Array.isArray(reasoningData.risks)) {
            for (const risk of reasoningData.risks) {
                const riskNode = await DecisionNode.create({
                    decision_id: decisionId,
                    node_type: 'risk',
                    content: risk.text || risk,
                    parent_node_id: goalNode.id
                });
                // Edge: Goal -> Risk
                await DecisionEdge.create({
                    decision_id: decisionId,
                    source_node_id: goalNode.id,
                    target_node_id: riskNode.id,
                    relationship_type: 'has_risk'
                });
            }
        }

    } catch (e) {
        console.error("Failed to create graph nodes:", e);
        // Don't fail the whole request
    }
};
exports.validateWizardData = async (req, res) => {
    try {
        const wizardData = req.body;

        // Validate basic data
        const validationErrors = await conflictDetectionService.validateDecisionData({
            title: wizardData.basics.title,
            context: wizardData.basics.description,
            initial_confidence: wizardData.basics.initialConfidence
        });

        // Detect conflicts with proposed relationships
        let conflictWarnings = [];
        if (wizardData.relationships && wizardData.relationships.length > 0) {
            const decisionData = {
                category: wizardData.basics.category,
                priority_level: wizardData.basics.priorityLevel,
                impact_level: wizardData.basics.impactLevel,
                target_review_date: wizardData.basics.targetReviewDate,
                decision_type: wizardData.type?.decisionType
            };

            conflictWarnings = await conflictDetectionService.detectConflicts(
                decisionData,
                wizardData.relationships.map(r => ({
                    targetId: r.targetDecisionId,
                    type: r.relationType
                }))
            );
        }

        res.json({
            success: true,
            data: {
                isValid: validationErrors.filter(e => e.severity !== 'WARNING').length === 0,
                validationErrors,
                conflictWarnings
            }
        });

    } catch (error) {
        console.error('[Wizard] Error validating wizard data:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Search decisions for relationship builder
 * GET /api/decisions/search?q=query&category=&type=
 */
exports.searchDecisions = async (req, res) => {
    try {
        const { q, category, type, limit = 20 } = req.query;

        const where = {};

        if (q) {
            where.title = { [require('sequelize').Op.like]: `%${q}%` };
        }

        if (category) {
            where.category = category;
        }

        if (type) {
            where.decision_type = type;
        }

        const decisions = await Decision.findAll({
            where,
            attributes: ['id', 'title', 'category', 'decision_type', 'current_confidence', 'lifecycle_state', 'risk_level'],
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: decisions
        });

    } catch (error) {
        console.error('[Wizard] Error searching decisions:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Helper: Create bidirectional relationships
 */
exports.createRelationships = async (sourceDecisionId, relationships) => {
    for (const rel of relationships) {
        // Create forward relationship
        await DecisionRelation.create({
            source_decision_id: sourceDecisionId,
            target_decision_id: rel.targetDecisionId,
            relation_type: rel.relationType,
            notes: rel.notes || null
        });

        // Create inverse relationship (bidirectional)
        const inverseType = getInverseRelationType(rel.relationType);
        if (inverseType) {
            await DecisionRelation.create({
                source_decision_id: rel.targetDecisionId,
                target_decision_id: sourceDecisionId,
                relation_type: inverseType,
                notes: `Inverse of: ${rel.relationType}`
            });
        }
    }
};

/**
 * Helper: Get inverse relationship type
 */
function getInverseRelationType(type) {
    const inverseMap = {
        'DEPENDS_ON': 'SUPPORTS',
        'SUPPORTS': 'DEPENDS_ON',
        'CONFLICTS_WITH': 'CONFLICTS_WITH',
        'DERIVED_FROM': 'RELATES_TO',
        'RELATES_TO': 'RELATES_TO'
    };
    return inverseMap[type] || null;
}
