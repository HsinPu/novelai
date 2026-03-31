// NovelAI State Manager - 精簡版

import * as fs from 'fs';
import * as path from 'path';
import type { Book, Chapter, AuditResult } from '../types/index.js';

const DATA_DIR = './data';

async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 書籍操作
export async function listBooks(): Promise<Book[]> {
  ensureDir(DATA_DIR);
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf-8')));
}

export async function createBook(title: string, genre: string, brief?: string): Promise<Book> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const book: Book = { id, title, genre: genre as Book['genre'], brief, chapterWords: 5000, targetChapters: 100, status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  ensureDir(path.join(DATA_DIR, id, 'chapters'));
  ensureDir(path.join(DATA_DIR, id, 'story'));
  fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(book, null, 2));
  return book;
}

export async function loadBook(id: string): Promise<Book | null> {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${id}.json`), 'utf-8')); } catch { return null; }
}

export async function deleteBook(id: string): Promise<void> {
  try { 
    fs.rmSync(path.join(DATA_DIR, id), { recursive: true, force: true });
    fs.unlinkSync(path.join(DATA_DIR, `${id}.json`));
  } catch {}
}

// 章節操作
export async function getChapters(bookId: string): Promise<Chapter[]> {
  const dir = path.join(DATA_DIR, bookId, 'chapters');
  ensureDir(dir);
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => 
    JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
  ).sort((a, b) => a.number - b.number);
}

export async function getChapter(bookId: string, num: number): Promise<Chapter | null> {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, bookId, 'chapters', `${num}.json`), 'utf-8')); } catch { return null; }
}

export async function saveChapter(c: Chapter): Promise<void> {
  const dir = path.join(DATA_DIR, c.bookId, 'chapters');
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${c.number}.json`), JSON.stringify(c, null, 2));
}

// 審計操作
export async function saveAudit(bookId: string, num: number, r: AuditResult): Promise<void> {
  const dir = path.join(DATA_DIR, bookId, 'audits');
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${num}.json`), JSON.stringify(r, null, 2));
}

export async function getAudit(bookId: string, num: number): Promise<AuditResult | null> {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, bookId, 'audits', `${num}.json`), 'utf-8')); } catch { return null; }
}

// 真相文件
export async function getTruthFile(bookId: string, file: string): Promise<unknown> {
  try { return JSON.parse(fs.readFileSync(path.join(DATA_DIR, bookId, 'story', file), 'utf-8')); } catch { return null; }
}

export async function updateTruthFile(bookId: string, file: string, data: unknown): Promise<void> {
  fs.writeFileSync(path.join(DATA_DIR, bookId, 'story', file), JSON.stringify(data, null, 2));
}
