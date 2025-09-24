const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateJWT } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// POST /api/uploads (for blog post images)
router.post('/', authenticateJWT, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.log('Multer error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('Upload request received:', {
      file: req.file ? { originalname: req.file.originalname, size: req.file.size } : 'No file',
      user: req.user ? req.user.id : 'No user',
      body: req.body
    });
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const url = `/uploads/${req.file.filename}`;
    const uploader = req.body.uploader || 'Ibrahim Denis Fofanah';
    
    console.log('Upload successful:', { url, uploader });
    
    // Optionally, you could save this info to a Media table if you want to track uploads
    res.status(201).json({ url, uploader });
  });
});

module.exports = router;
