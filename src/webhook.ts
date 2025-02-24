import crypto from 'crypto';
import { 
  WebhookEvent, 
  WebhookHandlerConfig, 
  WebhookHandlerCallbacks,
  WebhookMessage,
  WebhookStatus
} from './types';

export class WebhookHandler {
  private config: WebhookHandlerConfig;

  constructor(config: WebhookHandlerConfig = {}) {
    this.config = config;
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | false {
    if (this.config.verifyToken && mode === 'subscribe' && token === this.config.verifyToken) {
      return challenge;
    }
    return false;
  }

  validateSignature(signature: string, body: string | Buffer): boolean {
    if (!this.config.appSecret) {
      return true;
    }

    if (!signature) {
      return false;
    }

    const signatureParts = signature.split('=');
    const algorithm = signatureParts[0];
    const expectedSignature = signatureParts[1];

    const hmac = crypto.createHmac(algorithm, this.config.appSecret);
    const bodyString = typeof body === 'string' ? body : body.toString();
    const calculatedSignature = hmac.update(bodyString).digest('hex');

    return calculatedSignature === expectedSignature;
  }

  handleWebhook(event: WebhookEvent, callbacks: WebhookHandlerCallbacks): void {
    if (!event.entry || !Array.isArray(event.entry)) {
      return;
    }

    for (const entry of event.entry) {
      if (!entry.changes || !Array.isArray(entry.changes)) {
        continue;
      }

      for (const change of entry.changes) {
        const value = change.value;
        
        if (!value || value.messaging_product !== 'whatsapp') {
          continue;
        }

        if (value.messages && Array.isArray(value.messages) && callbacks.onMessage) {
          for (const message of value.messages) {
            callbacks.onMessage(message as WebhookMessage);
          }
        }

        if (value.statuses && Array.isArray(value.statuses) && callbacks.onStatus) {
          for (const status of value.statuses) {
            callbacks.onStatus(status as WebhookStatus);
          }
        }
      }
    }
  }
}
