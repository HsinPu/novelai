// NovelAI Background Daemon - 背景守護進程

import { createWriterAgent } from '../agents/WriterAgent.js';
import { createAuditorAgent } from '../agents/AuditorAgent.js';
import { createReviserAgent } from '../agents/ReviserAgent.js';
import { createStateManager } from './StateManager.js';
import type { LLMConfig, Book } from '../types/index.js';

export interface DaemonConfig {
  llmConfig: LLMConfig;
  intervalMinutes: number;
  chaptersBeforeAudit: number;
  autoAudit: boolean;
  notifyOnComplete: boolean;
}

export interface DaemonStatus {
  isRunning: boolean;
  currentBook: string | null;
  chaptersWritten: number;
  lastError: string | null;
  nextWriteTime: string | null;
}

export class BackgroundDaemon {
  private config: DaemonConfig;
  private state: ReturnType<typeof createStateManager>;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private onStatusChange: ((status: DaemonStatus) => void) | null = null;

  constructor(config: DaemonConfig) {
    this.config = config;
    this.state = createStateManager('./data');
  }

  setStatusCallback(callback: (status: DaemonStatus) => void): void {
    this.onStatusChange = callback;
  }

  private emitStatus(status: DaemonStatus): void {
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
  }

  async start(bookId: string): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    
    this.emitStatus({
      isRunning: true,
      currentBook: bookId,
      chaptersWritten: 0,
      lastError: null,
      nextWriteTime: new Date(Date.now() + this.config.intervalMinutes * 60000).toISOString(),
    });

    // 啟動定時寫作
    this.scheduleNextWrite(bookId);
  }

  private scheduleNextWrite(bookId: string): void {
    if (!this.isRunning) return;

    this.timer = setTimeout(async () => {
      await this.writeNextChapter(bookId);
      if (this.isRunning) {
        this.scheduleNextWrite(bookId);
      }
    }, this.config.intervalMinutes * 60 * 1000);
  }

  private async writeNextChapter(bookId: string): Promise<void> {
    try {
      const book = await this.state.loadBook(bookId);
      if (!book) {
        this.stop();
        return;
      }

      const chapters = await this.state.getAllChapters(bookId);
      const nextNumber = chapters.length + 1;

      // 建立 Writer
      const writer = createWriterAgent({
        provider: this.config.llmConfig.provider,
        baseUrl: this.config.llmConfig.baseUrl,
        apiKey: this.config.llmConfig.apiKey,
        model: this.config.llmConfig.model,
        chapterWords: book.chapterWords,
      });

      // 寫作
      const result = await writer.writeChapter(bookId, nextNumber, {
        previousChapterSummary: chapters[chapters.length - 1]?.content?.substring(0, 500) || '',
        currentFocus: '繼續發展劇情',
        plotProgression: `第 ${nextNumber} 章`,
        characterStates: [],
      });

      // 儲存章節
      await this.state.saveChapter({
        id: `${Date.now()}`,
        bookId,
        number: nextNumber,
        title: `第 ${nextNumber} 章`,
        content: result.content,
        status: 'draft',
        wordCount: result.wordCount,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      this.emitStatus({
        isRunning: this.isRunning,
        currentBook: bookId,
        chaptersWritten: chapters.length + 1,
        lastError: null,
        nextWriteTime: new Date(Date.now() + this.config.intervalMinutes * 60000).toISOString(),
      });

      // 如果需要自動審計
      if (this.config.autoAudit && (chapters.length + 1) % this.config.chaptersBeforeAudit === 0) {
        // TODO: 觸發審計
      }

    } catch (error) {
      this.emitStatus({
        isRunning: this.isRunning,
        currentBook: bookId,
        chaptersWritten: 0,
        lastError: (error as Error).message,
        nextWriteTime: null,
      });
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.emitStatus({
      isRunning: false,
      currentBook: null,
      chaptersWritten: 0,
      lastError: null,
      nextWriteTime: null,
    });
  }

  getStatus(): DaemonStatus {
    return {
      isRunning: this.isRunning,
      currentBook: null,
      chaptersWritten: 0,
      lastError: null,
      nextWriteTime: null,
    };
  }
}

export function createBackgroundDaemon(config: DaemonConfig): BackgroundDaemon {
  return new BackgroundDaemon(config);
}
