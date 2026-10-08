import { describe, expect, it } from "vitest";
import { TokenBucket } from "./tokenBucket.js";

describe("TokenBucket", () => {
  it("allows a burst up to capacity, then limits", () => {
    const bucket = new TokenBucket({ capacity: 3, refillPerSecond: 1 });
    expect([1, 2, 3].map(() => bucket.take("a", 0).allowed)).toEqual([true, true, true]);
    expect(bucket.take("a", 0)).toEqual({ allowed: false, remaining: 0, retryAfter: 1 });
  });

  it("refills over time", () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSecond: 0.5 });
    bucket.take("a", 0);
    bucket.take("a", 0);
    expect(bucket.take("a", 1000).allowed).toBe(false);
    expect(bucket.take("a", 2000).allowed).toBe(true);
  });

  it("keeps keys independent", () => {
    const bucket = new TokenBucket({ capacity: 1, refillPerSecond: 1 });
    expect(bucket.take("a", 0).allowed).toBe(true);
    expect(bucket.take("b", 0).allowed).toBe(true);
  });

  it("sweeps buckets that have refilled", () => {
    const bucket = new TokenBucket({ capacity: 2, refillPerSecond: 1 });
    bucket.take("a", 0);
    expect(bucket.sweep(1000)).toBe(0);
    expect(bucket.sweep(2000)).toBe(1);
    expect(bucket.size).toBe(0);
  });
});
