# Shortlinks API

## POST /links

Create a short link.

```json
{ "url": "https://example.com/a/very/long/path" }
```

Returns `201` with `{ "slug": "x7Kp2Qa", "shortUrl": "http://localhost:8080/x7Kp2Qa" }`.

## GET /:slug

Redirects (`302`) to the original URL, or returns `404`.

## Rate limits

Each caller gets a bucket of requests that refills steadily. Requests with an
`x-api-key` header are counted per key; anonymous requests are counted per IP.

| Route | Burst | Steady rate |
| --- | --- | --- |
| `POST /links` | 20 | 10 per minute |
| `GET /:slug` | 120 | 600 per minute |

Every response carries `RateLimit-Limit` and `RateLimit-Remaining`. Over the
limit, the API returns `429` with a `Retry-After` header (seconds) and
`{ "error": "Too many requests", "retryAfter": 12 }`.
