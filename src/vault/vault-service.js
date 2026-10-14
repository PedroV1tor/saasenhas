import { newSalt, deriveKeys, verifyMasterPassword } from '../crypto/vault-crypto.js';
import { AppError } from '../errors.js';

const MIN_MASTER_PASSWORD = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RN-01: apara e passa para minúsculas antes de validar e de usar.
function normalizeEmail(email) {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(normalized)) throw new AppError(400, 'Informe um e-mail válido.');
  return normalized;
}

export function createVaultService(store) {
  return {
    async register(email, masterPassword) {
      const normalized = normalizeEmail(email);
      // RN-03: conta como o JavaScript conta (length), antes de qualquer normalização.
      if (typeof masterPassword !== 'string' || masterPassword.length < MIN_MASTER_PASSWORD) {
        throw new AppError(400, `A senha mestra precisa ter pelo menos ${MIN_MASTER_PASSWORD} caracteres.`);
      }
      const data = await store.load();
      if (data.users[normalized]) throw new AppError(409, 'Já existe uma conta com esse e-mail.');

      const salt = newSalt();
      const { verifier } = deriveKeys(masterPassword, salt);
      data.users[normalized] = { salt, verifier };
      await store.save(data);
      return { email: normalized };
    },

    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta (RN-07).
    async unlock(email, masterPassword) {
      const normalized = normalizeEmail(email);
      const data = await store.load();
      const user = data.users[normalized];
      const key = user && typeof masterPassword === 'string'
        ? verifyMasterPassword(masterPassword, user.salt, user.verifier)
        : null;
      if (!key) throw new AppError(401, 'E-mail ou senha mestra inválidos.');
      return { email: normalized, key };
    },
  };
}
