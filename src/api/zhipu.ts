/**
 * 智谱 AI API 封装
 * 文档：https://open.bigmodel.cn/dev/api#glm-4
 */

const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const API_KEY = '8758663b27f940f5bbaf16914c581c52.WiKgH3Oyzi3O8XlH';
const DEFAULT_MODEL = 'GLM-4-Flash-250414';

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

export interface CallOptions {
  model?: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ZhipuResponse {
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 非流式调用
 */
export async function callZhipu(messages: Message[], options: CallOptions = {}): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`智谱 API 错误: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data: ZhipuResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('智谱 API 调用失败:', error);
    throw error;
  }
}

/**
 * 流式调用 (AsyncGenerator)
 */
export async function* streamZhipu(messages: Message[], options: CallOptions = {}): AsyncGenerator<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        top_p: options.top_p ?? 0.9,
        max_tokens: options.max_tokens ?? 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`智谱 API 流式调用错误: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            const content = data.choices[0]?.delta?.content || '';
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('解析流数据失败:', e, trimmedLine);
          }
        }
      }
    }
  } catch (error) {
    console.error('智谱 API 流式调用失败:', error);
    throw error;
  }
}
