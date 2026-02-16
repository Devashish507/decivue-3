const { Decision, Assumption, DecisionRelation } = require('../models');
const { Op } = require('sequelize');

class TreeService {
    /**
     * Fetches the tree structure for a given root decision.
     * If the decision is part of a larger tree, this fetches the SUBTREE starting at `decisionId`.
     */
    async getTree(decisionId) {
        const root = await Decision.findByPk(decisionId, {
            include: [
                { model: Assumption, as: 'assumptions' },
                {
                    model: Decision,
                    as: 'children',
                    include: [{ model: Assumption, as: 'assumptions' }] // Include assumptions for immediate children
                }
            ]
        });

        if (!root) return null;

        // Recursively fetch children
        // Note: For deep trees, a raw CTE query is better. For this scale, recursion in JS is fine.
        const tree = root.toJSON();
        tree.children = await this.fetchChildrenRecursive(root.id);

        return tree;
    }

    async fetchChildrenRecursive(parentId) {
        const children = await Decision.findAll({
            where: { parent_decision_id: parentId },
            include: [{ model: Assumption, as: 'assumptions' }]
        });

        if (children.length === 0) return [];

        const childrenWithSubtrees = await Promise.all(children.map(async (child) => {
            const childJson = child.toJSON();
            childJson.children = await this.fetchChildrenRecursive(child.id);
            return childJson;
        }));

        return childrenWithSubtrees;
    }
}

module.exports = new TreeService();
