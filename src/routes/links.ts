import { Router } from "express";
import { nanoid } from "nanoid";
import type { Config } from "../config.js";
import { rateLimit } from "../middleware/rateLimit.js";

const links = new Map<string, string>();

export function linksRouter(config: Config): Router {
  const router = Router();

  router.post("/links", rateLimit(config.limits.create), (req, res) => {
    const url = String(req.body?.url ?? "");
    if (!/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "Enter a full URL starting with http:// or https://" });
    }
    const slug = nanoid(7);
    links.set(slug, url);
    res.status(201).json({ slug, shortUrl: `${config.baseUrl}/${slug}` });
  });

  router.get("/:slug", rateLimit(config.limits.redirect), (req, res) => {
    const url = links.get(req.params.slug);
    if (!url) return res.status(404).send("Link not found");
    res.redirect(302, url);
  });

  return router;
}
