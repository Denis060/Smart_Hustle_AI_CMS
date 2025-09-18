const express = require('express');
const router = express.Router();
const { Comment, Post, User } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all comments (optionally filter by post)
router.get('/', async (req, res) => {
  const where = req.query.postId ? { postId: req.query.postId } : {};
  const comments = await Comment.findAll({ where, include: [Post, User] });
  res.json(comments);
});

// Create comment (public)
router.post('/', async (req, res) => {
  try {
    const { content, postId, userId } = req.body;
    const comment = await Comment.create({ content, postId, userId, approved: false });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Approve comment (admin only)
router.put('/:id/approve', authenticateJWT, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    await comment.update({ approved: true });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete comment (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    await comment.destroy();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
