'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.Post, { foreignKey: 'postId' });
      Like.belongsTo(models.User, { foreignKey: 'userId', allowNull: true });
    }
  }
  Like.init({
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    ip: { type: DataTypes.STRING, allowNull: true },
  }, {
    sequelize,
    modelName: 'Like',
  });
  return Like;
};
