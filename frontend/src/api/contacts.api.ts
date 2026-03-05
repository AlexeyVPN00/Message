import { apiClient } from './axios.config';
import { User } from '../types/user.types';

export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  createdAt: Date;
  contact: User;
}

export const contactsApi = {
  /**
   * Получить список контактов
   */
  getContacts: async (search?: string): Promise<Contact[]> => {
    const params = search ? { search } : {};
    const response = await apiClient.get<Contact[]>('/contacts', { params });
    return response.data;
  },

  /**
   * Добавить пользователя в контакты
   */
  addContact: async (contactId: string): Promise<Contact> => {
    const response = await apiClient.post<Contact>('/contacts', { contactId });
    return response.data;
  },

  /**
   * Удалить пользователя из контактов
   */
  removeContact: async (contactId: string): Promise<void> => {
    await apiClient.delete(`/contacts/${contactId}`);
  },

  /**
   * Проверить, находится ли пользователь в контактах
   */
  checkContact: async (contactId: string): Promise<boolean> => {
    const response = await apiClient.get<{ isContact: boolean }>(`/contacts/${contactId}/check`);
    return response.data.isContact;
  },
};
