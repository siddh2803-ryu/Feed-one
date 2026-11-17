/**
 * Feed One: Token Bucket Rate Limiter
 */
export class TokenBucketLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRatePerSec: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  tryConsume(tokens = 1): boolean {
    this.refill();
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRatePerSec);
    this.lastRefill = now;
  }
}
