export const config = {
  port: Number(process.env.PORT ?? 3000),
  dataFile: process.env.DATA_FILE ?? 'data/vault.json',
  sessionTtlMinutes: Number(process.env.SESSION_TTL_MINUTES ?? 15),
};
