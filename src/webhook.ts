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
      return false
