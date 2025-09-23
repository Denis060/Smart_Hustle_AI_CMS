'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsToMany(models.Student, {
        through: models.CourseEnrollment,
        foreignKey: 'courseId',
        otherKey: 'studentId',
      });
      Course.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      Course.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'owner'
      });
    }
  }
  Course.init({
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    ownerId: DataTypes.INTEGER,
    featuredImage: DataTypes.STRING,
    external: DataTypes.BOOLEAN,
    affiliateLink: DataTypes.STRING,
    review: DataTypes.TEXT,
    provider: DataTypes.STRING,
    level: DataTypes.ENUM('beginner', 'medium', 'advanced'),
    // New enhanced fields
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
      defaultValue: 'USD'
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Course duration (e.g., "8 weeks", "3 hours")'
    },
    lessonCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    videoCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: true,
      defaultValue: 'beginner'
    },
    prerequisites: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('prerequisites');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('prerequisites', JSON.stringify(value || []));
      }
    },
    learningOutcomes: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('learningOutcomes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('learningOutcomes', JSON.stringify(value || []));
      }
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('tags');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      }
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    enrollmentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};