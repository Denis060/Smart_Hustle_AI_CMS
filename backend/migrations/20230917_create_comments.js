"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comments", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      author: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'pending' },
      postId: {
        type: Sequelize.INTEGER,
        references: { model: 'posts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("comments");
  }
};
