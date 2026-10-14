// Testes de aceite da spec docs/specs/001-contas-e-sessoes.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

const MINUTE = 60 * 1000;
const NOT_LOGGED = 'Faça login para acessar o cofre.';
const BAD_LOGIN = 'E-mail ou senha mestra inválidos.';
const TO_LOGIN = '/entrar?motivo=login';

let clock = 0;
let http;

before(async () => {
  http = await startServer(createApp({
    vaultService: createVaultService(createMemoryStore()),
    sessions: createSessionManager({ ttlMinutes: 15, now: () => clock }),
  }));
});

after(() => http.close());

const register = (email, senhaMestra) => http.post('/cadastro', { email, senhaMestra });
const login = (email, senhaMestra) => http.post('/entrar', { email, senhaMestra });
const openVault = (cookie) => http.get('/cofre', { cookie });
// Valor do cookie `sessao` criado pela resposta, ou undefined.
const sessionOf = (res) => res.setCookie.find((c) => c.startsWith('sessao=') && !c.startsWith('sessao=;'))?.split(';')[0].slice(7);

// Texto do aviso (sucesso, informação ou erro) mostrado na página.
const aviso = (html) => html.match(/class="aviso[^"]*"[^>]*>([^<]*)</)?.[1];
// Valor do campo e-mail no formulário.
const emailField = (html) => html.match(/<input[^>]*name="email"[^>]*value="([^"]*)"/)?.[1];

test('CA-01 cadastro válido leva à entrada com aviso e e-mail normalizado preenchido', async () => {
  const res = await register('  Ana@Exemplo.COM ', '0123456789');
  assert.equal(res.status, 303);
  assert.equal(res.location, '/entrar?conta=criada&email=ana%40exemplo.com');
  const page = await http.get(res.location);
  assert.equal(page.status, 200);
  assert.equal(aviso(page.html), 'Conta criada. Entre com sua senha mestra.');
  assert.equal(emailField(page.html), 'ana@exemplo.com');
});

test('CA-02 e-mail já cadastrado, em qualquer caixa, é recusado', async () => {
  await register('bruno@exemplo.com', 'senha-mestra-bruno');
  const res = await register('BRUNO@exemplo.com', 'outra-senha-mestra');
  assert.equal(res.status, 409);
  assert.equal(aviso(res.html), 'Já existe uma conta com esse e-mail.');
});

test('CA-03 senha mestra com 9 caracteres é recusada; com 10 é aceita', async () => {
  const short = await register('carla@exemplo.com', '123456789');
  assert.equal(short.status, 400);
  assert.equal(aviso(short.html), 'A senha mestra precisa ter pelo menos 10 caracteres.');
  assert.equal((await register('carla@exemplo.com', '1234567890')).status, 303);
});

test('CA-04 e-mail fora do formato é recusado no cadastro e na entrada', async () => {
  for (const email of ['ana', 'ana@exemplo', 'ana @exemplo.com', '', undefined]) {
    const reg = await register(email, 'senha-mestra-valida');
    const log = await login(email, 'senha-mestra-valida');
    assert.equal(reg.status, 400, `cadastro com ${JSON.stringify(email)}`);
    assert.equal(log.status, 400, `entrada com ${JSON.stringify(email)}`);
    assert.equal(aviso(reg.html), 'Informe um e-mail válido.');
    assert.equal(aviso(log.html), 'Informe um e-mail válido.');
  }
});

test('CA-05 entrada correta abre o cofre, mesmo com o e-mail em outra caixa', async () => {
  await register('davi@exemplo.com', 'senha-mestra-davi');
  const res = await login(' DAVI@exemplo.com', 'senha-mestra-davi');
  assert.equal(res.status, 303);
  assert.equal(res.location, '/cofre');
  const cofre = await openVault(sessionOf(res));
  assert.equal(cofre.status, 200);
  assert.ok(cofre.html.includes('davi@exemplo.com'));
});

test('CA-06 senha errada, conta inexistente e senha ausente dão a mesma resposta', async () => {
  await register('elisa@exemplo.com', 'senha-mestra-elisa');
  const answers = [
    await login('elisa@exemplo.com', 'senha-mestra-errada'),
    await login('ninguem@exemplo.com', 'senha-mestra-elisa'),
    await login('elisa@exemplo.com', undefined),
  ];
  for (const res of answers) {
    assert.equal(res.status, 401);
    assert.equal(aviso(res.html), BAD_LOGIN);
    assert.equal(sessionOf(res), undefined);
  }
});

test('CA-07 a sessão vale 15 minutos a partir da entrada e não é renovada pelo uso', async () => {
  await register('fabio@exemplo.com', 'senha-mestra-fabio');
  clock = 0;
  const cookie = sessionOf(await login('fabio@exemplo.com', 'senha-mestra-fabio'));

  clock = 10 * MINUTE;
  assert.equal((await openVault(cookie)).status, 200);
  clock = 15 * MINUTE - 1;
  assert.equal((await openVault(cookie)).status, 200);
  clock = 15 * MINUTE;
  const expired = await openVault(cookie);
  assert.equal(expired.status, 303);
  assert.equal(expired.location, TO_LOGIN);
  clock = 0;
});

test('CA-10 o cofre recusa pedido sem cookie ou com credencial inventada', async () => {
  for (const cookie of [undefined, 'credencial-inventada']) {
    const res = await openVault(cookie);
    assert.equal(res.status, 303);
    assert.equal(res.location, TO_LOGIN);
  }
  assert.equal(aviso((await http.get(TO_LOGIN)).html), NOT_LOGGED);
});

test('CA-11 espaços nas pontas da senha mestra fazem parte dela', async () => {
  await register('iris@exemplo.com', '  senha mestra  ');
  assert.equal((await login('iris@exemplo.com', 'senha mestra')).status, 401);
  const ok = await login('iris@exemplo.com', '  senha mestra  ');
  assert.equal(ok.status, 303);
  assert.equal(ok.location, '/cofre');
});

test('CA-12 a mesma senha digitada com acento composto ou decomposto abre o cofre', async () => {
  // \u00e9 = "é" pronto; e + \u0301 = "e" seguido do acento separado.
  await register('joana@exemplo.com', 'caf\u00e9-com-leite');
  const res = await login('joana@exemplo.com', 'cafe\u0301-com-leite');
  assert.equal(res.status, 303);
  assert.equal(res.location, '/cofre');
});
