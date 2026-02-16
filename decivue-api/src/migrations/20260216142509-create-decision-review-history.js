'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DecisionReviewHistories', {
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
      confidence_snapshot: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      conflict_count_snapshot: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      assumption_count_snapshot: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewed_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      is_shallow_review: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('DecisionReviewHistories');
  }
};
