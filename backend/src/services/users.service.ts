import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { sanitizeHtml } from '../utils/sanitize';

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
}

export interface SearchUsersDto {
  search?: string;
  limit?: number;
  offset?: number;
}

export class UsersService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'bio',
        'avatarUrl',
        'phone',
        'isOnline',
        'lastSeen',
        'createdAt',
      ],
    });

    return user;
  }

  /**
   * Обновить профиль пользователя
   */
  async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Проверяем уникальность телефона (если обновляется)
    if (data.phone !== undefined && data.phone !== null && data.phone !== user.phone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: data.phone },
      });

      if (existingPhone && existingPhone.id !== userId) {
        throw new Error('Пользователь с таким номером телефона уже существует');
      }
    }

    // Обновляем только переданные поля (with XSS protection)
    if (data.firstName !== undefined) user.firstName = sanitizeHtml(data.firstName);
    if (data.lastName !== undefined) user.lastName = sanitizeHtml(data.lastName);
    if (data.bio !== undefined) user.bio = sanitizeHtml(data.bio);
    if (data.phone !== undefined) user.phone = data.phone;

    await this.userRepository.save(user);

    // Возвращаем без пароля
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Обновить аватар пользователя
   */
  async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.avatarUrl = avatarUrl;
    await this.userRepository.save(user);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Удалить аватар пользователя
   */
  async deleteAvatar(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    user.avatarUrl = undefined;
    await this.userRepository.save(user);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Поиск пользователей
   */
  async searchUsers(params: SearchUsersDto): Promise<{ users: User[]; total: number }> {
    const { search = '', limit = 20, offset = 0 } = params;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.firstName',
        'user.lastName',
        'user.avatarUrl',
        'user.bio',
        'user.isOnline',
        'user.lastSeen',
      ]);

    if (search) {
      queryBuilder.where(
        '(user.username ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy('user.createdAt', 'DESC').skip(offset).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  /**
   * Обновить онлайн статус пользователя
   */
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await this.userRepository.update(userId, {
      isOnline,
      lastSeen: new Date(),
    });
  }
}

export const usersService = new UsersService();
