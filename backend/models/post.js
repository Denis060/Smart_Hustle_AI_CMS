'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'authorId' });
      Post.belongsTo(models.Category, { foreignKey: 'categoryId' });
      Post.belongsToMany(models.Tag, {
        through: models.PostTag,
        foreignKey: 'postId',
        otherKey: 'tagId',
        as: 'tags'
      });
    }
  }
  Post.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    featuredImage: DataTypes.STRING,
    categoryId: DataTypes.INTEGER,
    authorId: DataTypes.INTEGER,
    published: DataTypes.BOOLEAN,
    // SEO fields (matching existing database schema)
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    excerpt: DataTypes.TEXT,
    metaDescription: DataTypes.STRING(160),
    metaKeywords: DataTypes.STRING,
    readingTime: DataTypes.INTEGER,
    scheduledAt: DataTypes.DATE,
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};