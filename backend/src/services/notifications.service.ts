import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../models/Notification.entity';

export interface CreateNotificationDto {
  recipientId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
}

export class NotificationsService {
  private notificationRepository = AppDataSource.getRepository(Notification);

  /**
   * Получить уведомления пользователя
   */
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.recipientId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .take(limit);

    if (unreadOnly) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Получить количество непрочитанных уведомлений
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  /**
   * Создать уведомление
   */
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      recipientId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || null,
    });

    await this.notificationRepository.save(notification);

    return notification;
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      throw new Error('Уведомление не найдено');
    }

    notification.isRead = true;
    await this.notificationRepository.save(notification);

    return notification;
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * Удалить уведомление
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      throw new Error('Уведомление не найдено');
    }

    await this.notificationRepository.remove(notification);
  }

  /**
   * Удалить все прочитанные уведомления
   */
  async deleteAllRead(userId: string): Promise<void> {
    await this.notificationRepository.delete({
      recipientId: userId,
      isRead: true,
    });
  }

  /**
   * Создать уведомление о новом сообщении
   */
  async notifyNewMessage(recipientId: string, senderName: string, chatName: string, messagePreview: string): Promise<void> {
    await this.createNotification({
      recipientId,
      type: NotificationType.MESSAGE,
      title: `Новое сообщение от ${senderName}`,
      message: messagePreview,
      data: { chatName },
    });
  }

  /**
   * Создать уведомление о лайке поста
   */
  async notifyPostLike(recipientId: string, likerName: string, postId: string): Promise<void> {
    await this.createNotification({
      recipientId,
      type: NotificationType.LIKE,
      title: `${likerName} лайкнул ваш пост`,
      data: { postId },
    });
  }

  /**
   * Создать уведомление о комментарии
   */
  async notifyPostComment(recipientId: string, commenterName: string, postId: string, commentPreview: string): Promise<void> {
    await this.createNotification({
      recipientId,
      type: NotificationType.COMMENT,
      title: `${commenterName} прокомментировал ваш пост`,
      message: commentPreview,
      data: { postId },
    });
  }

  /**
   * Создать уведомление о новом посте в канале
   */
  async notifyChannelPost(recipientId: string, channelName: string, channelId: string, postPreview: string): Promise<void> {
    await this.createNotification({
      recipientId,
      type: NotificationType.CHANNEL_POST,
      title: `Новый пост в канале ${channelName}`,
      message: postPreview,
      data: { channelId },
    });
  }

  /**
   * Создать уведомление о добавлении в группу
   */
  async notifyChatInvite(recipientId: string, inviterName: string, chatName: string, chatId: string): Promise<void> {
    await this.createNotification({
      recipientId,
      type: NotificationType.CHAT_INVITE,
      title: `${inviterName} добавил вас в группу`,
      message: chatName,
      data: { chatId },
    });
  }
}

export const notificationsService = new NotificationsService();
