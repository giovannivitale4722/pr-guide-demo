export interface Config {
  port: number;
  baseUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 8080),
    baseUrl: env.BASE_URL ?? "http://localhost:8080",
  };
}
