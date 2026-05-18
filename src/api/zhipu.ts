export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

const API_KEY = '8758663b27f940f5bbaf16914c581c52.WiKgH3Oyzi3O8XlH';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

export async function callZhipu(messages: Message[], options: CallOptions = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'GLM-4-Flash-250414',
      messages,
      ...options,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function* streamZhipu(messages: Message[], options: CallOptions = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'GLM-4-Flash-250414',
      messages,
      ...options,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('data: [DONE]')) return;
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          console.error('Error parsing stream JSON', e);
        }
      }
    }
  }
}
