import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { User, RegisterData, LoginData } from '../types/user.types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true });
      const response = await authApi.register(data);

      localStorage.setItem('accessToken', response.accessToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Регистрация успешна!');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Ошибка регистрации';
      toast.error(message);
      throw error;
    }
  },

  login: async (data: LoginData) => {
    try {
      set({ isLoading: true });
      const response = await authApi.login(data);

      localStorage.setItem('accessToken', response.accessToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Вход выполнен успешно!');
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Ошибка входа';
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();

      localStorage.removeItem('accessToken');

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });

      toast.success('Выход выполнен');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const user = await authApi.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
      });
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
