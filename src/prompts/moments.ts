import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 朋友圈文案模板
 */
export const momentsTemplate: PromptTemplate = {
  name: '朋友圈文案优化',
  description: '优化朋友圈文案，提升互动率',
  generateMessages: (inputs) => {
    const { content, purpose, audience, style } = inputs;
    return [
      { role: 'system', content: `${BASE_SYSTEM_PROMPT}\n你非常擅长编写朋友圈文案，懂得如何引起共鸣或好奇，熟悉不同发布目的的表达技巧。` },
      { 
        role: 'user', 
        content: `请帮我优化这段朋友圈文案。
原始文案：${content}
发布目的：${purpose}
目标人群：${audience}
文风要求：${style}

请提供3个不同版本的优化方案：
- 版本A：侧重吸引眼球（Hook强）
- 版本B：侧重信任建立（诚恳专业）
- 版本C：侧重互动引导（引发评论）

每个版本请包含：
1. 文案内容
2. 预估互动效果
3. 最佳发布时间建议
4. 配图建议` 
      }
    ];
  }
};
