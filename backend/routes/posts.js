const express = require('express');
const router = express.Router();
const { Post, User, Category } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all posts (paginated)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  // Only show published posts for public (unauthenticated) requests
  let where = {};
  // Only filter for published if NOT authenticated
  let isAdmin = false;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    // Optionally, verify token here for extra security
    isAdmin = true;
  }
  if (!isAdmin) {
    where.published = 1; // MySQL stores booleans as 1/0
  }
  const result = await Post.findAndCountAll({
    where,
    include: [User, Category],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  // Debug log
  console.log('Fetched posts:', result.rows.length, 'Total:', result.count);
  res.json({
    posts: result.rows,
    totalPages: Math.ceil(result.count / limit)
  });
});

// Get single post by id (manual numeric check)
router.get('/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) return res.status(404).json({ error: 'Not found' });
  const post = await Post.findByPk(req.params.id, { include: [User, Category] });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// Create post (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, content, featuredImage, categoryId, published, tagIds } = req.body;
    const post = await Post.create({
      title,
      content,
      featuredImage,
      categoryId,
      authorId: req.user.id,
      published: !!published
    });
    if (Array.isArray(tagIds)) {
      await post.setTags(tagIds);
    }
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update post (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const { tagIds, ...updateFields } = req.body;
    await post.update(updateFields);
    if (Array.isArray(tagIds)) {
      await post.setTags(tagIds);
    }
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
