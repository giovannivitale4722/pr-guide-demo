import { useEffect, useState } from "react";
import { RateLimitedError, shorten, type ShortLink } from "../api";

export function ShortenForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShortLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);

  // Count down after a 429 so the button re-enables on its own.
  useEffect(() => {
    if (waitSeconds <= 0) return;
    const timer = setTimeout(() => setWaitSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [waitSeconds]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await shorten(url));
    } catch (err) {
      if (err instanceof RateLimitedError) setWaitSeconds(err.retryAfter);
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const waiting = waitSeconds > 0;

  return (
    <form onSubmit={onSubmit} className="shorten">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a long link" />
      <button type="submit" disabled={busy || waiting}>
        {busy ? "Shortening…" : waiting ? `Wait ${waitSeconds}s` : "Shorten"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && <a href={result.shortUrl}>{result.shortUrl}</a>}
    </form>
  );
}
