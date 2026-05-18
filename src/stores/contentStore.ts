import { create } from 'zustand';
import { streamZhipu, Message } from '../api/zhipu';
import { templates } from '../prompts';
import { 
  getContentLibrary, 
  saveToLibrary as saveToStorage, 
  deleteFromLibrary as deleteFromStorage, 
  toggleFavorite as toggleFavoriteInStorage,
  SavedContent,
  setItem,
  getItem,
  STORAGE_KEYS
} from '../utils/storage';

/**
 * 数据模型定义
 */

export interface ToolConfig {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface UsageStats {
  totalGenerations: number;
  toolUsage: Record<string, number>;
}

interface ContentState {
  // 状态数据
  config: ToolConfig;
  library: SavedContent[];
  stats: UsageStats;
  isGenerating: boolean;
  currentOutput: string;

  // 操作方法
  setConfig: (config: Partial<ToolConfig>) => void;
  generateContent: (toolType: string, inputs: Record<string, any>) => Promise<void>;
  saveToLibrary: (toolType: string, title: string, content: string) => void;
  deleteFromLibrary: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateStats: (toolType: string) => void;
  resetOutput: () => void;
}

const DEFAULT_CONFIG: ToolConfig = {
  model: 'GLM-4-Flash-250414',
  temperature: 0.7,
  maxTokens: 4096,
};

const DEFAULT_STATS: UsageStats = {
  totalGenerations: 0,
  toolUsage: {},
};

export const useContentStore = create<ContentState>((set, get) => ({
  // 初始状态
  config: getItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG),
  library: getContentLibrary(),
  stats: getItem(STORAGE_KEYS.USAGE_STATS, DEFAULT_STATS),
  isGenerating: false,
  currentOutput: '',

  // 更新配置
  setConfig: (newConfig) => {
    const updatedConfig = { ...get().config, ...newConfig };
    set({ config: updatedConfig });
    setItem(STORAGE_KEYS.CONFIG, updatedConfig);
  },

  // 重置输出
  resetOutput: () => set({ currentOutput: '' }),

  // 生成内容（流式）
  generateContent: async (toolType, inputs) => {
    const template = templates[toolType];
    if (!template) {
      throw new Error(`未找到工具模板: ${toolType}`);
    }

    set({ isGenerating: true, currentOutput: '' });
    get().updateStats(toolType);

    try {
      const messages = template.generateMessages(inputs);
      const { model, temperature, maxTokens } = get().config;

      const stream = streamZhipu(messages, {
        model,
        temperature,
        max_tokens: maxTokens,
      });

      for await (const chunk of stream) {
        set((state) => ({ currentOutput: state.currentOutput + chunk }));
      }
    } catch (error) {
      console.error('内容生成失败:', error);
      set({ currentOutput: `生成出错: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      set({ isGenerating: false });
    }
  },

  // 保存到库
  saveToLibrary: (toolType, title, content) => {
    const newItem = saveToStorage({ toolType, title, content });
    set({ library: getContentLibrary() });
  },

  // 从库删除
  deleteFromLibrary: (id) => {
    deleteFromStorage(id);
    set({ library: getContentLibrary() });
  },

  // 切换收藏
  toggleFavorite: (id) => {
    toggleFavoriteInStorage(id);
    set({ library: getContentLibrary() });
  },

  // 更新统计
  updateStats: (toolType) => {
    const currentStats = get().stats;
    const updatedStats = {
      totalGenerations: currentStats.totalGenerations + 1,
      toolUsage: {
        ...currentStats.toolUsage,
        [toolType]: (currentStats.toolUsage[toolType] || 0) + 1,
      },
    };
    set({ stats: updatedStats });
    setItem(STORAGE_KEYS.USAGE_STATS, updatedStats);
  },
}));
