import { useState } from "react";
import { shorten, type ShortLink } from "../api";

export function ShortenForm() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ShortLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setResult(await shorten(url));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="shorten">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste a long link" />
      <button type="submit" disabled={busy}>
        {busy ? "Shortening…" : "Shorten"}
      </button>
      {error && <p className="error">{error}</p>}
      {result && <a href={result.shortUrl}>{result.shortUrl}</a>}
    </form>
  );
}
