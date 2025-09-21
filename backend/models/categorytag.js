'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategoryTag extends Model {
    static associate(models) {
      // Many-to-many handled in Category and Tag
    }
  }
  CategoryTag.init({
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Categories', key: 'id' }
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Tags', key: 'id' }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CategoryTag',
    tableName: 'CategoryTags',
    timestamps: true
  });
  return CategoryTag;
};
