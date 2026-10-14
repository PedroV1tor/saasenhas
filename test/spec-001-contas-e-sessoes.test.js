// Testes de aceite da spec docs/specs/001-contas-e-sessoes.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

let http;

before(async () => {
  http = await startServer(createApp({
    vaultService: createVaultService(createMemoryStore()),
  }));
});

after(() => http.close());

const register = (email, senhaMestra) => http.post('/cadastro', { email, senhaMestra });

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

test('CA-04 e-mail fora do formato é recusado no cadastro', async () => {
  for (const email of ['ana', 'ana@exemplo', 'ana @exemplo.com', '', undefined]) {
    const res = await register(email, 'senha-mestra-valida');
    assert.equal(res.status, 400, `cadastro com ${JSON.stringify(email)}`);
    assert.equal(aviso(res.html), 'Informe um e-mail válido.');
  }
});
