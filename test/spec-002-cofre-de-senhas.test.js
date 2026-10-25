// Testes de aceite da spec docs/specs/002-cofre-de-senhas.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createFileStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

let http;
let dir;
let dataFile;

// Arquivo de verdade (em pasta temporária) para o CA-06 poder ler o que foi gravado.
before(async () => {
  dir = await mkdtemp(join(tmpdir(), 'saasenhas-'));
  dataFile = join(dir, 'vault.json');
  http = await startServer(createApp({
    vaultService: createVaultService(createFileStore(dataFile)),
    sessions: createSessionManager({ ttlMinutes: 15 }),
  }));
});

after(async () => {
  http.close();
  await rm(dir, { recursive: true, force: true });
});

const aviso = (html) => html.match(/class="aviso[^"]*"[^>]*>([^<]*)</)?.[1];
const create = (cookie, entry) => http.post('/cofre/entradas', entry, { cookie });

test('CA-01 entrada nova aparece na lista, sem a senha', async () => {
  const cookie = await http.signUpAndLogin('ana@exemplo.com');
  const res = await create(cookie, { site: 'github.com', usuario: 'ana', senha: 's3nh@-forte' });
  assert.equal(res.status, 303);
  assert.equal(res.location, '/cofre?aviso=criada');
  const list = await http.get(res.location, { cookie });
  assert.equal(aviso(list.html), 'Entrada salva.');
  // "A lista" é a tabela de entradas (D-05): o título "Cofre de ana@exemplo.com" já contém "ana".
  const rows = list.html.match(/<tbody>([\s\S]*)<\/tbody>/)?.[1] ?? '';
  assert.ok(rows.includes('github.com'));
  assert.ok(rows.includes('ana'));
  assert.ok(!list.html.includes('s3nh@-forte'));
});

test('CA-06 o arquivo do cofre não contém a senha em texto puro', async () => {
  const cookie = await http.signUpAndLogin('fe@exemplo.com');
  await create(cookie, { site: 'w.com', usuario: 'fe', senha: 'senha-que-nao-pode-vazar' });
  const file = await readFile(dataFile, 'utf8');
  assert.ok(file.includes('w.com'));
  assert.ok(!file.includes('senha-que-nao-pode-vazar'));
});

test('CA-09 páginas do cofre exigem sessão', async () => {
  for (const res of [await http.get('/cofre/nova'), await http.post('/cofre/entradas', { site: 'a', usuario: 'b', senha: 'c' })]) {
    assert.equal(res.status, 303);
    assert.equal(res.location, '/entrar?motivo=login');
  }
});
