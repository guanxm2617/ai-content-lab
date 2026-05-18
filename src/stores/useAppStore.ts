import { create } from 'zustand';
import type { AppState, User } from '../types';

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user: User | null) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));
