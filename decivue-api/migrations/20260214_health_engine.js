'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add columns to Decisions
        await queryInterface.addColumn('Decisions', 'start_date', {
            type: Sequelize.DATE,
            allowNull: true
        });
        await queryInterface.addColumn('Decisions', 'target_date', {
            type: Sequelize.DATE,
            allowNull: true
        });
        await queryInterface.addColumn('Decisions', 'expected_duration_days', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
        await queryInterface.addColumn('Decisions', 'health_score', {
            type: Sequelize.FLOAT,
            defaultValue: 100
        });
        await queryInterface.addColumn('Decisions', 'last_progress_update', {
            type: Sequelize.DATE,
            allowNull: true
        });

        // 2. Create DecisionProgressHistory Table
        await queryInterface.createTable('DecisionProgressHistories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            decision_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Decisions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            recorded_progress: {
                type: Sequelize.FLOAT
            },
            recorded_confidence: {
                type: Sequelize.FLOAT
            },
            recorded_health: {
                type: Sequelize.FLOAT
            },
            recorded_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // 3. Create DecisionReviews Table
        await queryInterface.createTable('DecisionReviews', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            decision_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Decisions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            review_date: {
                type: Sequelize.DATE
            },
            status: {
                type: Sequelize.ENUM('Pending', 'Completed', 'Overdue'),
                defaultValue: 'Pending'
            },
            notes: {
                type: Sequelize.TEXT
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('DecisionReviews');
        await queryInterface.dropTable('DecisionProgressHistories');
        await queryInterface.removeColumn('Decisions', 'last_progress_update');
        await queryInterface.removeColumn('Decisions', 'health_score');
        await queryInterface.removeColumn('Decisions', 'expected_duration_days');
        await queryInterface.removeColumn('Decisions', 'target_date');
        await queryInterface.removeColumn('Decisions', 'start_date');
    }
};
