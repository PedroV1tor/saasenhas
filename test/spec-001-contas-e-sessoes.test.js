// Testes de aceite da spec docs/specs/001-contas-e-sessoes.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';

const MINUTE = 60 * 1000;
const NOT_LOGGED = 'Faça login para acessar o cofre.';
const BAD_LOGIN = 'E-mail ou senha mestra inválidos.';

let clock = 0;
let server;
let baseUrl;

before(async () => {
  const app = createApp({
    vaultService: createVaultService(createMemoryStore()),
    sessions: createSessionManager({ ttlMinutes: 15, now: () => clock }),
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
    headers: { 'content-type': 'application/json', ...(token && { authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
}

const register = (email, senhaMestra) => api('POST', '/api/contas', { body: { email, senhaMestra } });
const login = (email, senhaMestra) => api('POST', '/api/sessoes', { body: { email, senhaMestra } });
const openVault = (token) => api('GET', '/api/entradas', { token });

test('CA-01 cadastro com dados válidos devolve só o e-mail normalizado', async () => {
  const res = await register('  Ana@Exemplo.COM ', '0123456789');
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { email: 'ana@exemplo.com' });
});

test('CA-02 e-mail já cadastrado, em qualquer caixa, é recusado', async () => {
  await register('bruno@exemplo.com', 'senha-mestra-bruno');
  const res = await register('BRUNO@exemplo.com', 'outra-senha-mestra');
  assert.equal(res.status, 409);
  assert.equal(res.body.erro, 'Já existe uma conta com esse e-mail.');
});

test('CA-03 senha mestra com 9 caracteres é recusada; com 10 é aceita', async () => {
  const short = await register('carla@exemplo.com', '123456789');
  assert.equal(short.status, 400);
  assert.equal(short.body.erro, 'A senha mestra precisa ter pelo menos 10 caracteres.');
  assert.equal((await register('carla@exemplo.com', '1234567890')).status, 201);
});

test('CA-04 e-mail fora do formato é recusado no cadastro e no login', async () => {
  for (const email of ['ana', 'ana@exemplo', 'ana @exemplo.com', '', 42]) {
    const reg = await register(email, 'senha-mestra-valida');
    const log = await login(email, 'senha-mestra-valida');
    assert.equal(reg.status, 400, `cadastro com ${JSON.stringify(email)}`);
    assert.equal(log.status, 400, `login com ${JSON.stringify(email)}`);
    assert.equal(reg.body.erro, 'Informe um e-mail válido.');
  }
});

test('CA-05 login correto abre o cofre, mesmo com o e-mail em outra caixa', async () => {
  await register('davi@exemplo.com', 'senha-mestra-davi');
  const res = await login(' DAVI@exemplo.com', 'senha-mestra-davi');
  assert.equal(res.status, 201);
  assert.equal(typeof res.body.token, 'string');
  assert.equal((await openVault(res.body.token)).status, 200);
});

test('CA-06 senha errada, conta inexistente e senha ausente dão a mesma resposta', async () => {
  await register('elisa@exemplo.com', 'senha-mestra-elisa');
  const answers = [
    await login('elisa@exemplo.com', 'senha-mestra-errada'),
    await login('ninguem@exemplo.com', 'senha-mestra-elisa'),
    await login('elisa@exemplo.com', undefined),
  ];
  for (const res of answers) assert.deepEqual(res, { status: 401, body: { erro: BAD_LOGIN } });
});

test('CA-07 a sessão vale 15 minutos a partir do login e não é renovada pelo uso', async () => {
  await register('fabio@exemplo.com', 'senha-mestra-fabio');
  clock = 0;
  const { token } = (await login('fabio@exemplo.com', 'senha-mestra-fabio')).body;

  clock = 10 * MINUTE;
  assert.equal((await openVault(token)).status, 200);
  clock = 15 * MINUTE - 1;
  assert.equal((await openVault(token)).status, 200);
  clock = 15 * MINUTE;
  assert.deepEqual(await openVault(token), { status: 401, body: { erro: NOT_LOGGED } });
  clock = 0;
});

test('CA-08 logout encerra a sessão na hora', async () => {
  await register('gabi@exemplo.com', 'senha-mestra-gabi');
  const { token } = (await login('gabi@exemplo.com', 'senha-mestra-gabi')).body;
  assert.equal((await api('DELETE', '/api/sessoes', { token })).status, 204);
  assert.equal((await openVault(token)).status, 401);
  assert.equal((await api('DELETE', '/api/sessoes', { token })).status, 401);
});

test('CA-09 duas sessões da mesma conta são independentes', async () => {
  await register('hugo@exemplo.com', 'senha-mestra-hugo');
  const phone = (await login('hugo@exemplo.com', 'senha-mestra-hugo')).body.token;
  const laptop = (await login('hugo@exemplo.com', 'senha-mestra-hugo')).body.token;
  assert.notEqual(phone, laptop);
  await api('DELETE', '/api/sessoes', { token: phone });
  assert.equal((await openVault(phone)).status, 401);
  assert.equal((await openVault(laptop)).status, 200);
});

test('CA-10 o cofre recusa pedido sem credencial ou com credencial inventada', async () => {
  assert.deepEqual(await openVault(undefined), { status: 401, body: { erro: NOT_LOGGED } });
  assert.deepEqual(await openVault('credencial-inventada'), { status: 401, body: { erro: NOT_LOGGED } });
});

test('CA-11 espaços nas pontas da senha mestra fazem parte dela', async () => {
  await register('iris@exemplo.com', '  senha mestra  ');
  assert.equal((await login('iris@exemplo.com', 'senha mestra')).status, 401);
  assert.equal((await login('iris@exemplo.com', '  senha mestra  ')).status, 201);
});

test('CA-12 a mesma senha digitada com acento composto ou decomposto abre o cofre', async () => {
  await register('joana@exemplo.com', 'café-com-leite');
  assert.equal((await login('joana@exemplo.com', 'café-com-leite')).status, 201);
});
