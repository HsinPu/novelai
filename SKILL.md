---
name: novelai
description: AI novel writing CLI tool - use for creative fiction writing, chapter generation, style imitation, chapter import/export, and batch writing. Supports Chinese web novel genres (xuanhuan, xianxia, urban, horror, other). Simplified multi-agent pipeline, 33-dimension auditing, and custom OpenAI-compatible provider support.
version: 1.0.0
metadata: { "openclaw": { "emoji": "🤖", "requires": { "bins": ["node", "tsx"], "env": ["NOVELAI_LLM_API_KEY"] }, "primaryEnv": "", "homepage": "https://github.com/openclaw/novelai", "install": [{ "id": "git", "kind": "git", "repo": "https://github.com/openclaw/novelai", "label": "Install NovelAI" }, { "id": "npm", "kind": "node", "package": "novelai", "label": "Install via npm (if published)" }] } }
---

# NovelAI - AI Novel Writing CLI

NovelAI is a CLI tool for AI-powered fiction writing. It uses a multi-agent pipeline to generate, audit, and revise novel content with minimal human intervention.

The pipeline operates in three phases:
- **Phase 1 (Creative Writing, temp 0.7)**: Planner generates chapter intent, Writer produces prose with length governance.
- **Phase 2 (State Settlement)**: Observer extracts facts, Auditor checks quality.
- **Phase 3 (Quality Loop)**: Normalizer adjusts chapter length, Reviser fixes issues. Self-correction loop runs until issues clear.

## Installation

### Via Git Clone
```bash
# Clone the project
git clone https://github.com/openclaw/novelai.git
cd novelai

# Install dependencies
npm install
```

### Via npm (if published)
```bash
npm install -g novelai
```

### Configuration

Create a `.env` file in the project root:

```bash
# Required
NOVELAI_LLM_API_KEY=your-api-key
NOVELAI_LLM_MODEL=openai/gpt-5.4-mini

# Optional
NOVELAI_LLM_BASE_URL=https://openrouter.ai/api/v1
NOVELAI_LLM_TEMPERATURE=0.7
NOVELAI_LLM_MAX_TOKENS=8192
```

## When to Use NovelAI

- **Chinese web novel writing**: Built-in Chinese genres (xuanhuan, xianxia, urban, horror, other)
- **Batch chapter generation**: Generate multiple chapters with consistent quality
- **Import & continue**: Import existing chapters from a text file and continue writing
- **Style imitation**: Analyze and adopt writing styles from reference texts
- **Quality auditing**: Perform 33-dimension quality checks
- **Analytics**: Track word count, audit pass rate, and issue distribution per book

## Initial Setup

### First Time Setup
```bash
# Navigate to project directory
cd novelai

# Initialize project
npx tsx src/cli/index.ts init

# Configure your LLM provider (OpenAI-compatible)
# Edit .env file:
NOVELAI_LLM_API_KEY=your-api-key
NOVELAI_LLM_MODEL=openai/gpt-5.4-mini
```

### View System Status
```bash
npx tsx src/cli/index.ts doctor
npx tsx src/cli/index.ts status
```

## Common Workflows

### Workflow 1: Create a New Novel

1. **Initialize and create book**:
   ```bash
   npx tsx src/cli/index.ts book create -t "My Novel Title" -g xuanhuan
   ```
   - Genres: `xuanhuan` (cultivation), `xianxia` (immortal), `urban` (city), `horror`, `other`
   - Returns a `book-id` for all subsequent operations

2. **Generate chapters** (e.g., 3 chapters):
   ```bash
   npx tsx src/cli/index.ts write next book-id --count 3
   ```
   - The `write next` command runs the pipeline: draft → audit → revise
   - Returns chapter details and quality metrics

3. **View status**:
   ```bash
   npx tsx src/cli/index.ts status book-id
   ```

4. **Export the book**:
   ```bash
   npx tsx src/cli/index.ts export book-id
   ```

### Workflow 2: Continue Writing

1. **List your books**:
   ```bash
   npx tsx src/cli/index.ts book list
   ```

2. **Continue from last chapter**:
   ```bash
   npx tsx src/cli/index.ts write next book-id --count 3
   ```

### Workflow 3: Import Existing Chapters

1. **Import from text file**:
   ```bash
   npx tsx src/cli/index.ts import book-id novel.txt
   ```

2. **Continue writing**:
   ```bash
   npx tsx src/cli/index.ts write next book-id
   ```

### Workflow 4: Style Imitation

1. **Analyze reference text**:
   ```bash
   npx tsx src/cli/index.ts style reference_text.txt
   ```

2. **Import style to your book**:
   ```bash
   npx tsx src/cli/index.ts style import reference_text.txt book-id
   ```

### Workflow 5: Quality Control

1. **Generate draft**:
   ```bash
   npx tsx src/cli/index.ts draft book-id chapter-n
   ```

2. **Audit the chapter**:
   ```bash
   npx tsx src/cli/index.ts audit book-id chapter-n
   ```

3. **Revise if needed**:
   ```bash
   npx tsx src/cli/index.ts revise book-id chapter-n
   ```

### Workflow 6: View Analytics

```bash
npx tsx src/cli/index.ts analytics book-id
```

### Workflow 7: Fan Fiction

```bash
npx tsx src/cli/index.ts fanfic init parent-book-id --mode canon
```

## Advanced: Natural Language Agent Mode

```bash
npx tsx src/cli/index.ts agent "寫一部都市題材的小說"
```

## Command Reference Summary

| Command | Purpose |
|---------|---------|
| `init` | Initialize project |
| `book create` | Create new book |
| `book list` | List all books |
| `book delete` | Delete book |
| `write next` | Write next chapter (full pipeline) |
| `draft` | Generate draft only |
| `audit` | Quality check (33-dimension) |
| `revise` | Revise chapter |
| `status` | View book status |
| `export` | Export book (txt) |
| `import` | Import chapters |
| `style analyze` | Analyze reference text |
| `style import` | Apply style to book |
| `fanfic init` | Create fanfic |
| `radar` | Market trends |
| `detect` | AIGC detection |
| `analytics` | View statistics |
| `config` | Show configuration |
| `doctor` | Diagnose issues |
| `update` | Check for updates |
| `daemon start/stop` | Background writing |
| `consolidate` | Optimize storage |

## Configuration

Edit `.env` file:

```
NOVELAI_LLM_API_KEY=your-api-key
NOVELAI_LLM_MODEL=openai/gpt-5.4-mini
NOVELAI_LLM_BASE_URL=https://openrouter.ai/api/v1
```

## Tips for Best Results

1. **Provide rich context**: Use `--context` for narrative guidance
2. **Import first**: For existing novels, import chapters before continuing
3. **Review regularly**: Check audit results for quality issues
4. **Monitor analytics**: Track quality trends over time
5. **Export frequently**: Keep backups

## Support & Resources

- **Homepage**: (NovelAI project)
- **Configuration**: Stored in `.env` file
- **Data**: Located in `data/` directory
