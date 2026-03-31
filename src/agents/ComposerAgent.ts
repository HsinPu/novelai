// NovelAI Composer Agent - 選擇上下文

import type { Chapter, PlotHook, Character } from '../types/index.js';

export interface ComposerContext {
  relevantFacts: string[];
  ruleStack: string[];
  trace: string[];
}

export class ComposerAgent {
  async composeContext(
    bookId: string,
    chapterNumber: number,
    previousChapters: Chapter[],
    hooks: PlotHook[],
    characters: Character[]
  ): Promise<ComposerContext> {
    // 選擇相關的事實
    const relevantFacts: string[] = [];
    
    // 獲取角色狀態
    for (const char of characters.slice(0, 5)) {
      relevantFacts.push(`${char.name}: ${char.attributes.map(a => `${a.key}=${a.value}`).join(', ')}`);
    }

    // 獲取活躍伏筆
    const activeHooks = hooks.filter(h => h.status !== 'resolved').slice(0, 5);
    for (const hook of activeHooks) {
      relevantFacts.push(`伏筆: ${hook.content}`);
    }

    // 構建規則棧
    const ruleStack = [
      'avoid_info_dump',
      'show_dont_tell',
      'character_voice_consistency',
      'tension_buildup',
    ];

    // 記錄軌跡
    const trace = [
      `Composed context for chapter ${chapterNumber}`,
      `Selected ${relevantFacts.length} facts`,
      `Applied ${ruleStack.length} rules`,
    ];

    return { relevantFacts, ruleStack, trace };
  }
}

export function createComposerAgent(): ComposerAgent {
  return new ComposerAgent();
}
