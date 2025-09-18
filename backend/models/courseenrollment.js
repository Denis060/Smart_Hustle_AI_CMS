'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CourseEnrollment extends Model {
    static associate(models) {
      CourseEnrollment.belongsTo(models.Course, { foreignKey: 'courseId' });
      CourseEnrollment.belongsTo(models.Student, { foreignKey: 'studentId' });
    }
  }
  CourseEnrollment.init({
    courseId: DataTypes.INTEGER,
    studentId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CourseEnrollment',
  });
  return CourseEnrollment;
};
