// NovelAI Planner Agent - 參考 NovelAI 的規劃師

import { LLMService } from '../services/LLMService.js';
import type { PlotHook, Chapter } from '../types/index.js';

export interface PlannerConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class PlannerAgent {
  private llm: LLMService;
  private config: PlannerConfig;

  constructor(config: PlannerConfig) {
    this.config = config;
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.5,
      maxTokens: 4096,
    });
  }

  async generateAgenda(
    chapterNumber: number,
    hooks: PlotHook[],
    previousChapters: Chapter[]
  ): Promise<{
    suggestedFocus: string;
    hooksToAdvance: string[];
    hooksToResolve: string[];
    priority: 'low' | 'medium' | 'high';
  }> {
    const prompt = this.buildAgendaPrompt(chapterNumber, hooks, previousChapters);

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的小說規劃師，擅長設計情節發展和伏筆管理。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      return this.parseAgendaResponse(chapterNumber, response.content);
    } catch (error) {
      console.error('Planner Error:', (error as Error).message);
      return this.getDefaultAgenda(chapterNumber);
    }
  }

  private buildAgendaPrompt(
    chapterNumber: number,
    hooks: PlotHook[],
    previousChapters: Chapter[]
  ): string {
    const activeHooks = hooks.filter(h => h.status !== 'resolved');
    const recentSummary = previousChapters.slice(-3).map(c => 
      `第 ${c.number} 章：${c.title}（${c.status}）`
    ).join('\n');

    return `你是一個小說規劃師，請為第 ${chapterNumber} 章生成創作焦點。

## 當前活躍伏筆
${activeHooks.length > 0 
  ? activeHooks.map(h => `- ${h.content} (${h.status})`).join('\n')
  : '（暂无 active hooks）'}

## 最近章節
${recentSummary || '（這是第一章）'}

## 輸出格式
請以 JSON 格式輸出：
{
  "suggestedFocus": "本章的主要焦點描述",
  "hooksToAdvance": ["要推進的伏筆ID"],
  "hooksToResolve": ["要解決的伏筆ID"],
  "priority": "low/medium/high"
}
`;
  }

  private parseAgendaResponse(
    chapterNumber: number,
    content: string
  ): {
    suggestedFocus: string;
    hooksToAdvance: string[];
    hooksToResolve: string[];
    priority: 'low' | 'medium' | 'high';
  } {
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      // 解析失敗
    }
    return this.getDefaultAgenda(chapterNumber);
  }

  private getDefaultAgenda(chapterNumber: number): {
    suggestedFocus: string;
    hooksToAdvance: string[];
    hooksToResolve: string[];
    priority: 'low' | 'medium' | 'high';
  } {
    return {
      suggestedFocus: `繼續發展第 ${chapterNumber} 章的情節`,
      hooksToAdvance: [],
      hooksToResolve: [],
      priority: 'medium',
    };
  }
}

export function createPlannerAgent(config: PlannerConfig): PlannerAgent {
  return new PlannerAgent(config);
}
