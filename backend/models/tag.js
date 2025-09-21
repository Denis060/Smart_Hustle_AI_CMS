'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tag.belongsToMany(models.Post, {
        through: models.PostTag,
        foreignKey: 'tagId',
        otherKey: 'postId',
        as: 'posts'
      });
      Tag.belongsToMany(models.Category, {
        through: 'CategoryTags',
        foreignKey: 'tagId',
        otherKey: 'categoryId',
        as: 'categories'
      });
    }
  }
  Tag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};