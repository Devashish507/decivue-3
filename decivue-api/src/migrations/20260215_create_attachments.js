'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('DecisionAttachments', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
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
            file_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            file_url: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            public_id: {
                type: Sequelize.STRING,
                allowNull: false
            },
            resource_type: {
                type: Sequelize.STRING,
                allowNull: true
            },
            file_size: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            uploaded_by: {
                type: Sequelize.UUID,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('DecisionAttachments', ['decision_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('DecisionAttachments');
    }
};
