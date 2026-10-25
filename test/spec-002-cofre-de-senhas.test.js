// Testes de aceite da spec docs/specs/002-cofre-de-senhas.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
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

test('CA-09 páginas do cofre exigem sessão', async () => {
  for (const res of [await http.get('/cofre/nova'), await http.post('/cofre/entradas', { site: 'a', usuario: 'b', senha: 'c' })]) {
    assert.equal(res.status, 303);
    assert.equal(res.location, '/entrar?motivo=login');
  }
});
