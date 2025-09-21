'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Media', 'uploader', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Ibrahim Denis Fofanah',
      comment: 'Uploader name for media files'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Media', 'uploader');
  }
};
