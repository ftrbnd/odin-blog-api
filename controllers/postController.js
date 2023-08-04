const Post = require('../models/Post');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.posts_index = asyncHandler(async (_req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: 1 }).exec();

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

exports.posts_create = [
  body('title').trim().isLength({ min: 1 }).escape().withMessage('Title must be specified'),
  body('text').trim().isLength({ min: 1 }).escape().withMessage('Text content must be specified'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      timestamp: new Date(),
      author: res.locals.currentUser,
      published: true
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Post validation error', errors: errors.array() });
    } else {
      await post.save();
      res.json(post);
    }
  })
];

exports.post_get = [
  getPost,
  (_req, res) => {
    res.json(res.post);
  }
];

exports.post_update = [
  getPost,
  async (req, res) => {
    if (req.body.title) {
      res.post.title = req.body.title;
    }
    if (req.body.text) {
      res.post.text = req.body.text;
    }

    try {
      const updatedPost = await res.post.save();
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
];

exports.post_delete = [
  getPost,
  async (_req, res) => {
    try {
      await Post.findByIdAndDelete(res.post._id);
      res.json({ message: 'Deleted post' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

// Custom middleware for getting a specific post
async function getPost(req, res, next) {
  let post;
  try {
    post = await Post.findById(req.params.id).exec();
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.post = post;
  next();
}
