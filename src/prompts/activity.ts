import { PromptTemplate, BASE_SYSTEM_PROMPT } from './index';

/**
 * 活动策划模板
 */
export const activityTemplate: PromptTemplate = {
  name: '活动策划助手',
  description: '生成完整的活动策划方案',
  generateMessages: (inputs) => {
    const { theme, goal, type, audience, budget, platform } = inputs;
    return [
      { role: 'system', content: BASE_SYSTEM_PROMPT },
      { 
        role: 'user', 
        content: `请为我策划一个活动。
活动主题：${theme}
活动目标：${goal}
活动类型：${type}
目标受众：${audience}
时间预算：${budget}
平台选择：${platform}

请提供完整的策划方案，包括：
1. 活动亮点
2. 详细流程
3. 推广计划
4. 物料清单
5. 预算分配建议` 
      }
    ];
  }
};
