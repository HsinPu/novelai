// NovelAI LLM Service - 統一的 LLM 調用服務

import type { LLMConfig, LLMResponse } from '../types/index.js';

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const { provider, baseUrl, apiKey, model, temperature, maxTokens } = this.config;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (provider === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const endpoint = provider === 'anthropic' 
      ? `${baseUrl}/messages` 
      : `${baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 4096,
    };

    if (provider === 'anthropic') {
      const system = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');
      body.model = model;
      body.system = system?.content;
      body.messages = userMessages;
      body.max_tokens = maxTokens ?? 4096;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API Error ${response.status}: ${error}`);
      }

      const data = await response.json();
      return this.parseResponse(provider, data);
    } catch (error) {
      throw new Error(`LLM Request Failed: ${(error as Error).message}`);
    }
  }

  private parseResponse(provider: string, data: unknown): LLMResponse {
    const d = data as Record<string, unknown>;
    
    if (provider === 'anthropic') {
      const content = d.content as Array<{ type: string; text: string }>;
      const usage = (d.usage as Record<string, number>) || { input_tokens: 0, output_tokens: 0 };
      return {
        content: content?.[0]?.text || '',
        usage: {
          promptTokens: usage.input_tokens || 0,
          completionTokens: usage.output_tokens || 0,
          totalTokens: (usage.input_tokens || 0) + (usage.output_tokens || 0),
        },
        model: d.model as string,
      };
    }

    const choices = d.choices as Array<{ message: { content: string } }>;
    const usage = (d.usage as Record<string, number>) || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    return {
      content: choices?.[0]?.message?.content || '',
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
      model: d.model as string,
    };
  }

  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export function createLLMService(config: LLMConfig): LLMService {
  return new LLMService(config);
}
