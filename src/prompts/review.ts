import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 文章审核模板
 */
export const reviewTemplate: PromptTemplate = {
  name: '文章审核助手',
  description: '对文章进行多维度审核和修改建议',
  generateMessages: (inputs) => {
    const { content, options } = inputs;
    return [
      { role: 'system', content: `${BASE_SYSTEM_PROMPT}\n你是一个资深的文字编辑和校对专家。你的审核应当客观且具有建设性。` },
      { 
        role: 'user', 
        content: `请帮我审核以下内容。
审核要求：${options?.join('、') || '全面审核'}

待审核文本：
---
${content}
---

请提供：
1. 整体评分（百分制）及评级
2. 发现的问题清单（分类说明：错别字、敏感词、事实错误、逻辑问题等）
3. 具体的修改建议
4. 修改后的参考片段` 
      }
    ];
  }
};
