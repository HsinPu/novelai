// NovelAI Types - 參考 NovelAI 的類型定義

export type BookGenre = 'xuanhuan' | 'xiuxian' | 'dushi' | 'kehuan' | 'lingyi';

export interface Book {
  id: string;
  title: string;
  genre: BookGenre;
  brief?: string;
  chapterWords: number;
  targetChapters: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string;
  status: ChapterStatus;
  wordCount: number;
  auditScore?: number;
  createdAt: string;
  updatedAt: string;
}

export type ChapterStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'revision';

export interface Character {
  id: string;
  name: string;
  attributes: Array<{ key: string; value: string }>;
  firstAppearance?: number;
}

export interface PlotHook {
  id: string;
  content: string;
  status: 'open' | 'progressing' | 'deferred' | 'resolved';
  firstAppearance: number;
  resolvedAt?: number;
}

export interface WorldState {
  locations: Array<{ id: string; name: string; description: string }>;
  time: string;
}

export interface AuthorIntent {
  premise: string;
  targetAudience: string;
  tone: string;
}

export interface AuditResult {
  chapterId: number;
  score: number;
  dimensions: Array<{
    name: string;
    score: number;
    maxScore: number;
    comments: string;
  }>;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
  antiAIDetection: {
    detected: boolean;
    score: number;
    issues: string[];
  };
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface WritingContext {
  previousChapterSummary: string;
  currentFocus: string;
  plotProgression: string;
  characterStates: Array<{
    name: string;
    description: string;
  }>;
}
