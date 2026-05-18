import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 选题生成模板
 */
export const topicTemplate: PromptTemplate = {
  name: '公众号选题助手',
  description: '批量生成公众号选题',
  generateMessages: (inputs) => {
    const { keyword, position, style, preference, count } = inputs;
    return [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `请为我的公众号生成 ${count || 5} 个选题。
热点/关键词：${keyword}
账号定位：${position}
风格选择：${style}
选题偏好：${preference}

请为每个选题提供：
1. 吸引人的标题
2. 创作角度说明
3. 预估内容效果
4. 建议发布时间
5. 创作难度评估` 
      }
    ];
  }
};
