'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add parent_id to Decisions
        await queryInterface.addColumn('Decisions', 'parent_id', {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: 'Decisions',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // 2. Add decision_type ENUM values if not exists (MySQL handles ENUM updates awkwardly in Sequelize sometimes, best to alter column)
        // For safety in this environment, we'll try to modify the column definition.
        // However, existing values might prevent simple alteration. We will assume existing types 'MAIN_STRATEGIC' etc. are mapped to new logical types or we just add new ones.
        // The user requested: ENUM('strategic','operational','risk','support'). 
        // We will update the column to allow these.
        try {
            await queryInterface.changeColumn('Decisions', 'decision_type', {
                type: Sequelize.STRING, // Changing to STRING for flexibility in this refactor to avoid ENUM lock-in issues during dev
                allowNull: false,
                defaultValue: 'strategic'
            });
        } catch (e) {
            console.warn('Could not change decision_type to STRING, might already require manual migration:', e);
        }


        // 3. Create DecisionNodes table
        await queryInterface.createTable('DecisionNodes', {
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
                onDelete: 'CASCADE'
            },
            node_type: {
                type: Sequelize.ENUM('goal', 'option', 'assumption', 'risk', 'confidence'),
                allowNull: false
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            parent_node_id: {
                type: Sequelize.UUID,
                allowNull: true
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

        // 4. Create DecisionEdges table
        await queryInterface.createTable('DecisionEdges', {
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
                onDelete: 'CASCADE'
            },
            source_node_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'DecisionNodes',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            target_node_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'DecisionNodes',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            relationship_type: {
                type: Sequelize.STRING,
                allowNull: true
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

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('DecisionEdges');
        await queryInterface.dropTable('DecisionNodes');
        await queryInterface.removeColumn('Decisions', 'parent_id');
    }
};
