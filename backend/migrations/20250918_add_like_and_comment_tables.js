"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Comments", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      content: { type: Sequelize.TEXT, allowNull: false },
      postId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Posts", key: "id" }, onDelete: "CASCADE" },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: "Users", key: "id" }, onDelete: "SET NULL" },
      name: { type: Sequelize.STRING, allowNull: false },
      approved: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
    await queryInterface.createTable("Likes", {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      postId: { type: Sequelize.INTEGER, allowNull: false, references: { model: "Posts", key: "id" }, onDelete: "CASCADE" },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: "Users", key: "id" }, onDelete: "SET NULL" },
      ip: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable("Likes");
    await queryInterface.dropTable("Comments");
  }
};
