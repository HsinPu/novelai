// NovelAI Observer Agent - 從正文提取事實

import type { Chapter } from '../types/index.js';

export interface ExtractedFacts {
  characters: Array<{ name: string; location: string; emotion: string }>;
  locations: string[];
  resources: Array<{ name: string; quantity: number }>;
  relationships: Array<{ from: string; to: string; type: string }>;
  plotInfo: string[];
  timeReference: string;
  physicalState: string[];
}

export class ObserverAgent {
  async extractFacts(chapter: Chapter): Promise<ExtractedFacts> {
    return {
      characters: [],
      locations: [],
      resources: [],
      relationships: [],
      plotInfo: [],
      timeReference: '現在',
      physicalState: [],
    };
  }
}

export function createObserverAgent(): ObserverAgent {
  return new ObserverAgent();
}
