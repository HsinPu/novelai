// NovelAI Fanfic Agent - 同人創作模式

import { createStateManager } from '../services/StateManager.js';
import type { Book, BookGenre } from '../types/index.js';

export type FanficMode = 'canon' | 'au' | 'ooc' | 'cp';

export interface FanficConfig {
  parentBookId: string;
  mode: FanficMode;
  title: string;
}

export class FanficAgent {
  private state: ReturnType<typeof createStateManager>;

  constructor() {
    this.state = createStateManager('./data');
  }

  async createFanficBook(config: FanficConfig): Promise<Book> {
    // 獲取原作
    const parentBook = await this.state.loadBook(config.parentBookId);
    if (!parentBook) {
      throw new Error('Parent book not found');
    }

    // 建立同人書
    const fanficBook = await this.state.createBook(
      config.title,
      parentBook.genre,
      `同人作品 - 模式: ${config.mode}`
    );

    // 根據模式處理
    switch (config.mode) {
      case 'canon':
        await this.importCanon(config.parentBookId, fanficBook.id);
        break;
      case 'au':
        await this.setupAU(fanficBook.id);
        break;
      case 'ooc':
        await this.setupOOC(fanficBook.id);
        break;
      case 'cp':
        await this.setupCP(fanficBook.id);
        break;
    }

    return fanficBook;
  }

  private async importCanon(parentId: string, childId: string): Promise<void> {
    // 導入正傳設定
    const parentTruth = await Promise.all([
      this.state.getTruthFile(parentId, 'character_matrix.json'),
      this.state.getTruthFile(parentId, 'current_state.json'),
    ]);

    // 寫入同人書
    await this.state.updateTruthFile(childId, 'character_matrix.json', parentTruth[0]);
    await this.state.updateTruthFile(childId, 'current_state.json', parentTruth[1]);
    await this.state.updateTruthFile(childId, 'author_intent.json', {
      mode: 'canon',
      parent: parentId,
      note: '延續正典世界观',
    });
  }

  private async setupAU(bookId: string): Promise<void> {
    await this.state.updateTruthFile(bookId, 'author_intent.json', {
      mode: 'au',
      note: '架空世界 - 保留角色但改變設定',
    });
  }

  private async setupOOC(bookId: string): Promise<void> {
    await this.state.updateTruthFile(bookId, 'author_intent.json', {
      mode: 'ooc',
      note: '性格重塑 - 改變角色性格特徵',
    });
  }

  private async setupCP(bookId: string): Promise<void> {
    await this.state.updateTruthFile(bookId, 'author_intent.json', {
      mode: 'cp',
      note: 'CP向 - 以角色互動為核心',
    });
  }

  async getAllowedCharacters(bookId: string): Promise<string[]> {
    // 獲取允許使用的角色列表
    const intent = await this.state.getTruthFile(bookId, 'author_intent.json') as { mode: string; parent?: string };
    
    if (intent?.parent) {
      const characters = await this.state.getTruthFile(intent.parent, 'character_matrix.json');
      return (characters as Array<{ name: string }>)?.map(c => c.name) || [];
    }
    
    return [];
  }
}

export function createFanficAgent(): FanficAgent {
  return new FanficAgent();
}
