import { Router } from 'express';
import { postsController } from '../controllers/posts.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Посты
router.get('/', postsController.getFeedPosts.bind(postsController));
router.post('/', postsController.createPost.bind(postsController));
router.get('/user/:userId', postsController.getUserPosts.bind(postsController));
router.get('/:id', postsController.getPostById.bind(postsController));
router.put('/:id', postsController.updatePost.bind(postsController));
router.delete('/:id', postsController.deletePost.bind(postsController));

// Лайки
router.post('/:id/like', postsController.likePost.bind(postsController));
router.delete('/:id/like', postsController.unlikePost.bind(postsController));
router.get('/:id/likes', postsController.getPostLikes.bind(postsController));

// Комментарии
router.get('/:id/comments', postsController.getPostComments.bind(postsController));
router.post('/:id/comments', postsController.createComment.bind(postsController));
router.delete('/comments/:commentId', postsController.deleteComment.bind(postsController));

export default router;
