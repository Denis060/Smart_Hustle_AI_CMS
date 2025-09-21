const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateJWT } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/posts'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// POST /api/uploads (for blog post images)
router.post('/', authenticateJWT, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/posts/${req.file.filename}`;
  const uploader = req.body.uploader || 'Ibrahim Denis Fofanah';
  // Optionally, you could save this info to a Media table if you want to track uploads
  res.status(201).json({ url, uploader });
});

module.exports = router;
