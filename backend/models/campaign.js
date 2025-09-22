'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    subject: DataTypes.STRING,
    body: DataTypes.TEXT,
    sentAt: DataTypes.DATE,
    sentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    failCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    openCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Campaign',
  });
  return Campaign;
};