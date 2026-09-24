import { create } from 'zustand';
import type { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, isAuthenticated: false });
  },
}));
