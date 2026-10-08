// A token bucket: each key gets `capacity` tokens that refill continuously at
// `refillPerSecond`. A request spends one token; an empty bucket is limited.
export interface BucketOptions {
  capacity: number;
  refillPerSecond: number;
}

export interface TakeResult {
  allowed: boolean;
  remaining: number;
  // Seconds until the next token is available (0 when allowed).
  retryAfter: number;
}

interface BucketState {
  tokens: number;
  updatedAt: number;
}

export class TokenBucket {
  private readonly buckets = new Map<string, BucketState>();

  constructor(private readonly options: BucketOptions) {}

  take(key: string, now = Date.now()): TakeResult {
    const { capacity, refillPerSecond } = this.options;
    const state = this.buckets.get(key) ?? { tokens: capacity, updatedAt: now };
    const elapsed = Math.max(0, now - state.updatedAt) / 1000;
    const tokens = Math.min(capacity, state.tokens + elapsed * refillPerSecond);

    if (tokens < 1) {
      this.buckets.set(key, { tokens, updatedAt: now });
      return { allowed: false, remaining: 0, retryAfter: Math.ceil((1 - tokens) / refillPerSecond) };
    }
    this.buckets.set(key, { tokens: tokens - 1, updatedAt: now });
    return { allowed: true, remaining: Math.floor(tokens - 1), retryAfter: 0 };
  }

  // Drop buckets that have refilled completely; they hold no information.
  sweep(now = Date.now()): number {
    const { capacity, refillPerSecond } = this.options;
    const fullAfterMs = (capacity / refillPerSecond) * 1000;
    let removed = 0;
    for (const [key, state] of this.buckets) {
      if (now - state.updatedAt >= fullAfterMs) {
        this.buckets.delete(key);
        removed++;
      }
    }
    return removed;
  }

  get size(): number {
    return this.buckets.size;
  }
}
