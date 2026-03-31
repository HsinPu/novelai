// NovelAI Config Agent - 配置管理

import * as fs from 'fs';

export interface Config {
  global: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    model: string;
  };
  models: Record<string, {
    provider: string;
    model: string;
    baseUrl?: string;
  }>;
  notification: {
    type: string;
    apiKey?: string;
    webhookUrl?: string;
  };
}

export class ConfigManager {
  private configPath: string;
  private config: Config;

  constructor() {
    this.configPath = process.env.NOVELAI_ENV || './.env';
    this.config = this.load();
  }

  private load(): Config {
    const defaultConfig: Config = {
      global: {
        provider: 'custom',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey: '',
        model: 'openai/gpt-5.4-mini',
      },
      models: {},
      notification: { type: 'none' },
    };

    try {
      // 從 .env 載入
      const envContent = fs.readFileSync(this.configPath, 'utf-8');
      const env: Record<string, string> = {};
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
      });

      defaultConfig.global = {
        provider: env.NOVELAI_LLM_PROVIDER || 'custom',
        baseUrl: env.NOVELAI_LLM_BASE_URL || 'https://openrouter.ai/api/v1',
        apiKey: env.NOVELAI_LLM_API_KEY || '',
        model: env.NOVELAI_LLM_MODEL || 'openai/gpt-5.4-mini',
      };
    } catch (e) {
      // 使用預設
    }

    return defaultConfig;
  }

  getGlobal(): Config['global'] {
    return this.config.global;
  }

  getModel(agent: string): Config['global'] | undefined {
    const agentModel = this.config.models[agent];
    if (agentModel) {
      return {
        ...this.config.global,
        ...agentModel,
      };
    }
    return this.config.global;
  }

  setModel(agent: string, model: string): void {
    this.config.models[agent] = {
      ...this.config.global,
      model,
    };
  }

  getNotification(): Config['notification'] {
    return this.config.notification;
  }

  setNotification(config: Config['notification']): void {
    this.config.notification = config;
  }

  show(): void {
    console.log('\n⚙️  Global Config:');
    console.log(`  Provider: ${this.config.global.provider}`);
    console.log(`  Base URL: ${this.config.global.baseUrl}`);
    console.log(`  Model: ${this.config.global.model}`);
    console.log(`  API Key: ${this.config.global.apiKey ? this.config.global.apiKey.substring(0, 10) + '...' : '(not set)'}`);

    if (Object.keys(this.config.models).length > 0) {
      console.log('\n⚙️  Model Routing:');
      for (const [agent, model] of Object.entries(this.config.models)) {
        console.log(`  ${agent}: ${model.model}`);
      }
    }

    if (this.config.notification.type !== 'none') {
      console.log('\n⚙️  Notification:');
      console.log(`  Type: ${this.config.notification.type}`);
    }
  }

  showModels(): void {
    console.log('\n🤖 Model Routing:');
    console.log('  (Agent not configured uses global)');
    for (const [agent, model] of Object.entries(this.config.models)) {
      console.log(`  ${agent}: ${model.model} (${model.provider})`);
    }
  }

  removeModel(agent: string): void {
    delete this.config.models[agent];
  }
}

export function createConfigManager(): ConfigManager {
  return new ConfigManager();
}
