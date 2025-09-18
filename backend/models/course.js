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
    level: DataTypes.ENUM('beginner', 'medium', 'advanced')
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};