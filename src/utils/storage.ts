export const STORAGE_KEYS = {
  CONTENT_LIBRARY: 'ls_content_library',
  FAVORITES: 'ls_favorites',
  USAGE_STATS: 'ls_usage_stats',
  CONFIG: 'ls_config',
};

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  },
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
