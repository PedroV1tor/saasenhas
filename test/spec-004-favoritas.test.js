// Testes de aceite da spec docs/specs/004-favoritas.md — um teste por critério (CA-xx).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createSessionManager } from '../src/auth/sessions.js';
import { createMemoryStore } from '../src/vault/store.js';
import { createVaultService } from '../src/vault/vault-service.js';
import { startServer } from '../test-support/http.js';

let http;
const store = createMemoryStore();

before(async () => {
  http = await startServer(createApp({
    vaultService: createVaultService(store),
    sessions: createSessionManager({ ttlMinutes: 15 }),
  }));
});

after(() => http.close());

const aviso = (html) => html.match(/class="aviso[^"]*"[^>]*>([^<]*)</)?.[1];
const shownPassword = (html) => html.match(/<input[^>]*id="senha"[^>]*value="([^"]*)"/)?.[1];
const create = (cookie, entry) => http.post('/cofre/entradas', entry, { cookie });

// Linhas da lista do cofre: { site, favorita, id }.
async function rows(cookie, path = '/cofre') {
  const html = (await http.get(path, { cookie })).html;
  return [...html.matchAll(/<tr data-favorita="(true|false)" data-id="([\w-]+)">[\s\S]*?<td class="site">([^<]*)<\/td>/g)]
    .map(([, favorita, id, site]) => ({ site, favorita: favorita === 'true', id }));
}
const rowOf = async (cookie, site) => (await rows(cookie)).find((r) => r.site === site);
const star = (cookie, id, favorita) => http.post(`/cofre/entradas/${id}/favorita`, { favorita }, { cookie });

test('CA-01 a caixa "Favorita" define se a entrada nova é favorita', async () => {
  const cookie = await http.signUpAndLogin('ana@exemplo.com');
  await create(cookie, { site: 'a.com', usuario: 'ana', senha: 'x' });
  await create(cookie, { site: 'b.com', usuario: 'ana', senha: 'y', favorita: 'on' });
  assert.equal((await rowOf(cookie, 'a.com')).favorita, false);
  assert.equal((await rowOf(cookie, 'b.com')).favorita, true);
});

test('CA-02 a estrela marca e desmarca sem mexer no resto', async () => {
  const cookie = await http.signUpAndLogin('bia@exemplo.com');
  await create(cookie, { site: 'c.com', usuario: 'bia', senha: 'senha-c' });
  const { id } = await rowOf(cookie, 'c.com');

  const on = await star(cookie, id, 'true');
  assert.equal(on.status, 303);
  assert.equal(on.location, '/cofre');
  assert.equal((await rowOf(cookie, 'c.com')).favorita, true);

  const off = await star(cookie, id, 'false');
  assert.equal(off.location, '/cofre');
  assert.equal((await rowOf(cookie, 'c.com')).favorita, false);

  const detail = await http.get(`/cofre/entradas/${id}`, { cookie });
  assert.ok(detail.html.includes('c.com'));
  assert.equal(shownPassword(detail.html), 'senha-c');
});

test('CA-03 o filtro mostra só as favoritas, sem senha', async () => {
  const cookie = await http.signUpAndLogin('caio@exemplo.com');
  await create(cookie, { site: 'd.com', usuario: 'caio', senha: 'senha-do-d', favorita: 'on' });
  await create(cookie, { site: 'e.com', usuario: 'caio', senha: 'senha-do-e' });
  const page = await http.get('/cofre?favoritas=1', { cookie });
  assert.deepEqual((await rows(cookie, '/cofre?favoritas=1')).map((r) => r.site), ['d.com']);
  assert.ok(!page.html.includes('senha-do-d'));
  assert.ok(!page.html.includes('senha-do-e'));
});

test('CA-04 entrada gravada sem o campo aparece como não favorita e pode ser marcada', async () => {
  const cookie = await http.signUpAndLogin('dani@exemplo.com');
  await create(cookie, { site: 'antiga.com', usuario: 'dani', senha: 'x' });
  const data = await store.load();
  delete data.users['dani@exemplo.com'].entries[0].favorite;
  await store.save(data);

  const row = await rowOf(cookie, 'antiga.com');
  assert.equal(row.favorita, false);
  await star(cookie, row.id, 'true');
  assert.equal((await rowOf(cookie, 'antiga.com')).favorita, true);
});

test('CA-05 valor inválido na estrela é recusado', async () => {
  const cookie = await http.signUpAndLogin('edu@exemplo.com');
  await create(cookie, { site: 'g.com', usuario: 'edu', senha: 'x' });
  const res = await star(cookie, (await rowOf(cookie, 'g.com')).id, 'talvez');
  assert.equal(res.status, 400);
  assert.equal(aviso(res.html).replaceAll('&#34;', '"'), 'O campo "favorita" precisa ser true ou false.');
});

test('CA-06 editar desmarcando a caixa tira a favorita e mantém a senha', async () => {
  const cookie = await http.signUpAndLogin('fe@exemplo.com');
  await create(cookie, { site: 'f.com', usuario: 'fe', senha: 'senha-f', favorita: 'on' });
  const { id } = await rowOf(cookie, 'f.com');
  await http.post(`/cofre/entradas/${id}`, { site: 'f.com', usuario: 'fe', senha: '' }, { cookie });
  assert.equal((await rowOf(cookie, 'f.com')).favorita, false);
  assert.equal(shownPassword((await http.get(`/cofre/entradas/${id}`, { cookie })).html), 'senha-f');
});
