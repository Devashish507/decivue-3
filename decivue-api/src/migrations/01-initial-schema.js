'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Decisions
        await queryInterface.createTable('Decisions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            title: { type: Sequelize.STRING, allowNull: false },
            context: Sequelize.TEXT,
            initial_confidence: { type: Sequelize.INTEGER, defaultValue: 50 },
            current_confidence: { type: Sequelize.INTEGER, defaultValue: 50 },
            risk_level: { type: Sequelize.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
            impact_level: { type: Sequelize.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
            lifecycle_state: { type: Sequelize.ENUM('Draft', 'Active', 'Stale', 'Closed'), defaultValue: 'Draft' },
            parent_decision_id: { type: Sequelize.UUID, allowNull: true },
            last_reviewed_at: Sequelize.DATE,
            review_due_date: Sequelize.DATE,
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        // 2. Assumptions
        await queryInterface.createTable('Assumptions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Decisions', key: 'id' },
                onDelete: 'CASCADE'
            },
            assumption_text: { type: Sequelize.TEXT, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        // 3. DecisionRelations
        await queryInterface.createTable('DecisionRelations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            source_decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Decisions', key: 'id' },
                onDelete: 'CASCADE'
            },
            target_decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Decisions', key: 'id' },
                onDelete: 'CASCADE'
            },
            relation_type: {
                type: Sequelize.ENUM('conflict', 'dependency', 'relates_to'),
                allowNull: false,
                defaultValue: 'relates_to'
            },
            notes: Sequelize.TEXT,
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });

        // 4. DecisionHistories
        await queryInterface.createTable('DecisionHistories', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Decisions', key: 'id' },
                onDelete: 'CASCADE'
            },
            event_type: { type: Sequelize.STRING, allowNull: false },
            description: Sequelize.TEXT,
            previous_value: Sequelize.TEXT,
            new_value: Sequelize.TEXT,
            created_at: { allowNull: false, type: Sequelize.DATE },
            updated_at: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('DecisionHistories');
        await queryInterface.dropTable('DecisionRelations');
        await queryInterface.dropTable('Assumptions');
        await queryInterface.dropTable('Decisions');
    }
};
