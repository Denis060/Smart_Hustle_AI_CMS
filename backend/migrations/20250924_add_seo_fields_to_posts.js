'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'metaDescription', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    
    await queryInterface.addColumn('Posts', 'keywords', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Posts', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'metaDescription');
    await queryInterface.removeColumn('Posts', 'keywords');
    await queryInterface.removeColumn('Posts', 'slug');
  }
};