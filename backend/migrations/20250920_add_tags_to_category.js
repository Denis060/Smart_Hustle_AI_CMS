'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Categories', 'tags', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      comment: 'Comma-separated tags for the category'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Categories', 'tags');
  }
};
