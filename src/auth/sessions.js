import { randomBytes } from 'node:crypto';

// Sessões ficam só em memória: a chave do cofre nunca é gravada em disco.
export function createSessionManager({ ttlMinutes, now = () => Date.now() }) {
  const sessions = new Map();
  const ttlMs = ttlMinutes * 60 * 1000;

  return {
    create(email, key) {
      const token = randomBytes(32).toString('base64url');
      sessions.set(token, { email, key, expiresAt: now() + ttlMs });
      return token;
    },
    get(token) {
      const session = sessions.get(token);
      if (!session) return null;
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
