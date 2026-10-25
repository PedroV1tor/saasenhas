import { randomUUID } from 'node:crypto';
import { newSalt, deriveKeys, verifyMasterPassword, encrypt, decrypt } from '../crypto/vault-crypto.js';
import { AppError } from '../errors.js';

const MIN_MASTER_PASSWORD = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Conta falsa usada quando o e-mail não existe: a derivação roda igual e o tempo não revela quem tem conta (RN-07).
const NO_ACCOUNT = { salt: newSalt(), verifier: '' };

// RN-01: apara e passa para minúsculas antes de validar e de usar.
function normalizeEmail(email) {
  const normalized = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(normalized)) throw new AppError(400, 'Informe um e-mail válido.');
  return normalized;
}

// Spec 002, RN-02: site e usuário obrigatórios, aparados, até 200 caracteres.
function requireText(value, field, max = 200) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(400, `O campo "${field}" é obrigatório.`);
  }
  if (value.trim().length > max) {
    throw new AppError(400, `O campo "${field}" aceita no máximo ${max} caracteres.`);
  }
  return value.trim();
}

// Spec 002, RN-03: a senha é guardada exatamente como digitada; aparar mudaria a credencial do usuário.
function requirePassword(value) {
  if (typeof value !== 'string' || value === '') {
    throw new AppError(400, 'O campo "senha" é obrigatório.');
  }
  if (value.length > 512) {
    throw new AppError(400, 'O campo "senha" aceita no máximo 512 caracteres.');
  }
  return value;
}

// O que sai do serviço para as páginas: nunca o segredo cifrado (spec 002, RN-05).
const publicEntry = ({ id, site, username, createdAt, updatedAt }) => ({ id, site, username, createdAt, updatedAt });

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
      const user = data.users[normalized] ?? NO_ACCOUNT;
      const key = typeof masterPassword === 'string'
        ? verifyMasterPassword(masterPassword, user.salt, user.verifier)
        : null;
      if (!key) throw new AppError(401, 'E-mail ou senha mestra inválidos.');
      return { email: normalized, key };
    },

    async listEntries(email) {
      const data = await store.load();
      return (data.users[email].entries ?? []).map(publicEntry);
    },

    async getEntry(email, key, id) {
      const data = await store.load();
      const entry = data.users[email].entries.find((e) => e.id === id);
      return { ...publicEntry(entry), password: decrypt(entry.secret, key) };
    },

    async addEntry(email, key, { site, username, password }) {
      const data = await store.load();
      const user = data.users[email];
      user.entries ??= [];
      const now = new Date().toISOString();
      user.entries.push({
        id: randomUUID(),
        site: requireText(site, 'site'),
        username: requireText(username, 'usuario'),
        secret: encrypt(requirePassword(password), key),
        createdAt: now,
        updatedAt: now,
      });
      await store.save(data);
    },

    // Spec 002, RN-04: senha vazia ou ausente na edição mantém a atual.
    async updateEntry(email, key, id, { site, username, password }) {
      const data = await store.load();
      const entry = data.users[email].entries.find((e) => e.id === id);
      entry.site = requireText(site, 'site');
      entry.username = requireText(username, 'usuario');
      if (password) entry.secret = encrypt(requirePassword(password), key);
      entry.updatedAt = new Date().toISOString();
      await store.save(data);
    },
  };
}
