export const SYSTEM_PROMPT = `你是一个专业的新媒体内容专家，擅长根据用户需求生成高质量的内容。`;

export const prompts = {
  activity: (config: any) => `
    作为活动策划专家，请根据以下配置生成活动策划方案：
    - 主题: ${config.title}
    - 目标: ${config.goals?.join(', ')}
    - 类型: ${config.type}
    - 受众: ${config.audience}
    - 平台: ${config.platforms?.join(', ')}
    
    请输出完整的策划方案，包含：活动亮点、流程图描述、推广计划、物料清单、预算分配。
  `,
  topic: (config: any) => `
    作为内容选题专家，请根据以下配置生成选题建议：
    - 热点/话题: ${config.hotTopic}
    - 账号定位: ${config.positioning}
    - 风格: ${config.style}
    - 偏好: ${config.preference}
    - 数量: ${config.count}
    
    请输出${config.count}个选题，每个选题包含：标题、角度说明、预估效果、发布建议、难度。
  `,
  article: (config: any) => `
    作为资深撰稿人，请根据以下配置生成文章：
    - 主题: ${config.title}
    - 字数: ${config.wordCount}
    - 大纲: ${config.outline || '未提供'}
    - 文风: ${config.style}
    - 语气: ${config.tone}
    - SEO: ${config.seo ? '开启' : '关闭'}
    
    请严格按照以下格式输出，并使用 [DELIMITER] 作为各部分的分隔符：
    
    [TITLES]
    (这里输出3个备选标题，每行一个，格式：标题 | 点击率预估)
    [DELIMITER]
    [CONTENT]
    (这里输出文章正文)
    [DELIMITER]
    [SEO]
    (这里输出SEO关键词，逗号分隔)
    [DELIMITER]
    [IMAGES]
    (这里输出配图建议)
  `,
};
