// NovelAI Notification Service - 通知系統

export type NotificationType = 'telegram' | 'feishu' | 'wecom' | 'webhook';

export interface NotificationConfig {
  type: NotificationType;
  apiKey?: string;
  webhookUrl?: string;
  chatId?: string;
}

export interface NotificationMessage {
  title: string;
  body: string;
  extra?: Record<string, unknown>;
}

export class NotificationService {
  private config: NotificationConfig | null = null;

  configure(config: NotificationConfig): void {
    this.config = config;
  }

  async send(message: NotificationMessage): Promise<boolean> {
    if (!this.config) {
      console.log('Notification not configured, skipping...');
      return false;
    }

    try {
      switch (this.config.type) {
        case 'telegram':
          return await this.sendTelegram(message);
        case 'feishu':
          return await this.sendFeishu(message);
        case 'wecom':
          return await this.sendWecom(message);
        case 'webhook':
          return await this.sendWebhook(message);
        default:
          return false;
      }
    } catch (error) {
      console.error('Notification Error:', (error as Error).message);
      return false;
    }
  }

  private async sendTelegram(message: NotificationMessage): Promise<boolean> {
    if (!this.config?.apiKey || !this.config?.chatId) return false;

    const response = await fetch(`https://api.telegram.org/bot${this.config.apiKey}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.config.chatId,
        text: `📖 *${message.title}*\n\n${message.body}`,
        parse_mode: 'Markdown',
      }),
    });

    return response.ok;
  }

  private async sendFeishu(message: NotificationMessage): Promise<boolean> {
    if (!this.config?.webhookUrl) return false;

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'text',
        content: { text: `📖 ${message.title}\n\n${message.body}` },
      }),
    });

    return response.ok;
  }

  private async sendWecom(message: NotificationMessage): Promise<boolean> {
    if (!this.config?.webhookUrl) return false;

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msgtype: 'text',
        text: { content: `📖 ${message.title}\n\n${message.body}` },
      }),
    });

    return response.ok;
  }

  private async sendWebhook(message: NotificationMessage): Promise<boolean> {
    if (!this.config?.webhookUrl) return false;

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    return response.ok;
  }

  // 便捷方法
  async notifyChapterWritten(bookTitle: string, chapterNumber: number, wordCount: number): Promise<boolean> {
    return this.send({
      title: '✍️ 新章節已完成',
      body: `${bookTitle} 第 ${chapterNumber} 章\n字數: ${wordCount}`,
    });
  }

  async notifyAuditFailed(bookTitle: string, chapterNumber: number, issues: number): Promise<boolean> {
    return this.send({
      title: '⚠️ 審計未通過',
      body: `${bookTitle} 第 ${chapterNumber} 章\n發現 ${issues} 個問題`,
    });
  }

  async notifyError(error: string): Promise<boolean> {
    return this.send({
      title: '❌ 發生錯誤',
      body: error,
    });
  }
}

export function createNotificationService(): NotificationService {
  return new NotificationService();
}
