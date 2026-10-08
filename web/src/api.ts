export interface ShortLink {
  slug: string;
  shortUrl: string;
}

export async function shorten(url: string): Promise<ShortLink> {
  const res = await fetch("/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Something went wrong. Try again.");
  }
  return res.json();
}
