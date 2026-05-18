import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 文章写作模板
 */
export const articleTemplate: PromptTemplate = {
  name: '文章写作智能体',
  description: '生成高质量文章内容',
  generateMessages: (inputs) => {
    const { theme, wordCount, outline, style, tone, seo } = inputs;
    return [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `请帮我写一篇文章。
文章主题：${theme}
目标字数：${wordCount || '不限'}
文章大纲：${outline || '请自行发挥'}
文风要求：${style}
语气要求：${tone}
SEO要求：${seo ? '需要优化关键字' : '无'}

请提供：
1. 3个备选爆款标题
2. 完整的正文内容
3. SEO关键字建议（如果开启）
4. 配图位置建议` 
      }
    ];
  }
};
