const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');

router.get('/', (_req, res) => {
  res.json({ message: 'Blog API Index' });
});

// USERS //

// GET ALL USERS
router.get('/users', userController.users_index);

// SIGN UP USER
router.post('/users/signup', userController.sign_up);

// LOG IN USER
router.post('/users/login', userController.log_in);

router.post('/users/refreshToken', userController.refresh_token);

router.get('/users/me', userController.user_detail);

// LOG OUT USER
router.get('/users/logout', userController.log_out);

// GET ONE USER
router.get('/users/:id', userController.user_get);

// UPDATE USER
router.patch('/users/:id', userController.user_update);

// DELETE USER
router.delete('/users/:id', userController.user_delete);

// POSTS //

// GET ALL POSTS
router.get('/posts', postController.posts_index);

// CREATE POST
router.post('/posts/create', postController.posts_create);

// GET ONE POST
router.get('/posts/:id', postController.post_get);

// UPDATE POST
router.patch('/posts/:id', postController.post_update);

// DELETE POST
router.delete('/posts/:id', postController.post_delete);

// COMMENTS //

// GET ALL POST COMMENTS
router.get('/posts/:id/comments', commentController.comments_index);

// CREATE COMMENT
router.post('/posts/:id/comments/create', commentController.comments_create);

// GET ONE COMMENT
router.get('/posts/:id/comments/:commentId', commentController.comment_get);

// UPDATE COMMENT
router.patch('/posts/:id/comments/:commentId', commentController.comment_update);

// DELETE COMMENT
router.delete('/posts/:id/comments/:commentId', commentController.comment_delete);

module.exports = router;
