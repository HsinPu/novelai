// NovelAI Reviser Agent - 修訂問題

import { LLMService } from '../services/LLMService.js';
import type { AuditResult } from '../types/index.js';

export interface ReviserConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class ReviserAgent {
  private llm: LLMService;

  constructor(config: ReviserConfig) {
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.5,
      maxTokens: 4096,
    });
  }

  async reviseChapter(
    chapterId: string,
    content: string,
    issues: AuditResult['issues']
  ): Promise<{ revisedContent: string; fixedIssues: number }> {
    if (issues.length === 0) {
      return { revisedContent: content, fixedIssues: 0 };
    }

    // 分離可自動修復和需要人工的問題
    const autoFixable = issues.filter(i => i.severity === 'high');
    const manual = issues.filter(i => i.severity !== 'high');

    if (autoFixable.length === 0) {
      return { revisedContent: content, fixedIssues: 0 };
    }

    const prompt = `請修訂以下小說章節，修復這些問題：

## 問題清單
${autoFixable.map(i => `- ${i.type}: ${i.description}`).join('\n')}

## 原文
${content}

請直接輸出修訂後的內容，不要解釋。`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的小說修訂編輯，擅長修復各種寫作問題。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      return {
        revisedContent: response.content,
        fixedIssues: autoFixable.length,
      };
    } catch (error) {
      console.error('Reviser Error:', (error as Error).message);
      return { revisedContent: content, fixedIssues: 0 };
    }
  }
}

export function createReviserAgent(config: ReviserConfig): ReviserAgent {
  return new ReviserAgent(config);
}
