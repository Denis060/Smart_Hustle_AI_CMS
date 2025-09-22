"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Subscribers", "unsubscribed", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn("Subscribers", "unsubscribeToken", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("Subscribers", "unsubscribed");
    await queryInterface.removeColumn("Subscribers", "unsubscribeToken");
  }
};
