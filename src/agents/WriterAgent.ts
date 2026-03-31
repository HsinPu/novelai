// NovelAI Writer Agent - 參考 NovelAI 的 10 Agent 管線

import { LLMService } from '../services/LLMService.js';
import type { WritingContext } from '../types/index.js';

export interface WriterConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  chapterWords?: number;
}

export class WriterAgent {
  private llm: LLMService;
  private config: WriterConfig;

  constructor(config: WriterConfig) {
    this.config = config;
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens ?? 4096,
    });
  }

  async writeChapter(
    bookId: string,
    chapterNumber: number,
    context: WritingContext
  ): Promise<{ content: string; wordCount: number }> {
    const prompt = this.buildPrompt(chapterNumber, context);
    const content = await this.callLLM(prompt);
    const wordCount = this.countWords(content);

    return { content, wordCount };
  }

  private buildPrompt(chapterNumber: number, context: WritingContext): string {
    const { previousChapterSummary, currentFocus, plotProgression, characterStates } = context;

    return `你是專業的小說作家，擅長創作玄幻、仙俠類型的小說。

## 創作要求
- 字數目標：${this.config.chapterWords || 5000} 字
- 情節流暢、人物鮮明
- 有緊張情節和情感描寫
- 第三人稱視角

## 上一章節要點
${previousChapterSummary || '（這是第一章）'}

## 本章重點
${currentFocus}

## 劇情發展
${plotProgression}

## 角色狀態
${characterStates.map(c => `- ${c.name}: ${c.description}`).join('\n')}

請撰寫第 ${chapterNumber} 章的內容，確保：
1. 延續上一章的情節
2. 重點描寫本章重點內容
3. 最後留下懸念，引導讀者繼續閱讀
`;
  }

  private async callLLM(prompt: string): Promise<string> {
    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的小說作家，擅長創作各種風格的小說，特別是玄幻、仙俠類。你的文筆流暢，能創造引人入勝的情節。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);
      return response.content;
    } catch (error) {
      console.error('LLM Error:', (error as Error).message);
      return this.getFallbackContent();
    }
  }

  private getFallbackContent(): string {
    return `這是章節的預設內容。請配置有效的 API Key 來生成真正的內容。`;
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(w => w).length;
  }

  updateConfig(config: Partial<WriterConfig>): void {
    this.config = { ...this.config, ...config };
    this.llm.updateConfig({
      provider: config.provider || this.config.provider,
      baseUrl: config.baseUrl || this.config.baseUrl,
      apiKey: config.apiKey || this.config.apiKey,
      model: config.model || this.config.model,
      temperature: config.temperature ?? this.config.temperature,
      maxTokens: config.maxTokens ?? this.config.maxTokens,
    });
  }
}

export function createWriterAgent(config: WriterConfig): WriterAgent {
  return new WriterAgent(config);
}
