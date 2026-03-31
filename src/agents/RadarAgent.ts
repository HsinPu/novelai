// NovelAI Radar Agent - 市場趨勢掃描

import { LLMService } from '../services/LLMService.js';

export interface RadarConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface TrendData {
  popularGenres: Array<{ genre: string; score: number }>;
  trendingThemes: string[];
  audiencePreferences: string[];
  recommendations: string[];
}

export class RadarAgent {
  private llm: LLMService;

  constructor(config: RadarConfig) {
    this.llm = new LLMService({
      provider: config.provider,
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      model: config.model,
      temperature: 0.5,
      maxTokens: 4096,
    });
  }

  async scanMarket(): Promise<TrendData> {
    const prompt = `請分析當前網路小說市場的趨勢，包括：

1. 熱門題材排名
2. 流行主題
3. 讀者偏好
4. 建議的新人切入點

請以 JSON 格式輸出：
{
  "popularGenres": [{"genre": "題材", "score": 0-100}],
  "trendingThemes": ["主題1", "主題2"],
  "audiencePreferences": ["偏好1", "偏好2"],
  "recommendations": ["建議1", "建議2"]
}`;

    try {
      const response = await this.llm.chat([
        {
          role: 'system',
          content: '你是一個專業的網路文學市場分析師。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      try {
        const match = response.content.match(/\{[\s\S]*\}/);
        if (match) {
          return JSON.parse(match[0]);
        }
      } catch (e) {
        // 解析失敗
      }
    } catch (error) {
      console.error('Radar Error:', (error as Error).message);
    }

    return this.getDefaultTrends();
  }

  private getDefaultTrends(): TrendData {
    return {
      popularGenres: [
        { genre: '玄幻', score: 95 },
        { genre: '仙俠', score: 88 },
        { genre: '都市', score: 85 },
        { genre: '科幻', score: 75 },
        { genre: '遊戲', score: 70 },
      ],
      trendingThemes: ['系統流', '重生', '穿越', '修仙', '敗家子'],
      audiencePreferences: ['快節奏', '爽點多', '女主角', '殺伐果斷'],
      recommendations: [
        '建議新手從都市修仙開始',
        '系統流容易上手',
        '避免太長的前期鋪墊',
      ],
    };
  }
}

export function createRadarAgent(config: RadarConfig): RadarAgent {
  return new RadarAgent(config);
}
