import { Router } from 'express';
import { postsController } from '../controllers/posts.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createContentLimiter } from '../config/rate-limit';
import {
  createPostSchema,
  updatePostSchema,
  deletePostSchema,
  getPostSchema,
  createCommentSchema,
  deleteCommentSchema,
  likePostSchema,
  unlikePostSchema,
  getPostsSchema,
} from '../validators/posts.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Посты
router.get('/', validate(getPostsSchema), postsController.getFeedPosts.bind(postsController));
router.post('/', createContentLimiter, validate(createPostSchema), postsController.createPost.bind(postsController));
router.get('/user/:userId', postsController.getUserPosts.bind(postsController));
router.get('/:id', validate(getPostSchema), postsController.getPostById.bind(postsController));
router.put('/:id', validate(updatePostSchema), postsController.updatePost.bind(postsController));
router.delete('/:id', validate(deletePostSchema), postsController.deletePost.bind(postsController));

// Лайки
router.post('/:id/like', validate(likePostSchema), postsController.likePost.bind(postsController));
router.delete('/:id/like', validate(unlikePostSchema), postsController.unlikePost.bind(postsController));
router.get('/:id/likes', postsController.getPostLikes.bind(postsController));

// Комментарии
router.get('/:id/comments', postsController.getPostComments.bind(postsController));
router.post('/:id/comments', createContentLimiter, validate(createCommentSchema), postsController.createComment.bind(postsController));
router.delete('/comments/:commentId', validate(deleteCommentSchema), postsController.deleteComment.bind(postsController));

export default router;
