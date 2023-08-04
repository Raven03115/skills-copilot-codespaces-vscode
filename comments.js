// Create  web server

// Import modules
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

// Import models
const Comment = require('../models/comment.js');

// Import middleware
const auth = require('../middleware/auth.js');

// @route   GET api/comments
// @desc    Get all comments
// @access  Public
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ date: -1 });
    res.json(comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error (GET api/comments)');
  }
});

// @route   POST api/comments
// @desc    Add new comment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('content', 'Content is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If there are errors, return 400 (bad request)
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request
    const { content } = req.body;

    try {
      // Create new comment
      const newComment = new Comment({
        content,
        user: req.user.id
      });

      // Save to database
      const comment = await newComment.save();

      // Return comment
      res.json(comment);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error (POST api/comments)');
    }
  }
);

// @route   PUT api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  // Extract data from request
  const { content } = req.body;

  // Build comment object
  const commentFields = {};
  if (content) commentFields.content = content;

  try {
    // Find comment by id
    let comment = await Comment.findById(req.params.id);

    // Check if comment exists
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });

    // Check if user is owner of comment