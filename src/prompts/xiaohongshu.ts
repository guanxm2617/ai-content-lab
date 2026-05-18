import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 小红书模板
 */
export const xiaohongshuTemplate: PromptTemplate = {
  name: '小红书图文生成器',
  description: '生成符合小红书调性的图文内容',
  generateMessages: (inputs) => {
    const { product, features, experience, type, audience, style } = inputs;
    return [
      { role: 'system', content: `${BASE_SYSTEM_PROMPT}\n你非常擅长编写小红书风格的笔记，懂得使用 emoji，语气亲切，且知道如何制造爆款标题。` },
      { 
        role: 'user', 
        content: `请帮我写一篇小红书笔记。
产品/主题：${product}
产品特点：${features}
使用体验：${experience}
内容类型：${type}
目标人群：${audience}
风格偏好：${style}

请提供：
1. 3-5个爆款标题
2. 笔记正文（包含丰富的 emoji，段落清晰，有抓人眼球的开头和引导互动的结尾）
3. 相关话题标签 #
4. 配图及滤镜建议` 
      }
    ];
  }
};
