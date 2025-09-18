"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Only add 'description' column, since 'level' already exists
    await queryInterface.addColumn('Courses', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Only remove 'description' column, do not touch 'level'
    await queryInterface.removeColumn('Courses', 'description');
  },
};
