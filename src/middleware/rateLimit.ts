import type { Request, RequestHandler } from "express";
import { TokenBucket, type BucketOptions } from "../ratelimit/tokenBucket.js";

const SWEEP_EVERY_MS = 60_000;

// API keys get their own bucket; anonymous callers share one per IP.
export function clientKey(req: Request): string {
  const apiKey = req.get("x-api-key");
  return apiKey ? `key:${apiKey}` : `ip:${req.ip}`;
}

export function rateLimit(options: BucketOptions): RequestHandler {
  const bucket = new TokenBucket(options);
  setInterval(() => bucket.sweep(), SWEEP_EVERY_MS).unref();

  return (req, res, next) => {
    const result = bucket.take(clientKey(req));
    res.set("RateLimit-Limit", String(options.capacity));
    res.set("RateLimit-Remaining", String(result.remaining));

    if (!result.allowed) {
      res.set("Retry-After", String(result.retryAfter));
      return res.status(429).json({
        error: "Too many requests",
        retryAfter: result.retryAfter,
      });
    }
    next();
  };
}
