import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';

async function openVault() {
  const vault = createVaultService(createMemoryStore());
  await vault.register('ana@exemplo.com', 'senha-mestra-da-ana');
  const { email, key } = await vault.unlock('ana@exemplo.com', 'senha-mestra-da-ana');
  return { vault, email, key };
}

test('a lista nunca traz a senha nem o segredo cifrado', async () => {
  const { vault, email, key } = await openVault();
  await vault.addEntry(email, key, { site: 'a.com', username: 'ana', password: 'p' });
  const [entry] = await vault.listEntries(email);
  // `favorite` entrou com a spec 004; senha e segredo continuam fora.
  assert.deepEqual(Object.keys(entry).sort(), ['createdAt', 'favorite', 'id', 'site', 'updatedAt', 'username']);
});

test('site e usuário são aparados; a senha não', async () => {
  const { vault, email, key } = await openVault();
  await vault.addEntry(email, key, { site: '  a.com ', username: ' ana ', password: ' p ' });
  const [{ id }] = await vault.listEntries(email);
  const entry = await vault.getEntry(email, key, id);
  assert.equal(entry.site, 'a.com');
  assert.equal(entry.username, 'ana');
  assert.equal(entry.password, ' p ');
});

test('senha com mais de 512 caracteres é recusada', async () => {
  const { vault, email, key } = await openVault();
  await assert.rejects(
    vault.addEntry(email, key, { site: 'a.com', username: 'ana', password: 'x'.repeat(513) }),
    { status: 400, message: 'O campo "senha" aceita no máximo 512 caracteres.' },
  );
});

test('a mesma senha cifrada duas vezes gera segredos diferentes (IV aleatório)', async () => {
  const store = createMemoryStore();
  const vault = createVaultService(store);
  await vault.register('ana@exemplo.com', 'senha-mestra-da-ana');
  const { email, key } = await vault.unlock('ana@exemplo.com', 'senha-mestra-da-ana');
  await vault.addEntry(email, key, { site: 'a.com', username: 'ana', password: 'igual' });
  await vault.addEntry(email, key, { site: 'b.com', username: 'ana', password: 'igual' });
  const [first, second] = (await store.load()).users[email].entries;
  assert.notEqual(first.secret, second.secret);
});

test('reutilizadas ignora senhas usadas uma vez só', async () => {
  const { vault, email, key } = await openVault();
  await vault.addEntry(email, key, { site: 'a.com', username: 'ana', password: 'unica' });
  assert.deepEqual(await vault.findReused(email, key), []);
});
