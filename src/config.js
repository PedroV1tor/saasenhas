// Variáveis de ambiente (lista completa e valores de exemplo em .env.example).
export const config = {
  // Porta HTTP do servidor.
  port: Number(process.env.PORT ?? 3000),
  // Arquivo JSON do cofre; nunca commitado (.gitignore) nem lido pelo agente (deny em .claude/settings.json).
  dataFile: process.env.DATA_FILE ?? 'data/vault.json',
  // Validade da sessão em minutos, contada da entrada e sem renovação (spec 001, RN-08).
  sessionTtlMinutes: Number(process.env.SESSION_TTL_MINUTES ?? 15),
};
