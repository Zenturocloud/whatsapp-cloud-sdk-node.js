import { WhatsAppCloudAPI } from './client';
import { WebhookHandler } from './webhook';

export { WhatsAppCloudAPI, WebhookHandler };
export * from './types';

export function createClient(config: {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  version?: string;
}) {
  return new WhatsAppCloudAPI(config);
}

export function createWebhookHandler(config?: {
  appSecret?: string;
  verifyToken?: string;
}) {
  return new WebhookHandler(config);
}
