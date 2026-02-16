'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Decisions', 'review_urgency_score', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('Decisions', 'next_review_date', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Decisions', 'review_escalation_level', {
      type: Sequelize.ENUM('REMINDER', 'HIGH_PRIORITY', 'GOVERNANCE_RISK'),
      allowNull: true
    });

    await queryInterface.addColumn('Decisions', 'postpone_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Decisions', 'review_urgency_score');
    await queryInterface.removeColumn('Decisions', 'next_review_date');
    await queryInterface.removeColumn('Decisions', 'review_escalation_level');
    await queryInterface.removeColumn('Decisions', 'postpone_count');
  }
};
