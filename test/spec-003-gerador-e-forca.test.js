// Testes de aceite da spec docs/specs/003-gerador-e-forca.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

let http;

before(async () => {
  http = await startServer(createApp({
    vaultService: createVaultService(createMemoryStore()),
    sessions: createSessionManager({ ttlMinutes: 15 }),
  }));
});

after(() => http.close());

const ALL_TYPES = { minusculas: 'on', maiusculas: 'on', numeros: 'on', simbolos: 'on' };
// Desfaz o escape do EJS (& < > " ') para comparar o texto da senha.
const unescape = (s) => s.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&#34;', '"').replaceAll('&#39;', "'").replaceAll('&amp;', '&');
const generated = (html) => {
  const value = html.match(/<input[^>]*id="gerada"[^>]*value="([^"]*)"/)?.[1];
  return value === undefined ? undefined : unescape(value);
};
const aviso = (html) => html.match(/class="aviso[^"]*"[^>]*>([^<]*)</)?.[1];
const strength = (html) => ({
  score: Number(html.match(/data-nota="(\d)"/)?.[1]),
  label: html.match(/class="forca[^"]*">([^<]*)</)?.[1],
});
const generate = (form) => http.post('/gerador', form);
const measure = (senha) => http.post('/forca', { senha });

test('CA-01 senha padrão: 16 caracteres, os quatro tipos, sem ambíguos e forte', async () => {
  assert.equal((await http.get('/gerador')).status, 200);
  const res = await generate({ tamanho: '16', ...ALL_TYPES });
  assert.equal(res.status, 200);
  const senha = generated(res.html);
  assert.equal(senha.length, 16);
  for (const type of [/[a-z]/, /[A-Z]/, /[2-9]/, /[!@#$%&*\-_=+?]/]) assert.match(senha, type);
  assert.doesNotMatch(senha, /[0O1lI]/);
  assert.equal(strength(res.html).label, 'forte');
});

test('CA-02 tamanho fora de 8..128 é recusado; nas bordas é aceito', async () => {
  for (const tamanho of ['7', '129']) {
    const res = await generate({ tamanho, ...ALL_TYPES });
    assert.equal(res.status, 400, `tamanho ${tamanho}`);
    assert.equal(aviso(res.html), 'O tamanho deve ser um número inteiro entre 8 e 128.');
  }
  for (const tamanho of [8, 128]) {
    const res = await generate({ tamanho: String(tamanho), ...ALL_TYPES });
    assert.equal(res.status, 200);
    assert.equal(generated(res.html).length, tamanho);
  }
});

test('CA-03 nenhum tipo marcado é recusado', async () => {
  const res = await generate({ tamanho: '16' });
  assert.equal(res.status, 400);
  assert.equal(aviso(res.html), 'Escolha pelo menos um tipo de caractere.');
});

test('CA-04 só números gera só dígitos de 2 a 9', async () => {
  const res = await generate({ tamanho: '10', numeros: 'on' });
  assert.match(generated(res.html), /^[2-9]{10}$/);
});

test('CA-05 senha com padrão comum é fraca, com a sugestão certa', async () => {
  const res = await measure('minhasenha123456');
  assert.equal(res.status, 200);
  assert.deepEqual(strength(res.html), { score: 0, label: 'fraca' });
  assert.ok(res.html.includes('Essa senha contém um padrão muito comum.'));
});

test('CA-06 senha longa com os quatro tipos é forte', async () => {
  assert.deepEqual(strength((await measure('Ab3$Cd5%Ef7&Gh9!')).html), { score: 4, label: 'forte' });
});

test('CA-07 a página do medidor não mostra a senha avaliada', async () => {
  const res = await measure('minha-senha-secreta');
  assert.ok(!res.html.includes('minha-senha-secreta'));
});

test('CA-08 duas gerações seguidas dão senhas diferentes', async () => {
  const a = generated((await generate({ tamanho: '16', ...ALL_TYPES })).html);
  const b = generated((await generate({ tamanho: '16', ...ALL_TYPES })).html);
  assert.notEqual(a, b);
});
