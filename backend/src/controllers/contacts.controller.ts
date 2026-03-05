import { Request, Response } from 'express';
import { contactsService } from '../services/contacts.service';

export class ContactsController {
  /**
   * GET /api/contacts - Получить список контактов пользователя
   */
  async getUserContacts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { search } = req.query;

      let contacts;
      if (search && typeof search === 'string') {
        contacts = await contactsService.searchContacts(userId, search);
      } else {
        contacts = await contactsService.getUserContacts(userId);
      }

      res.json(contacts);
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ message: 'Ошибка при получении контактов' });
    }
  }

  /**
   * POST /api/contacts - Добавить пользователя в контакты
   */
  async addContact(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { contactId } = req.body;

      if (!contactId) {
        res.status(400).json({ message: 'contactId обязателен' });
        return;
      }

      const contact = await contactsService.addContact(userId, contactId);
      res.status(201).json(contact);
    } catch (error: any) {
      console.error('Error adding contact:', error);

      if (error.message === 'Нельзя добавить себя в контакты') {
        res.status(400).json({ message: error.message });
        return;
      }

      if (error.message === 'Пользователь не найден') {
        res.status(404).json({ message: error.message });
        return;
      }

      if (error.message === 'Пользователь уже в контактах') {
        res.status(409).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: 'Ошибка при добавлении контакта' });
    }
  }

  /**
   * DELETE /api/contacts/:contactId - Удалить пользователя из контактов
   */
  async removeContact(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { contactId } = req.params;

      await contactsService.removeContact(userId, contactId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error removing contact:', error);

      if (error.message === 'Контакт не найден') {
        res.status(404).json({ message: error.message });
        return;
      }

      res.status(500).json({ message: 'Ошибка при удалении контакта' });
    }
  }

  /**
   * GET /api/contacts/:contactId/check - Проверить, находится ли пользователь в контактах
   */
  async checkContact(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { contactId } = req.params;

      const isContact = await contactsService.isContact(userId, contactId);
      res.json({ isContact });
    } catch (error) {
      console.error('Error checking contact:', error);
      res.status(500).json({ message: 'Ошибка при проверке контакта' });
    }
  }
}

export const contactsController = new ContactsController();
