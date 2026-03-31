// NovelAI Normalizer Agent - 字數治理

export interface LengthSpec {
  targetWords: number;
  tolerance: number;
  minWords: number;
  maxWords: number;
}

export class NormalizerAgent {
  private spec: LengthSpec;

  constructor(spec: LengthSpec) {
    this.spec = spec;
  }

  analyze(content: string): {
    originalLength: number;
    targetLength: number;
    adjustment: 'none' | 'expand' | 'compress';
    methods: Array<{ type: string; description: string }>;
  } {
    const originalLength = content.split(/\s+/).filter(w => w).length;
    const adjustment = originalLength > this.spec.maxWords 
      ? 'compress' 
      : originalLength < this.spec.minWords 
        ? 'expand' 
        : 'none';

    return {
      originalLength,
      targetLength: this.spec.targetWords,
      adjustment,
      methods: adjustment === 'none' ? [] : [
        { type: 'add_dialogue', description: '在關鍵情節處添加人物對話' },
        { type: 'add_inner_thought', description: '在主角決策時添加內心獨白' },
        { type: 'expand_description', description: '擴展場景或物品描寫' },
        { type: 'add_action', description: '添加角色動作' },
      ],
    };
  }

  normalize(content: string): string {
    const { adjustment } = this.analyze(content);
    if (adjustment === 'none') return content;
    // 簡化版：直接截斷或填充
    const words = content.split(/\s+/).filter(w => w);
    if (adjustment === 'compress' && words.length > this.spec.maxWords) {
      return words.slice(0, this.spec.maxWords).join(' ') + '...';
    }
    if (adjustment === 'expand' && words.length < this.spec.minWords) {
      return content + '\n\n（本章節內容仍在創作中...)';
    }
    return content;
  }

  recordLength(wordCount: number): void {
    // 記錄歷史用於分析
  }
}

export function createNormalizerAgent(spec: LengthSpec): NormalizerAgent {
  return new NormalizerAgent(spec);
}

export function createLengthGovernorForGenre(genre: string): NormalizerAgent {
  const specs: Record<string, LengthSpec> = {
    xuanhuan: { targetWords: 5000, tolerance: 0.2, minWords: 4000, maxWords: 6000 },
    xiuxian: { targetWords: 4500, tolerance: 0.2, minWords: 3600, maxWords: 5400 },
    dushi: { targetWords: 4000, tolerance: 0.2, minWords: 3200, maxWords: 4800 },
    kehuan: { targetWords: 4500, tolerance: 0.2, minWords: 3600, maxWords: 5400 },
    lingyi: { targetWords: 3500, tolerance: 0.2, minWords: 2800, maxWords: 4200 },
  };
  return createNormalizerAgent(specs[genre] || specs.xuanhuan);
}
