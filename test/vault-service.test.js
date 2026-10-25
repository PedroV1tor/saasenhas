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
  assert.deepEqual(Object.keys(entry).sort(), ['createdAt', 'id', 'site', 'updatedAt', 'username']);
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
