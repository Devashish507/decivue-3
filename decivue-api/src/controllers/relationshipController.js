const { Decision, DecisionRelation } = require('../models');

// Get all relationships for a decision (EXCLUDING SUB_DECISION - those go in reasoning tree)
exports.getRelationships = async (req, res) => {
    try {
        const decisionId = req.params.id;

        // Get the decision with explicit parent/children hierarchy
        const decisionWithHierarchy = await Decision.findByPk(decisionId, {
            include: [
                { model: Decision, as: 'parent', attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level'] },
                { model: Decision, as: 'children', attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level'] }
            ]
        });

        // Get relationships where this decision is the source (exclude SUB_DECISION)
        const outgoingRelations = await DecisionRelation.findAll({
            where: {
                source_decision_id: decisionId,
                relation_type: {
                    [require('sequelize').Op.ne]: 'SUB_DECISION'
                }
            },
            include: [{
                model: Decision,
                as: 'targetDecision',
                attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level']
            }]
        });

        // Get relationships where this decision is the target (exclude SUB_DECISION)
        const incomingRelations = await DecisionRelation.findAll({
            where: {
                target_decision_id: decisionId,
                relation_type: {
                    [require('sequelize').Op.ne]: 'SUB_DECISION'
                }
            },
            include: [{
                model: Decision,
                as: 'sourceDecision',
                attributes: ['id', 'title', 'lifecycle_state', 'current_confidence', 'risk_level']
            }]
        });

        // Transform to spider diagram format
        const relationships = {
            parent: decisionWithHierarchy?.parent ? {
                id: decisionWithHierarchy.parent.id,
                title: decisionWithHierarchy.parent.title,
                type: 'parent',
                decision: { ...decisionWithHierarchy.parent.dataValues }
            } : null,
            children: decisionWithHierarchy?.children ? decisionWithHierarchy.children.map(c => ({
                id: c.id,
                title: c.title,
                type: 'child',
                decision: { ...c.dataValues }
            })) : [],
            outgoing: outgoingRelations.map(rel => ({
                id: rel.id,
                type: rel.relation_type,
                decision: {
                    id: rel.targetDecision.id,
                    title: rel.targetDecision.title,
                    lifecycleState: rel.targetDecision.lifecycle_state,
                    confidence: rel.targetDecision.current_confidence,
                    riskLevel: rel.targetDecision.risk_level
                },
                notes: rel.notes
            })),
            incoming: incomingRelations.map(rel => ({
                id: rel.id,
                type: rel.relation_type,
                decision: {
                    id: rel.sourceDecision.id,
                    title: rel.sourceDecision.title,
                    lifecycleState: rel.sourceDecision.lifecycle_state,
                    confidence: rel.sourceDecision.current_confidence,
                    riskLevel: rel.sourceDecision.risk_level
                },
                notes: rel.notes
            }))
        };

        res.json({
            success: true,
            data: relationships
        });
    } catch (err) {
        console.error('[API] Error fetching relationships:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get reasoning tree data (options, assumptions, risks, AND sub-decisions)
exports.getReasoningTree = async (req, res) => {
    try {
        const decision = await Decision.findByPk(req.params.id, {
            include: [
                { model: require('../models').Assumption, as: 'assumptions' },
                { model: require('../models').DecisionHistory, as: 'history' },
                { model: require('../models').DecisionNode, as: 'nodes' } // Include new nodes
            ]
        });

        if (!decision) {
            return res.status(404).json({
                success: false,
                message: 'Decision not found'
            });
        }

        // Get sub-decisions (decisions that have this ID as parent_id OR linked via DERIVED_FROM)
        const subDecisionRelations = await DecisionRelation.findAll({
            where: {
                source_decision_id: req.params.id,
                relation_type: {
                    [require('sequelize').Op.or]: ['SUB_DECISION', 'DERIVED_FROM']
                }
            },
            include: [{
                model: Decision,
                as: 'targetDecision',
                attributes: ['id', 'title', 'context', 'current_confidence', 'risk_level', 'lifecycle_state']
            }]
        });

        // Also get decisions where parent_id = this decision (Explicit Hierarchy)
        const directChildren = await Decision.findAll({
            where: { parent_id: req.params.id },
            attributes: ['id', 'title', 'context', 'current_confidence', 'risk_level', 'lifecycle_state']
        });

        // Merge children lists (deduplicating by ID)
        const allChildrenMap = new Map();
        subDecisionRelations.forEach(r => allChildrenMap.set(r.targetDecision.id, r.targetDecision));
        directChildren.forEach(c => allChildrenMap.set(c.id, c));

        const subDecisions = Array.from(allChildrenMap.values()).map(c => ({
            id: c.id,
            type: 'SUB_DECISION',
            title: c.title,
            context: c.context,
            confidence: c.current_confidence,
            riskLevel: c.risk_level,
            lifecycleState: c.lifecycle_state,
            notes: 'Sub-Decision'
        }));


        // Build reasoning tree structure
        // If we have DecisionNodes, use them. Else fall back to legacy.
        let treeData = {};

        if (decision.nodes && decision.nodes.length > 0) {
            // Graph-based
            treeData = {
                mode: 'graph',
                goal: {
                    id: decision.id,
                    type: 'GOAL',
                    title: decision.title,
                    context: decision.context
                },
                nodes: decision.nodes.map(n => ({
                    id: n.id,
                    type: n.node_type.toUpperCase(),
                    text: n.content,
                    parentId: n.parent_node_id
                })),
                subDecisions
            };
        } else {
            // Legacy Fallback
            treeData = {
                mode: 'legacy',
                goal: {
                    id: decision.id,
                    type: 'GOAL',
                    title: decision.title,
                    context: decision.context
                },
                subDecisions,
                assumptions: decision.assumptions?.map(a => ({
                    id: a.id,
                    type: 'ASSUMPTION',
                    text: a.assumption_text,
                    isActive: a.is_active,
                    validatedAt: a.validated_at
                })) || [],
                risks: [
                    {
                        id: `risk-${decision.id}`,
                        type: 'RISK',
                        text: `Risk Level: ${decision.risk_level}`,
                        severity: decision.risk_level
                    }
                ],
                confidenceFactors: [
                    {
                        id: `conf-initial-${decision.id}`,
                        type: 'CONFIDENCE_FACTOR',
                        text: `Initial Confidence: ${decision.initial_confidence}%`,
                        value: decision.initial_confidence
                    },
                    {
                        id: `conf-current-${decision.id}`,
                        type: 'CONFIDENCE_FACTOR',
                        text: `Current Confidence: ${decision.current_confidence}%`,
                        value: decision.current_confidence
                    }
                ]
            };
        }

        res.json({
            success: true,
            data: treeData
        });
    } catch (err) {
        console.error('[API] Error fetching reasoning tree:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Create a new relationship between decisions
exports.createRelationship = async (req, res) => {
    try {
        const { targetDecisionId, relationType, notes } = req.body;

        if (!targetDecisionId || !relationType) {
            return res.status(400).json({
                success: false,
                message: 'targetDecisionId and relationType are required'
            });
        }

        // Verify both decisions exist
        const sourceDecision = await Decision.findByPk(req.params.id);
        const targetDecision = await Decision.findByPk(targetDecisionId);

        if (!sourceDecision || !targetDecision) {
            return res.status(404).json({
                success: false,
                message: 'Source or target decision not found'
            });
        }

        // Create relationship
        const relationship = await DecisionRelation.create({
            source_decision_id: req.params.id,
            target_decision_id: targetDecisionId,
            relation_type: relationType,
            notes: notes || null
        });

        res.json({
            success: true,
            data: relationship
        });
    } catch (err) {
        console.error('[API] Error creating relationship:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
