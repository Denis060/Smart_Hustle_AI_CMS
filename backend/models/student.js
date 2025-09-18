'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsToMany(models.Course, {
        through: models.CourseEnrollment,
        foreignKey: 'studentId',
        otherKey: 'courseId',
      });
    }
  }
  Student.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    interest: DataTypes.STRING,
    motivation: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};
