// Test script for NovelAI
import { createStateManager } from './src/services/StateManager.js';
import { createWriterAgent } from './src/agents/WriterAgent.js';

const state = createStateManager('./data');
const BOOK_ID = '1774938265014-4vwutct61';

async function test() {
  console.log('=== NovelAI 測試 ===\n');

  // 1. 列出書籍
  console.log('1. 列出書籍...');
  const books = await state.listBooks();
  console.log(`   書籍數: ${books.length}`);

  // 2. 載入書籍
  console.log('2. 載入書籍...');
  const book = await state.loadBook(BOOK_ID);
  console.log(`   書名: ${book?.title}`);

  // 3. 測試 Writer Agent
  console.log('3. 測試 Writer Agent...');
  const writer = createWriterAgent({
    provider: 'custom',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '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',
    model: 'openai/gpt-4o-mini',
    chapterWords: 500,
  });

  const result = await writer.writeChapter(BOOK_ID, 1, {
    previousChapterSummary: '這是第一章節',
    currentFocus: '主角開始修煉',
    plotProgression: '主角踏上修仙之路',
    characterStates: [{ name: '主角', description: '年輕修煉者' }],
  });

  console.log(`   生成字數: ${result.wordCount}`);
  console.log(`   內容預覽: ${result.content.substring(0, 100)}...`);

  // 4. 儲存章節
  console.log('4. 儲存章節...');
  const chapter = {
    id: `${Date.now()}`,
    bookId: BOOK_ID,
    number: 1,
    title: '第一章 開始修煉',
    content: result.content,
    status: 'draft' as const,
    wordCount: result.wordCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await state.saveChapter(chapter);
  console.log('   章節已儲存');

  console.log('\n=== 測試完成 ===');
}

test().catch(console.error);
