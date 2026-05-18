import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 传播分析模板
 */
export const analysisTemplate: PromptTemplate = {
  name: '传播分析',
  description: '分析内容的传播潜力及优化建议',
  generateMessages: (inputs) => {
    const { content, platform, target } = inputs;
    return [
      { role: 'system', content: `${BASE_SYSTEM_PROMPT}\n你是一个资深的数据分析师和流量运营专家。` },
      { 
        role: 'user', 
        content: `请帮我分析这段内容的传播潜力。
内容：
---
${content}
---
发布平台：${platform}
传播目标：${target}

请提供：
1. 传播潜力评分
2. 核心受众分析
3. 传播关键词提取
4. 优化建议（如何进一步提升传播效果）
5. 风险点提示` 
      }
    ];
  }
};
