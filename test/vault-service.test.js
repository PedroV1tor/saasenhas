import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createVaultService } from '../src/vault/vault-service.js';
import { createFileStore, createMemoryStore } from '../src/vault/store.js';

const MASTER = 'senha-mestra-forte';

async function unlockedVault(store = createMemoryStore()) {
  const vault = createVaultService(store);
  await vault.register('Ana@Exemplo.com', MASTER);
  const { email, key } = await vault.unlock('ana@exemplo.com', MASTER);
  return { vault, email, key };
}

test('cadastro normaliza o e-mail e recusa duplicado', async () => {
  const vault = createVaultService(createMemoryStore());
  assert.deepEqual(await vault.register(' Ana@Exemplo.com ', MASTER), { email: 'ana@exemplo.com' });
  await assert.rejects(vault.register('ana@exemplo.com', MASTER), { status: 409 });
});

test('cadastro exige senha mestra com 10+ caracteres', async () => {
  const vault = createVaultService(createMemoryStore());
  await assert.rejects(vault.register('ana@exemplo.com', 'curta'), { status: 400 });
});

test('desbloqueio falha com a mesma mensagem para senha errada e conta inexistente', async () => {
  const { vault } = await unlockedVault();
  const wrong = await vault.unlock('ana@exemplo.com', 'senha-errada!!').catch((e) => e);
  const missing = await vault.unlock('ninguem@exemplo.com', MASTER).catch((e) => e);
  assert.equal(wrong.status, 401);
  assert.equal(wrong.message, missing.message);
});

test('adiciona, lista sem senha, lê com senha, atualiza e remove', async () => {
  const { vault, email, key } = await unlockedVault();
  const created = await vault.addEntry(email, key, { site: 'github.com', username: 'ana', password: 'gh-123!' });

  const [listed] = await vault.listEntries(email);
  assert.equal(listed.site, 'github.com');
  assert.equal('password' in listed, false);
  assert.equal('secret' in listed, false);

  assert.equal((await vault.getEntry(email, key, created.id)).password, 'gh-123!');

  await vault.updateEntry(email, key, created.id, { password: 'nova-senha' });
  assert.equal((await vault.getEntry(email, key, created.id)).password, 'nova-senha');

  await vault.removeEntry(email, created.id);
  assert.deepEqual(await vault.listEntries(email), []);
  await assert.rejects(vault.getEntry(email, key, created.id), { status: 404 });
});

test('valida campos obrigatórios da entrada', async () => {
  const { vault, email, key } = await unlockedVault();
  await assert.rejects(vault.addEntry(email, key, { site: '', username: 'ana', password: 'x' }), /site/);
  await assert.rejects(vault.addEntry(email, key, { site: 'a.com', username: 'ana' }), /senha/);
});

test('encontra senhas reutilizadas sem expor a senha', async () => {
  const { vault, email, key } = await unlockedVault();
  await vault.addEntry(email, key, { site: 'a.com', username: 'ana', password: 'repetida' });
  await vault.addEntry(email, key, { site: 'b.com', username: 'ana', password: 'repetida' });
  await vault.addEntry(email, key, { site: 'c.com', username: 'ana', password: 'unica' });

  const groups = await vault.findReused(email, key);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].count, 2);
  assert.deepEqual(groups[0].entries.map((e) => e.site).sort(), ['a.com', 'b.com']);
  assert.doesNotMatch(JSON.stringify(groups), /repetida/);
});

test('o arquivo do cofre não guarda a senha em texto puro', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'saasenhas-'));
  try {
    const file = join(dir, 'vault.json');
    const { vault, email, key } = await unlockedVault(createFileStore(file));
    await vault.addEntry(email, key, { site: 'banco.com', username: 'ana', password: 'senha-do-banco' });
    const raw = await readFile(file, 'utf8');
    assert.doesNotMatch(raw, /senha-do-banco/);
    assert.doesNotMatch(raw, new RegExp(MASTER));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
