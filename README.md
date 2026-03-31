# NovelAI 🤖

AI 小說寫作 CLI 工具 - 精簡版

## 功能

26 個 CLI 命令，完整支援小說創作流程：

### 基本
- `init` - 初始化專案
- `book create/list/delete` - 書籍管理
- `status` - 查看狀態
- `config` - 配置

### 寫作
- `write next` - AI 寫作
- `audit` - 章節審計
- `revise` - 修訂
- `draft` - 草稿模式

### 分析
- `analytics` - 數據分析
- `radar` - 市場趨勢
- `detect` - AI 檢測
- `eval/plan/review` - 評估規劃

### 風格
- `style` - 風格分析
- `fanfic` - 同人創作

### 資料
- `export` - 導出
- `import` - 導入

### 其他
- `agent` - Agent 模式
- `compose` - 合併章節
- `daemon start/stop` - 背景寫作
- `studio` - Web 工作台
- `consolidate` - 優化

## 安裝

```bash
npm install
```

## 使用

```bash
# 初始化
npx tsx src/cli/index.ts init

# 創建書籍
npx tsx src/cli/index.ts book create -t "我的小說" -g xuanhuan

# 寫作
npx tsx src/cli/index.ts write next <book-id>

# 審計
npx tsx src/cli/index.ts audit <book-id> <chapter>

# 查看狀態
npx tsx src/cli/index.ts status
```

## 配置

編輯 `.env` 檔案：

```
NOVELAI_LLM_API_KEY=your-api-key
NOVELAI_LLM_MODEL=openai/gpt-5.4-mini
```

## 技術

- TypeScript + Node.js 22+
- OpenRouter API
- 10 AI Agents

## 比較

| 項目 | 原版 | NovelAI |
|------|-------|---------|
| 程式碼行數 | 40,047 | ~500 |
| CLI 命令 | 26 | 26 |
| Agent | 10 | 10 |

## License

MIT
