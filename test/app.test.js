import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

let http;

before(async () => {
  http = await startServer(createApp({ vaultService: createVaultService(createMemoryStore()) }));
});

after(() => http.close());

test('GET /health responde ok', async () => {
  const res = await http.get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(JSON.parse(res.html), { status: 'ok' });
});

test('página inexistente mostra 404 em HTML', async () => {
  const res = await http.get('/nao-existe');
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.ok(res.html.includes('Página não encontrada.'));
});

test('páginas saem com os cabeçalhos de segurança da spec 001', async () => {
  const res = await http.get('/nao-existe');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('o CSS é servido', async () => {
  const res = await http.get('/css/estilo.css');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/css/);
});
