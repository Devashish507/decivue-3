'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Drop the existing enum constraint
        await queryInterface.sequelize.query(`
      ALTER TABLE DecisionRelations 
      MODIFY COLUMN relation_type ENUM(
        'DEPENDS_ON',
        'SUPPORTS', 
        'CONFLICTS_WITH',
        'DERIVED_FROM',
        'SUB_DECISION',
        'RELATES_TO'
      ) NOT NULL DEFAULT 'RELATES_TO';
    `);
    },

    down: async (queryInterface, Sequelize) => {
        // Revert to old enum values
        await queryInterface.sequelize.query(`
      ALTER TABLE DecisionRelations 
      MODIFY COLUMN relation_type ENUM(
        'conflict',
        'dependency',
        'relates_to'
      ) NOT NULL DEFAULT 'relates_to';
    `);
    }
};
