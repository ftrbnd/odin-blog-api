const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

// GET the comments from a specific post
exports.comments_index = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id, 'comments').populate('comments').exec();
    const comments = post.comments;

    res.json({ comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

exports.comments_create = [
  body('text').trim().isLength({ min: 1 }).escape().withMessage('Text content must be specified'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const post = await Post.findById(req.params.id, 'comments').populate('comments').exec();

    const comment = new Comment({
      text: req.body.text,
      timestamp: new Date(),
      author: res.locals.currentUser
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Comment validation error', errors: errors.array() });
    } else {
      post.comments.push(comment);

      await post.save();
      await comment.save();

      res.json(comment);
    }
  })
];

exports.comment_get = [
  getComment,
  (_req, res) => {
    res.json(res.comment);
  }
];

exports.comment_update = [
  getComment,
  async (req, res) => {
    if (req.body.text) {
      res.comment.text = req.body.text;
    }

    try {
      const comment = await res.comment.save();
      res.json(comment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

exports.comment_delete = [
  getComment,
  async (_req, res) => {
    try {
      await Comment.findByIdAndDelete(res.comment._id);
      res.json({ message: 'Deleted comment' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// Custom middleware for getting a specific comment
async function getComment(req, res, next) {
  let comment;
  try {
    comment = await Comment.findById(req.params.commentId).exec();
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.comment = comment;
  next();
}
