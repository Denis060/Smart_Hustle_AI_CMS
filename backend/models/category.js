'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.hasMany(models.Post, { foreignKey: 'categoryId' });
      Category.belongsToMany(models.Tag, {
        through: 'CategoryTags',
        foreignKey: 'categoryId',
        otherKey: 'tagId',
        as: 'tags'
      });
    }
  }
  Category.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};