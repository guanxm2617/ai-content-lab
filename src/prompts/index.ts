import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';
import { activityTemplate } from './activity';
import { topicTemplate } from './topic';
import { articleTemplate } from './article';
import { xiaohongshuTemplate } from './xiaohongshu';
import { reviewTemplate } from './review';
import { momentsTemplate } from './moments';
import { analysisTemplate } from './analysis';

/**
 * 通用 Prompt 模板接口
 */
export interface PromptTemplate {
  name: string;
  description: string;
  generateMessages: (inputs: Record<string, any>) => Message[];
}

/**
 * 系统级基础指令
 */
export const BASE_SYSTEM_PROMPT = `你是一个专业的新媒体内容专家，擅长各种平台的写作风格和传播策略。
请根据用户的需求，提供高质量、有创意且实用的内容。
你的回答应该结构清晰，重点突出，符合相应平台的表达习惯。`;

/**
 * 导出所有模板的索引
 */
export const templates: Record<string, PromptTemplate> = {
  activity: activityTemplate,
  topic: topicTemplate,
  article: articleTemplate,
  xiaohongshu: xiaohongshuTemplate,
  review: reviewTemplate,
  moments: momentsTemplate,
  analysis: analysisTemplate,
};
