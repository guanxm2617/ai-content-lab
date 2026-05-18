import { create } from 'zustand'
import { storage, STORAGE_KEYS } from '../utils/storage'

export interface ToolConfig {
  platform?: string;
  style?: string;
  tone?: string;
  [key: string]: any;
}

export interface GeneratedContent {
  id: string;
  toolId: string;
  title: string;
  content: string;
  timestamp: number;
  tags?: string[];
  platform?: string;
}

export interface UsageStats {
  totalGenerated: number;
  toolFrequency: Record<string, number>;
  estimatedExposure: number;
}

interface ContentState {
  configs: Record<string, ToolConfig>;
  library: GeneratedContent[];
  favorites: string[];
  stats: UsageStats;
  
  // Actions
  setConfig: (toolId: string, config: ToolConfig) => void;
  saveToLibrary: (content: GeneratedContent) => void;
  deleteFromLibrary: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateStats: (toolId: string) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  configs: storage.get(STORAGE_KEYS.CONFIG, {}),
  library: storage.get(STORAGE_KEYS.CONTENT_LIBRARY, []),
  favorites: storage.get(STORAGE_KEYS.FAVORITES, []),
  stats: storage.get(STORAGE_KEYS.USAGE_STATS, {
    totalGenerated: 0,
    toolFrequency: {},
    estimatedExposure: 0,
  }),

  setConfig: (toolId, config) => set((state) => {
    const newConfigs = { ...state.configs, [toolId]: config };
    storage.set(STORAGE_KEYS.CONFIG, newConfigs);
    return { configs: newConfigs };
  }),

  saveToLibrary: (content) => set((state) => {
    const newLibrary = [content, ...state.library];
    storage.set(STORAGE_KEYS.CONTENT_LIBRARY, newLibrary);
    return { library: newLibrary };
  }),

  deleteFromLibrary: (id) => set((state) => {
    const newLibrary = state.library.filter((c) => c.id !== id);
    const newFavorites = state.favorites.filter((f) => f !== id);
    storage.set(STORAGE_KEYS.CONTENT_LIBRARY, newLibrary);
    storage.set(STORAGE_KEYS.FAVORITES, newFavorites);
    return { library: newLibrary, favorites: newFavorites };
  }),

  toggleFavorite: (id) => set((state) => {
    const newFavorites = state.favorites.includes(id)
      ? state.favorites.filter((f) => f !== id)
      : [...state.favorites, id];
    storage.set(STORAGE_KEYS.FAVORITES, newFavorites);
    return { favorites: newFavorites };
  }),

  updateStats: (toolId) => set((state) => {
    const newStats = {
      ...state.stats,
      totalGenerated: state.stats.totalGenerated + 1,
      toolFrequency: {
        ...state.stats.toolFrequency,
        [toolId]: (state.stats.toolFrequency[toolId] || 0) + 1,
      },
      estimatedExposure: state.stats.estimatedExposure + Math.floor(Math.random() * 1000) + 500,
    };
    storage.set(STORAGE_KEYS.USAGE_STATS, newStats);
    return { stats: newStats };
  }),
}));
