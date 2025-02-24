import { WhatsAppCloudAPI, ExtendedClientConfig } from './client';
import { WebhookHandler } from './webhook';
import { RateLimiter } from './rate-limiter';
import { ErrorHandler } from './error-handler';
import { FacebookBusinessAPI, BusinessClientConfig } from './business-client';

export { 
  WhatsAppCloudAPI, 
  WebhookHandler, 
  RateLimiter, 
  ErrorHandler,
  FacebookBusinessAPI 
};
export * from './types';
export * from './business-types';

export function createClient(config: ExtendedClientConfig) {
  return new WhatsAppCloudAPI(config);
}

export function createWebhookHandler(config?: {
  appSecret?: string;
  verifyToken?: string;
}) {
  return new WebhookHandler(config);
}

export function createBusinessClient(config: BusinessClientConfig) {
  return new FacebookBusinessAPI(config);
}
