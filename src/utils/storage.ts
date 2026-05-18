/**
 * localStorage 工具封装
 */

export const STORAGE_KEYS = {
  CONTENT_LIBRARY: 'ls_content_library',
  FAVORITES: 'ls_favorites',
  CONFIG: 'ls_tool_config',
  USAGE_STATS: 'ls_usage_stats',
};

/**
 * 基础读取方法
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`读取 localStorage 失败 (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * 基础写入方法
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`写入 localStorage 失败 (key: ${key}):`, error);
  }
}

/**
 * 基础删除方法
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`删除 localStorage 失败 (key: ${key}):`, error);
  }
}

// --- 内容库专用方法 ---

export interface SavedContent {
  id: string;
  toolType: string;
  title: string;
  content: string;
  createdAt: number;
  isFavorite: boolean;
  tags?: string[];
}

/**
 * 获取内容库
 */
export function getContentLibrary(): SavedContent[] {
  return getItem<SavedContent[]>(STORAGE_KEYS.CONTENT_LIBRARY, []);
}

/**
 * 保存到内容库
 */
export function saveToLibrary(item: Omit<SavedContent, 'id' | 'createdAt' | 'isFavorite'>): SavedContent {
  const library = getContentLibrary();
  const newItem: SavedContent = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    isFavorite: false,
  };
  library.unshift(newItem); // 最新的排在前面
  setItem(STORAGE_KEYS.CONTENT_LIBRARY, library);
  return newItem;
}

/**
 * 从内容库删除
 */
export function deleteFromLibrary(id: string): void {
  const library = getContentLibrary();
  const updatedLibrary = library.filter(item => item.id !== id);
  setItem(STORAGE_KEYS.CONTENT_LIBRARY, updatedLibrary);
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(id: string): boolean {
  const library = getContentLibrary();
  let newState = false;
  const updatedLibrary = library.map(item => {
    if (item.id === id) {
      newState = !item.isFavorite;
      return { ...item, isFavorite: newState };
    }
    return item;
  });
  setItem(STORAGE_KEYS.CONTENT_LIBRARY, updatedLibrary);
  return newState;
}
