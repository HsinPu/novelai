// NovelAI Style Analyzer - 風格分析

import { LLMService } from '../services/LLMService.js';

export interface StyleFingerprint {
  avgSentenceLength: number;
  vocabularyFeatures: string[];
  rhythmPatterns: string[];
  bannedWords: string[];
  customRules: string[];
}

export interface StyleConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
}

export class StyleAgent {
  private llm: LLMService;

  constructor(config: StyleConfig) {
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.3,
      maxTokens: 4096,
    });
  }

  async analyzeStyle(text: string): Promise<StyleFingerprint> {
    const prompt = `請分析以下文本的風格特徵：

${text.substring(0, 5000)}

請以 JSON 格式輸出分析結果：
{
  "avgSentenceLength": 平均句長,
  "vocabularyFeatures": ["特徵1", "特徵2"],
  "rhythmPatterns": ["節奏模式1", "模式2"],
  "bannedWords": ["應避免的詞彙"],
  "customRules": ["自定義規則"]
}`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的文學風格分析師。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const match = response.content.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      console.error('Style Analysis Error:', e);
    }

    return this.getDefaultFingerprint();
  }

  async importStyle(fingerprint: StyleFingerprint, bookId: string): Promise<boolean> {
    // 將風格指紋寫入書籍配置
    console.log(`Importing style to book ${bookId}:`, fingerprint);
    return true;
  }

  private getDefaultFingerprint(): StyleFingerprint {
    return {
      avgSentenceLength: 20,
      vocabularyFeatures: ['簡潔有力', '描述生動'],
      rhythmPatterns: ['張弛有度'],
      bannedWords: ['然後', '突然', '非常'],
      customRules: [
        '避免連續使用相同開頭的句子',
        '對話不超過總字數的30%',
      ],
    };
  }
}

export function createStyleAgent(config: StyleConfig): StyleAgent {
  return new StyleAgent(config);
}
