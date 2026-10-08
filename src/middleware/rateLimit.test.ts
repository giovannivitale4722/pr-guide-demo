import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { rateLimit } from "./rateLimit.js";

function app() {
  const server = express();
  server.get("/ping", rateLimit({ capacity: 2, refillPerSecond: 0.1 }), (_req, res) => res.send("pong"));
  return server;
}

describe("rateLimit", () => {
  it("returns 429 with Retry-After once the bucket is empty", async () => {
    const server = app();
    await request(server).get("/ping").expect(200);
    await request(server).get("/ping").expect(200).expect("RateLimit-Remaining", "0");
    const limited = await request(server).get("/ping").expect(429);
    expect(limited.headers["retry-after"]).toBe("10");
    expect(limited.body).toEqual({ error: "Too many requests", retryAfter: 10 });
  });

  it("gives each API key its own bucket", async () => {
    const server = app();
    await request(server).get("/ping").set("x-api-key", "a").expect(200);
    await request(server).get("/ping").set("x-api-key", "a").expect(200);
    await request(server).get("/ping").set("x-api-key", "b").expect(200);
  });
});
