const express = require('express');
const router = express.Router();
const { Post, Like, Comment, User } = require('../models');

// Like a post (by user or guest IP)
router.post('/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const userId = req.user ? req.user.id : null;
  const ip = req.ip;
  try {
    // Prevent duplicate like by same user or IP
    const where = userId ? { postId, userId } : { postId, ip };
    const existing = await Like.findOne({ where });
    if (existing) return res.status(400).json({ error: 'Already liked' });
    await Like.create({ postId, userId, ip });
    const count = await Like.count({ where: { postId } });
    res.json({ success: true, count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unlike a post
router.post('/:postId/unlike', async (req, res) => {
  const { postId } = req.params;
  const userId = req.user ? req.user.id : null;
  const ip = req.ip;
  try {
    const where = userId ? { postId, userId } : { postId, ip };
    await Like.destroy({ where });
    const count = await Like.count({ where: { postId } });
    res.json({ success: true, count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get like count
router.get('/:postId/likes', async (req, res) => {
  const { postId } = req.params;
  const count = await Like.count({ where: { postId } });
  res.json({ count });
});

// Add a comment
router.post('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const { name, content } = req.body;
  const userId = req.user ? req.user.id : null;
  if (!name || !content) return res.status(400).json({ error: 'Name and content required' });
  try {
    const comment = await Comment.create({ postId, userId, name, content, approved: true });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get comments for a post
router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.findAll({ where: { postId, approved: true }, order: [['createdAt', 'DESC']] });
  res.json({ comments });
});

module.exports = router;
