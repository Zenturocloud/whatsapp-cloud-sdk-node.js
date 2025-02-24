import { WhatsAppCloudAPI, ExtendedClientConfig } from './client';
import { WebhookHandler } from './webhook';
import { RateLimiter } from './rate-limiter';
import { ErrorHandler } from './error-handler';

export { WhatsAppCloudAPI, WebhookHandler, RateLimiter, ErrorHandler };
export * from './types';

export function createClient(config: ExtendedClientConfig) {
  return new WhatsAppCloudAPI(config);
}

export function createWebhookHandler(config?: {
  appSecret?: string;
  verifyToken?: string;
}) {
  return new WebhookHandler(config);
}
