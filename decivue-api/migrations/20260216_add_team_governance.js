'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Create Teams Table
        await queryInterface.createTable('Teams', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            members: {
                type: Sequelize.JSON,
                defaultValue: []
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

        // 2. Add Governance Columns to Decisions
        await queryInterface.addColumn('Decisions', 'is_governance_required', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });

        await queryInterface.addColumn('Decisions', 'governance_status', {
            type: Sequelize.ENUM('Draft', 'Pending Approval', 'Approved', 'Rejected'),
            defaultValue: 'Draft'
        });

        await queryInterface.addColumn('Decisions', 'owner_id', {
            type: Sequelize.STRING
        });

        await queryInterface.addColumn('Decisions', 'reviewer_id', {
            type: Sequelize.STRING
        });

        await queryInterface.addColumn('Decisions', 'team_id', {
            type: Sequelize.UUID,
            references: {
                model: 'Teams',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // 3. Create AuditLogs Table
        await queryInterface.createTable('AuditLogs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            decision_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Decisions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.STRING
            },
            user_name: {
                type: Sequelize.STRING
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            justification: {
                type: Sequelize.TEXT
            },
            details: {
                type: Sequelize.JSON
            },
            timestamp: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('AuditLogs');

        await queryInterface.removeColumn('Decisions', 'team_id');
        await queryInterface.removeColumn('Decisions', 'reviewer_id');
        await queryInterface.removeColumn('Decisions', 'owner_id');
        await queryInterface.removeColumn('Decisions', 'governance_status');
        await queryInterface.removeColumn('Decisions', 'is_governance_required');

        // Note: Removing ENUM type might require specific dialect query depending on DB

        await queryInterface.dropTable('Teams');
    }
};
