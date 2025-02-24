export interface RateLimitOptions {
  maxRequestsPerMinute: number;
  retryAfterTooManyRequests: boolean;
  maxRetries: number;
  retryDelayMs: number;
}

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private options: RateLimitOptions;
  
  constructor(options: Partial<RateLimitOptions> = {}) {
    this.options = {
      maxRequestsPerMinute: 250, // WhatsApp's default limit
      retryAfterTooManyRequests: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      ...options
    };
  }
  
  async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForRateLimit();
    
    try {
      const result = await fn();
      this.recordRequest();
      return result;
    } catch (error: any) {
      if (
        this.options.retryAfterTooManyRequests && 
        this.isTooManyRequestsError(error) && 
        this.getRetryCount(error) < this.options.maxRetries
      ) {
        return this.retryAfterDelay(fn, error);
      }
      
      throw error;
    }
  }
  
  private async waitForRateLimit(): Promise<void> {
    this.cleanupOldRequests();
    
    if (this.requestTimestamps.length >= this.options.maxRequestsPerMinute) {
      const oldestRequest = this.requestTimestamps[0];
      const now = Date.now();
      const timeSinceOldest = now - oldestRequest;
      const timeToWait = Math.max(0, 60 * 1000 - timeSinceOldest);
      
      if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
      }
    }
  }
  
  private cleanupOldRequests(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => timestamp > oneMinuteAgo
    );
  }
  
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }
  
  private isTooManyRequestsError(error: any): boolean {
    return (
      error.code === 4 || 
      (error.response?.status === 429) || 
      (error.type === 'OAuthException' && error.code === 80004) 
    );
  }
  
  private getRetryCount(error: any): number {
    return error._retryCount || 0;
  }
  
  private async retryAfterDelay<T>(
    fn: () => Promise<T>, 
    error: any
  ): Promise<T> {
    const retryCount = this.getRetryCount(error) + 1;
    error._retryCount = retryCount;
    
    const retryAfterHeader = error.response?.headers?.['retry-after'];
    let delayMs = this.options.retryDelayMs;
    
    if (retryAfterHeader) {
      const retryAfterSeconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(retryAfterSeconds)) {
        delayMs = retryAfterSeconds * 1000;
      }
    }
    
    
    delayMs = delayMs * Math.pow(2, retryCount - 1);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return this.executeWithRateLimit(fn);
  }
}
