// NovelAI Architect Agent - 設計章節大綱

import type { Chapter } from '../types/index.js';

export interface ChapterOutline {
  chapterNumber: number;
  purpose: string;
  structure: {
    opening: number;    // 字數比例
    middle: number;
    closing: number;
  };
  beats: Array<{
    position: number;   // 0-1 之間的位置
    type: 'hook' | 'setup' | 'complication' | 'development' | 'turning_point' | 'cliffhanger';
    description: string;
  }>;
  hooks: {
    toAdvance: string[];
    toResolve: string[];
  };
}

export class ArchitectAgent {
  async createOutline(
    chapterNumber: number,
    suggestedFocus: string,
    targetWordCount: number
  ): Promise<ChapterOutline> {
    const opening = Math.round(targetWordCount * 0.15);
    const middle = Math.round(targetWordCount * 0.7);
    const closing = targetWordCount - opening - middle;

    return {
      chapterNumber,
      purpose: suggestedFocus,
      structure: { opening, middle, closing },
      beats: [
        { position: 0, type: 'hook', description: '以緊湊場面開頭' },
        { position: 0.15, type: 'setup', description: '介紹場景和角色' },
        { position: 0.3, type: 'complication', description: '出現衝突或挑戰' },
        { position: 0.5, type: 'development', description: '主要情節發展' },
        { position: 0.7, type: 'turning_point', description: '轉折點' },
        { position: 1, type: 'cliffhanger', description: '留下懸念' },
      ],
      hooks: {
        toAdvance: [],
        toResolve: [],
      },
    };
  }
}

export function createArchitectAgent(): ArchitectAgent {
  return new ArchitectAgent();
}
