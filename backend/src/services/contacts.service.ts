import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Contact } from '../models/Contact.entity';
import { User } from '../models/User.entity';

export interface ContactWithUser extends Contact {
  contact: User;
}

export class ContactsService {
  private contactRepository: Repository<Contact>;
  private userRepository: Repository<User>;

  constructor() {
    this.contactRepository = AppDataSource.getRepository(Contact);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Получить список контактов пользователя
   */
  async getUserContacts(userId: string): Promise<ContactWithUser[]> {
    const contacts = await this.contactRepository.find({
      where: { userId },
      relations: ['contact'],
      order: { createdAt: 'DESC' },
    });

    return contacts;
  }

  /**
   * Добавить пользователя в контакты
   */
  async addContact(userId: string, contactId: string): Promise<Contact> {
    // Проверяем, что пользователь не добавляет себя
    if (userId === contactId) {
      throw new Error('Нельзя добавить себя в контакты');
    }

    // Проверяем, существует ли пользователь
    const contactUser = await this.userRepository.findOne({
      where: { id: contactId },
    });

    if (!contactUser) {
      throw new Error('Пользователь не найден');
    }

    // Проверяем, не добавлен ли уже в контакты
    const existingContact = await this.contactRepository.findOne({
      where: { userId, contactId },
    });

    if (existingContact) {
      throw new Error('Пользователь уже в контактах');
    }

    // Добавляем в контакты
    const contact = this.contactRepository.create({
      userId,
      contactId,
    });

    await this.contactRepository.save(contact);

    // Загружаем контакт с данными пользователя
    const contactWithUser = await this.contactRepository.findOne({
      where: { id: contact.id },
      relations: ['contact'],
    });

    return contactWithUser!;
  }

  /**
   * Удалить пользователя из контактов
   */
  async removeContact(userId: string, contactId: string): Promise<void> {
    const contact = await this.contactRepository.findOne({
      where: { userId, contactId },
    });

    if (!contact) {
      throw new Error('Контакт не найден');
    }

    await this.contactRepository.remove(contact);
  }

  /**
   * Проверить, находится ли пользователь в контактах
   */
  async isContact(userId: string, contactId: string): Promise<boolean> {
    const contact = await this.contactRepository.findOne({
      where: { userId, contactId },
    });

    return !!contact;
  }

  /**
   * Поиск контактов по имени или username
   */
  async searchContacts(userId: string, query: string): Promise<ContactWithUser[]> {
    const contacts = await this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.contact', 'user')
      .where('contact.userId = :userId', { userId })
      .andWhere(
        '(LOWER(user.username) LIKE :query OR LOWER(user.firstName) LIKE :query OR LOWER(user.lastName) LIKE :query)',
        { query: `%${query.toLowerCase()}%` }
      )
      .orderBy('contact.createdAt', 'DESC')
      .getMany();

    return contacts;
  }
}

export const contactsService = new ContactsService();
