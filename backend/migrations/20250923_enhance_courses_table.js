const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to Course table
    await queryInterface.addColumn('Courses', 'price', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    });

    await queryInterface.addColumn('Courses', 'currency', {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'USD'
    });

    await queryInterface.addColumn('Courses', 'duration', {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Course duration (e.g., "8 weeks", "3 hours")'
    });

    await queryInterface.addColumn('Courses', 'lessonCount', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Courses', 'videoCount', {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Courses', 'status', {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    });

    await queryInterface.addColumn('Courses', 'categoryId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Courses', 'difficulty', {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: true,
      defaultValue: 'beginner'
    });

    await queryInterface.addColumn('Courses', 'prerequisites', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of prerequisite course IDs or text requirements'
    });

    await queryInterface.addColumn('Courses', 'learningOutcomes', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of learning outcomes/objectives'
    });

    await queryInterface.addColumn('Courses', 'tags', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array of tags'
    });

    await queryInterface.addColumn('Courses', 'featured', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Courses', 'enrollmentCount', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Courses', 'averageRating', {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      comment: 'Average rating from 0.00 to 5.00'
    });

    await queryInterface.addColumn('Courses', 'reviewCount', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns in reverse order
    const columnsToRemove = [
      'reviewCount',
      'averageRating', 
      'enrollmentCount',
      'featured',
      'tags',
      'learningOutcomes',
      'prerequisites',
      'difficulty',
      'categoryId',
      'status',
      'videoCount',
      'lessonCount',
      'duration',
      'currency',
      'price'
    ];

    for (const column of columnsToRemove) {
      await queryInterface.removeColumn('Courses', column);
    }
  }
};