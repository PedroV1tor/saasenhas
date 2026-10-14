import { randomBytes } from 'node:crypto';

// Sessões ficam só em memória: a chave do cofre nunca é gravada em disco.
// `now` é injetável para os testes controlarem o relógio (CA-07).
export function createSessionManager({ ttlMinutes, now = () => Date.now() }) {
  const sessions = new Map();
  const ttlMs = ttlMinutes * 60 * 1000;

  return {
    ttlMinutes,
    create(email, key) {
      const token = randomBytes(32).toString('base64url');
      sessions.set(token, { email, key, expiresAt: now() + ttlMs });
      return token;
    },
    get(token) {
      const session = sessions.get(token);
      if (!session) return null;
      // RN-08: no instante exato do fim do prazo a sessão já está expirada.
      if (now() >= session.expiresAt) {
        sessions.delete(token);
        return null;
      }
      return session;
    },
    destroy(token) {
      sessions.delete(token);
    },
  };
}
