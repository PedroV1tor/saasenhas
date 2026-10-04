import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';

let server;
let baseUrl;

before(async () => {
  const app = createApp({
    vaultService: createVaultService(createMemoryStore()),
    sessions: createSessionManager({ ttlMinutes: 15 }),
  });
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

async function api(method, path, { body, token } = {}) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token && { authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

async function login(email = 'bia@exemplo.com') {
  await api('POST', '/api/contas', { body: { email, senhaMestra: 'senha-mestra-da-bia' } });
  const res = await api('POST', '/api/sessoes', { body: { email, senhaMestra: 'senha-mestra-da-bia' } });
  return res.body.token;
}

test('GET /health', async () => {
  assert.deepEqual(await api('GET', '/health'), { status: 200, body: { status: 'ok' } });
});

test('cofre exige login', async () => {
  const res = await api('GET', '/api/entradas');
  assert.equal(res.status, 401);
  assert.equal((await api('GET', '/api/entradas', { token: 'inventado' })).status, 401);
});

test('login com senha errada é recusado', async () => {
  await login('caio@exemplo.com');
  const res = await api('POST', '/api/sessoes', { body: { email: 'caio@exemplo.com', senhaMestra: 'errada-errada' } });
  assert.equal(res.status, 401);
  assert.equal(res.body.erro, 'E-mail ou senha mestra inválidos.');
});

test('fluxo completo do cofre pela API', async () => {
  const token = await login();

  const created = await api('POST', '/api/entradas', {
    token,
    body: { site: 'instagram.com', usuario: 'bia', senha: 'mesma-senha' },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.usuario, 'bia');
  assert.equal(created.body.senha, undefined);

  await api('POST', '/api/entradas', { token, body: { site: 'tiktok.com', usuario: 'bia', senha: 'mesma-senha' } });

  const list = await api('GET', '/api/entradas', { token });
  assert.equal(list.body.length, 2);
  assert.ok(list.body.every((e) => e.senha === undefined));

  const detail = await api('GET', `/api/entradas/${created.body.id}`, { token });
  assert.equal(detail.body.senha, 'mesma-senha');

  const reused = await api('GET', '/api/entradas/reutilizadas', { token });
  assert.equal(reused.body[0].quantidade, 2);

  const updated = await api('PUT', `/api/entradas/${created.body.id}`, { token, body: { senha: 'outra-senha' } });
  assert.equal(updated.status, 200);
  assert.deepEqual((await api('GET', '/api/entradas/reutilizadas', { token })).body, []);

  assert.equal((await api('DELETE', `/api/entradas/${created.body.id}`, { token })).status, 204);
  assert.equal((await api('GET', `/api/entradas/${created.body.id}`, { token })).status, 404);

  assert.equal((await api('DELETE', '/api/sessoes', { token })).status, 204);
  assert.equal((await api('GET', '/api/entradas', { token })).status, 401);
});

test('POST /api/gerador devolve senha e força', async () => {
  const res = await api('POST', '/api/gerador', { body: { tamanho: 20 } });
  assert.equal(res.status, 200);
  assert.equal(res.body.senha.length, 20);
  assert.equal(res.body.forca.label, 'forte');
  assert.equal((await api('POST', '/api/gerador', { body: { tamanho: 3 } })).status, 400);
});

test('POST /api/forca avalia a senha', async () => {
  const res = await api('POST', '/api/forca', { body: { senha: '123456' } });
  assert.equal(res.body.label, 'fraca');
});

test('JSON inválido devolve 400', async () => {
  const res = await fetch(`${baseUrl}/api/forca`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{ruim',
  });
  assert.equal(res.status, 400);
});
