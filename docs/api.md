# Shortlinks API

## POST /links

Create a short link.

```json
{ "url": "https://example.com/a/very/long/path" }
```

Returns `201` with `{ "slug": "x7Kp2Qa", "shortUrl": "http://localhost:8080/x7Kp2Qa" }`.

## GET /:slug

Redirects (`302`) to the original URL, or returns `404`.
