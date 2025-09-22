'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Campaigns', 'sentCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Campaigns', 'failCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Campaigns', 'openCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Campaigns', 'sentCount');
    await queryInterface.removeColumn('Campaigns', 'failCount');
    await queryInterface.removeColumn('Campaigns', 'openCount');
  }
};
