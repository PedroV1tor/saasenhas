import { randomUUID } from 'node:crypto';
import { newSalt, deriveKeys, verifyMasterPassword, encrypt, decrypt } from '../crypto/vault-crypto.js';
import { AppError } from '../errors.js';

const MIN_MASTER_PASSWORD = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    throw new AppError(400, 'Informe um e-mail válido.');
  }
  return email.trim().toLowerCase();
}

function requireText(value, field, max = 200) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new AppError(400, `O campo "${field}" é obrigatório.`);
  }
  if (value.length > max) {
    throw new AppError(400, `O campo "${field}" aceita no máximo ${max} caracteres.`);
  }
  return value.trim();
}

const publicEntry = ({ id, site, username, createdAt, updatedAt }) => ({ id, site, username, createdAt, updatedAt });

export function createVaultService(store) {
  function findUser(data, email) {
    const user = data.users[email];
    if (!user) throw new AppError(401, 'Sessão inválida.');
    return user;
  }

  function findEntry(user, id) {
    const entry = user.entries.find((e) => e.id === id);
    if (!entry) throw new AppError(404, 'Entrada não encontrada.');
    return entry;
  }

  return {
    async register(email, masterPassword) {
      const normalized = normalizeEmail(email);
      if (typeof masterPassword !== 'string' || masterPassword.length < MIN_MASTER_PASSWORD) {
        throw new AppError(400, `A senha mestra precisa ter pelo menos ${MIN_MASTER_PASSWORD} caracteres.`);
      }
      const data = await store.load();
      if (data.users[normalized]) throw new AppError(409, 'Já existe uma conta com esse e-mail.');

      const salt = newSalt();
      const { verifier } = deriveKeys(masterPassword, salt);
      data.users[normalized] = { salt, verifier, entries: [] };
      await store.save(data);
      return { email: normalized };
    },

    // Mesma mensagem para e-mail inexistente e senha errada, para não revelar quem tem conta.
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

    async listEntries(email) {
      const data = await store.load();
      return findUser(data, email).entries.map(publicEntry);
    },

    async getEntry(email, key, id) {
      const data = await store.load();
      const entry = findEntry(findUser(data, email), id);
      return { ...publicEntry(entry), password: decrypt(entry.secret, key) };
    },

    async addEntry(email, key, { site, username, password }) {
      const data = await store.load();
      const user = findUser(data, email);
      const now = new Date().toISOString();
      const entry = {
        id: randomUUID(),
        site: requireText(site, 'site'),
        username: requireText(username, 'usuario'),
        secret: encrypt(requireText(password, 'senha', 512), key),
        createdAt: now,
        updatedAt: now,
      };
      user.entries.push(entry);
      await store.save(data);
      return publicEntry(entry);
    },

    async updateEntry(email, key, id, changes) {
      const data = await store.load();
      const entry = findEntry(findUser(data, email), id);
      if (changes.site !== undefined) entry.site = requireText(changes.site, 'site');
      if (changes.username !== undefined) entry.username = requireText(changes.username, 'usuario');
      if (changes.password !== undefined) entry.secret = encrypt(requireText(changes.password, 'senha', 512), key);
      entry.updatedAt = new Date().toISOString();
      await store.save(data);
      return publicEntry(entry);
    },

    async removeEntry(email, id) {
      const data = await store.load();
      const user = findUser(data, email);
      findEntry(user, id);
      user.entries = user.entries.filter((e) => e.id !== id);
      await store.save(data);
    },

    // Agrupa entradas que usam a mesma senha. A senha em si nunca sai na resposta.
    async findReused(email, key) {
      const data = await store.load();
      const groups = new Map();
      for (const entry of findUser(data, email).entries) {
        const password = decrypt(entry.secret, key);
        if (!groups.has(password)) groups.set(password, []);
        groups.get(password).push(publicEntry(entry));
      }
      return [...groups.values()]
        .filter((entries) => entries.length > 1)
        .map((entries) => ({ count: entries.length, entries }));
    },
  };
}
