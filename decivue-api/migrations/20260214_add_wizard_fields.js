'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add new columns to Decisions table
        await queryInterface.addColumn('Decisions', 'decision_type', {
            type: Sequelize.ENUM('MAIN_STRATEGIC', 'SUPPORTING', 'DEPENDENT', 'RISK_MITIGATION'),
            defaultValue: 'MAIN_STRATEGIC',
            allowNull: false
        });

        await queryInterface.addColumn('Decisions', 'category', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('Decisions', 'priority_level', {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
            defaultValue: 'MEDIUM',
            allowNull: false
        });

        await queryInterface.addColumn('Decisions', 'target_review_date', {
            type: Sequelize.DATE,
            allowNull: true
        });

        await queryInterface.addColumn('Decisions', 'confidence_justification', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Create DecisionOptions table
        await queryInterface.createTable('DecisionOptions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Decisions',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            order: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Drop DecisionOptions table
        await queryInterface.dropTable('DecisionOptions');

        // Remove added columns from Decisions table
        await queryInterface.removeColumn('Decisions', 'confidence_justification');
        await queryInterface.removeColumn('Decisions', 'target_review_date');
        await queryInterface.removeColumn('Decisions', 'priority_level');
        await queryInterface.removeColumn('Decisions', 'category');
        await queryInterface.removeColumn('Decisions', 'decision_type');
    }
};
