import { Router } from 'express';
import { channelsController } from '../controllers/channels.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Каналы
router.get('/', channelsController.getChannels.bind(channelsController));
router.post('/', channelsController.createChannel.bind(channelsController));
router.get('/subscriptions', channelsController.getUserSubscriptions.bind(channelsController));
router.get('/:id', channelsController.getChannelById.bind(channelsController));
router.put('/:id', channelsController.updateChannel.bind(channelsController));
router.delete('/:id', channelsController.deleteChannel.bind(channelsController));

// Подписки
router.post('/:id/subscribe', channelsController.subscribe.bind(channelsController));
router.delete('/:id/subscribe', channelsController.unsubscribe.bind(channelsController));
router.get('/:id/subscribers', channelsController.getSubscribers.bind(channelsController));

// Посты канала
router.get('/:id/posts', channelsController.getChannelPosts.bind(channelsController));
router.post('/:id/posts', channelsController.createPost.bind(channelsController));
router.delete('/posts/:postId', channelsController.deletePost.bind(channelsController));
router.post('/posts/:postId/view', channelsController.incrementPostViews.bind(channelsController));

export default router;
