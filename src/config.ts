export interface Config {
  port: number;
  baseUrl: string;
  // Express "trust proxy" setting; needed so req.ip is the client, not the load balancer.
  trustProxy: boolean | number;
  limits: {
    create: { capacity: number; refillPerSecond: number };
    redirect: { capacity: number; refillPerSecond: number };
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 8080),
    baseUrl: env.BASE_URL ?? "http://localhost:8080",
    trustProxy: env.TRUST_PROXY === undefined ? false : Number(env.TRUST_PROXY),
    limits: {
      create: {
        capacity: Number(env.RATE_LIMIT_CREATE_BURST ?? 20),
        refillPerSecond: Number(env.RATE_LIMIT_CREATE_PER_MIN ?? 10) / 60,
      },
      redirect: {
        capacity: Number(env.RATE_LIMIT_REDIRECT_BURST ?? 120),
        refillPerSecond: Number(env.RATE_LIMIT_REDIRECT_PER_MIN ?? 600) / 60,
      },
    },
  };
}
