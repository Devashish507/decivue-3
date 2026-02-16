'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create TeamMembers Table
        await queryInterface.createTable('TeamMembers', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            team_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Teams',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.STRING,
                allowNull: false
            },
            user_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            user_avatar: {
                type: Sequelize.STRING
            },
            role: {
                type: Sequelize.ENUM('Owner', 'Reviewer', 'Contributor'),
                defaultValue: 'Contributor'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Create DecisionTeamMaps Table
        await queryInterface.createTable('DecisionTeamMaps', {
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
            team_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Teams',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            owner_id: {
                type: Sequelize.STRING
            },
            reviewer_id: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        // Add index for fast lookups
        await queryInterface.addIndex('TeamMembers', ['team_id']);
        await queryInterface.addIndex('DecisionTeamMaps', ['team_id']);
        await queryInterface.addIndex('DecisionTeamMaps', ['decision_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('DecisionTeamMaps');
        await queryInterface.dropTable('TeamMembers');
    }
};
