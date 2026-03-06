import { Router } from 'express';
import { channelsController } from '../controllers/channels.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createContentLimiter } from '../config/rate-limit';
import {
  getChannelsSchema,
  createChannelSchema,
  getChannelByIdSchema,
  updateChannelSchema,
  deleteChannelSchema,
  subscribeSchema,
  getSubscribersSchema,
  getChannelPostsSchema,
  createChannelPostSchema,
  deleteChannelPostSchema,
  incrementPostViewsSchema,
} from '../validators/channels.validator';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Каналы
router.get('/', validate(getChannelsSchema), channelsController.getChannels.bind(channelsController));
router.post('/', createContentLimiter, validate(createChannelSchema), channelsController.createChannel.bind(channelsController));
router.get('/subscriptions', channelsController.getUserSubscriptions.bind(channelsController));
router.get('/:id', validate(getChannelByIdSchema), channelsController.getChannelById.bind(channelsController));
router.put('/:id', validate(updateChannelSchema), channelsController.updateChannel.bind(channelsController));
router.delete('/:id', validate(deleteChannelSchema), channelsController.deleteChannel.bind(channelsController));

// Подписки
router.post('/:id/subscribe', validate(subscribeSchema), channelsController.subscribe.bind(channelsController));
router.delete('/:id/subscribe', validate(subscribeSchema), channelsController.unsubscribe.bind(channelsController));
router.get('/:id/subscribers', validate(getSubscribersSchema), channelsController.getSubscribers.bind(channelsController));

// Посты канала
router.get('/:id/posts', validate(getChannelPostsSchema), channelsController.getChannelPosts.bind(channelsController));
router.post('/:id/posts', createContentLimiter, validate(createChannelPostSchema), channelsController.createPost.bind(channelsController));
router.delete('/posts/:postId', validate(deleteChannelPostSchema), channelsController.deletePost.bind(channelsController));
router.post('/posts/:postId/view', validate(incrementPostViewsSchema), channelsController.incrementPostViews.bind(channelsController));

export default router;
