'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add columns to Decisions table
        await queryInterface.addColumn('Decisions', 'progress_percentage', {
            type: Sequelize.FLOAT,
            defaultValue: 0
        });

        // Note: decision_type already exists. We will ensure it supports 'MAIN_STRATEGIC' (Main) and 'SUB_DECISION' (Sub).
        // Existing types: 'strategic', 'operational', 'risk', 'support', 'MAIN_STRATEGIC', 'SUB_DECISION'
        // We will stick to these for now to avoid altering the ENUM type which can be tricky in some DBs without raw queries.

        // 2. Create SubDecisionTracking table
        await queryInterface.createTable('SubDecisionTracking', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            sub_decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Decisions',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            status: {
                type: Sequelize.ENUM('Pending', 'In Progress', 'Completed'),
                defaultValue: 'Pending'
            },
            weight: {
                type: Sequelize.FLOAT,
                defaultValue: 1.0
            },
            completion_percentage: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // 3. Ensure DecisionRelations exists (it does, skipping)
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('SubDecisionTracking');
        await queryInterface.removeColumn('Decisions', 'progress_percentage');
    }
};
