export interface ShortLink {
  slug: string;
  shortUrl: string;
}

export class RateLimitedError extends Error {
  constructor(public readonly retryAfter: number) {
    super(`You're creating links too fast. Try again in ${retryAfter}s.`);
  }
}

export async function shorten(url: string): Promise<ShortLink> {
  const res = await fetch("/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (res.status === 429) {
    throw new RateLimitedError(Number(res.headers.get("Retry-After") ?? 30));
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Something went wrong. Try again.");
  }
  return res.json();
}
