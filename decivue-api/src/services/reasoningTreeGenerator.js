/**
 * Reasoning Tree Generator Service
 * Auto-generates reasoning tree structure from wizard input
 */

const { DecisionOption, Assumption } = require('../models');

class ReasoningTreeGenerator {
    /**
     * Generate complete reasoning tree from wizard data
     * @param {Object} wizardData - Complete wizard form data
     * @param {string} decisionId - ID of the created decision
     * @returns {Promise<Object>} Generated tree structure
     */
    async generateTreeFromWizard(wizardData, decisionId) {
        const { reasoning } = wizardData;

        // Create decision options
        const options = await this.createOptions(decisionId, reasoning.options || []);

        // Create assumptions
        const assumptions = await this.createAssumptions(decisionId, reasoning.assumptions || []);

        // Build tree structure
        const tree = {
            goal: {
                id: decisionId,
                type: 'GOAL',
                title: wizardData.basics.title,
                description: reasoning.goalDefinition
            },
            options: options.map(opt => ({
                id: opt.id,
                type: 'OPTION',
                title: opt.title,
                description: opt.description,
                order: opt.order
            })),
            assumptions: assumptions.map(assumption => ({
                id: assumption.id,
                type: 'ASSUMPTION',
                text: assumption.assumption_text,
                isActive: assumption.is_active
            })),
            risks: (reasoning.risks || []).map((risk, index) => ({
                id: `risk-${decisionId}-${index}`,
                type: 'RISK',
                text: risk.text || risk,
                severity: risk.severity || wizardData.basics.riskLevel
            })),
            confidenceFactors: [
                {
                    id: `conf-initial-${decisionId}`,
                    type: 'CONFIDENCE_FACTOR',
                    text: `Initial Confidence: ${wizardData.basics.initialConfidence}%`,
                    value: wizardData.basics.initialConfidence,
                    justification: reasoning.confidenceJustification
                }
            ]
        };

        return tree;
    }

    /**
     * Create decision options in database
     */
    async createOptions(decisionId, optionsData) {
        if (!optionsData || optionsData.length === 0) return [];

        const options = optionsData.map((opt, index) => ({
            decision_id: decisionId,
            title: opt.title,
            description: opt.description,
            order: opt.order !== undefined ? opt.order : index
        }));

        return await DecisionOption.bulkCreate(options);
    }

    /**
     * Create assumptions in database
     */
    async createAssumptions(decisionId, assumptionsData) {
        if (!assumptionsData || assumptionsData.length === 0) return [];

        const assumptions = assumptionsData.map(assumption => ({
            decision_id: decisionId,
            assumption_text: typeof assumption === 'string' ? assumption : assumption.text,
            is_active: true,
            validated_at: null
        }));

        return await Assumption.bulkCreate(assumptions);
    }

    /**
     * Generate tree hierarchy with parent-child relationships
     */
    createTreeHierarchy(nodes) {
        // Goal is root
        // Options are children of goal
        // Assumptions are children of options
        // Risks are children of assumptions
        // Confidence factors are leaves

        const hierarchy = {
            root: nodes.goal,
            levels: [
                { type: 'OPTIONS', nodes: nodes.options, parent: 'goal' },
                { type: 'ASSUMPTIONS', nodes: nodes.assumptions, parent: 'options' },
                { type: 'RISKS', nodes: nodes.risks, parent: 'assumptions' },
                { type: 'CONFIDENCE', nodes: nodes.confidenceFactors, parent: 'risks' }
            ]
        };

        return hierarchy;
    }
}

module.exports = new ReasoningTreeGenerator();
