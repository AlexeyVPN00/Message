import { apiClient } from './axios.config';
import { User } from '../types/user.types';

interface UploadAvatarResponse {
  message: string;
  avatarUrl: string;
  user: User;
}

interface UploadFileResponse {
  message: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export const uploadApi = {
  /**
   * Загрузить аватар
   */
  uploadAvatar: async (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<UploadAvatarResponse>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Загрузить файл для сообщения
   */
  uploadMessageFile: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', 'message');

    const response = await apiClient.post<UploadFileResponse>('/upload/message', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Получить полный URL файла
   */
  getFileUrl: (relativePath: string): string => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${relativePath}`;
  },
};
