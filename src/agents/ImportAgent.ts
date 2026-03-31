// NovelAI Import Agent - 導入章節

import { createStateManager } from '../services/StateManager.js';
import type { Chapter } from '../types/index.js';

export interface ImportConfig {
  splitMode: 'chapter' | 'custom';
  resumeFrom?: number;
}

export class ImportAgent {
  private state: ReturnType<typeof createStateManager>;

  constructor() {
    this.state = createStateManager('./data');
  }

  async importChapters(
    bookId: string,
    filePath: string,
    config: ImportConfig
  ): Promise<{ imported: number; failed: number }> {
    const content = await import('fs/promises').then(fs => 
      fs.readFile(filePath, 'utf-8')
    );

    // 按章節分割
    const chapters = this.splitByChapters(content, config.splitMode);
    
    let imported = 0;
    let failed = 0;

    for (const [index, chapterContent] of chapters.entries()) {
      const chapterNum = index + 1;
      
      // 跳過已存在的章節（如果設定 resumeFrom）
      if (config.resumeFrom && chapterNum <= config.resumeFrom) continue;

      try {
        const chapter: Chapter = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bookId,
          number: chapterNum,
          title: this.extractTitle(chapterContent) || `第 ${chapterNum} 章`,
          content: chapterContent,
          status: 'draft',
          wordCount: chapterContent.split(/\s+/).filter(w => w).length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.state.saveChapter(chapter);
        imported++;
      } catch (e) {
        failed++;
      }
    }

    return { imported, failed };
  }

  private splitByChapters(content: string, mode: string): string[] {
    if (mode === 'chapter') {
      // 按 "第X章" 或 "Chapter X" 分割
      const pattern = /(?:^|\n)(?:#{1,6}\s*)?(?:第[零一二三四五六七八九十百千\d]+章|Chapter\s+\d+|第\s*\d+\s*章)/gi;
      const parts = content.split(pattern).filter(p => p.trim());
      
      if (parts.length > 0) return parts;
    }
    
    // 簡單分割：按空行分段
    return content.split(/\n\n+/).filter(p => p.trim().length > 100);
  }

  private extractTitle(content: string): string | null {
    const match = content.match(/(?:^|\n)(?:#{1,6}\s*)?([^#\n]+)/);
    return match ? match[1].trim().substring(0, 50) : null;
  }
}

export function createImportAgent(): ImportAgent {
  return new ImportAgent();
}
