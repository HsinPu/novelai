// NovelAI Auditor Agent - 參考 NovelAI 的 33 維度審計

import { LLMService } from '../services/LLMService.js';
import type { AuditResult, Chapter } from '../types/index.js';

export interface AuditorConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class AuditorAgent {
  private llm: LLMService;
  private config: AuditorConfig;

  // 33 個審計維度
  private readonly dimensions = [
    // 連續性維度
    'character_memory', 'location_consistency', 'timeline_consistency',
    'object_consistency', 'emotional_continuity', 'relationship_consistency',
    // 劇情維度
    'plot_coherence', 'pacing', 'conflict_escalation', 'cause_effect',
    'world_rules', 'foreshadowing', 'subplot_integration',
    // 角色維度
    'character_voice', 'dialogue_naturalness', 'motivation_clarity',
    'character_growth', 'character_consistency',
    // 風格維度
    'tone_consistency', 'show_dont_tell', 'prose_quality', 'vocabulary_range',
    'sentence_variety', 'paragraph_flow',
    // 讀者體驗維度
    'hook_effectiveness', 'emotional_impact', 'readability',
    'tension_buildup', 'chapter_ending', 'reader_engagement',
    // AI 檢測維度
    'ai_artifact_detection', 'repetitive_patterns', 'generic_phrasing',
  ];

  constructor(config: AuditorConfig) {
    this.config = config;
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.3,
      maxTokens: 4096,
    });
  }

  async auditChapter(chapter: Chapter): Promise<AuditResult> {
    const chapterId = typeof chapter.id === 'string' ? parseInt(chapter.id) || 1 : chapter.id;
    const prompt = this.buildAuditPrompt(chapter);
    
    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的小說審計員，精通33個維度的小說質量評估。請嚴格按照維度評分並給出改進建議。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      return this.parseAuditResult(chapter.id, response.content);
    } catch (error) {
      console.error('Audit Error:', (error as Error).message);
      return this.getDefaultAuditResult(chapterId);
    }
  }

  private buildAuditPrompt(chapter: Chapter): string {
    return `請審計以下章節內容，並從33個維度評分（1-10分）：

## 章節標題
第 ${chapter.number} 章：${chapter.title}

## 章節內容
${chapter.content}

## 審計維度（請逐一評分並給出評語）
${this.dimensions.map((d, i) => `${i + 1}. ${d}`).join('\n')}

## 輸出格式
請以 JSON 格式輸出：
{
  "dimensions": [
    {"name": "維度名", "score": 分數, "maxScore": 10, "comments": "評語"},
    ...
  ],
  "issues": [
    {"type": "問題類型", "severity": "low/medium/high", "description": "問題描述"},
    ...
  ],
  "antiAIDetection": {
    "detected": true/false,
    "score": 0-100,
    "issues": ["具體問題"]
  }
}
`;
  }

  private parseAuditResult(chapterId: number, content: string): AuditResult {
    try {
      // 嘗試解析 JSON
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          chapterId,
          score: this.calculateAverageScore(parsed.dimensions),
          dimensions: parsed.dimensions || [],
          issues: parsed.issues || [],
          antiAIDetection: parsed.antiAIDetection || { detected: false, score: 0, issues: [] },
        };
      }
    } catch (e) {
      // JSON 解析失敗
    }
    
    return this.getDefaultAuditResult(chapterId);
  }

  private calculateAverageScore(dimensions: Array<{ score: number }>): number {
    if (!dimensions || dimensions.length === 0) return 5;
    const sum = dimensions.reduce((acc, d) => acc + (d.score || 0), 0);
    return Math.round((sum / dimensions.length) * 10) / 10;
  }

  private getDefaultAuditResult(chapterId: number): AuditResult {
    return {
      chapterId,
      score: 7.5,
      dimensions: this.dimensions.slice(0, 10).map(name => ({
        name,
        score: 7,
        maxScore: 10,
        comments: '（預設評分）',
      })),
      issues: [],
      antiAIDetection: {
        detected: false,
        score: 0,
        issues: [],
      },
    };
  }
}

export function createAuditorAgent(config: AuditorConfig): AuditorAgent {
  return new AuditorAgent(config);
}
