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
const shownPassword = (html) => html.match(/<input[^>]*id="senha"[^>]*value="([^"]*)"/)?.[1];
const create = (cookie, entry) => http.post('/cofre/entradas', entry, { cookie });
// Cria a entrada e devolve o id dela (o último link de detalhe da lista).
async function createAndGetId(cookie, entry) {
  await create(cookie, entry);
  const ids = [...(await http.get('/cofre', { cookie })).html.matchAll(/href="\/cofre\/entradas\/([\w-]+)"/g)];
  return ids.at(-1)[1];
}

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

test('CA-02 o detalhe mostra a senha exatamente como digitada', async () => {
  const cookie = await http.signUpAndLogin('bia@exemplo.com');
  const id = await createAndGetId(cookie, { site: 'x.com', usuario: 'bia', senha: '  com espaços  ' });
  const detail = await http.get(`/cofre/entradas/${id}`, { cookie });
  assert.equal(detail.status, 200);
  assert.equal(shownPassword(detail.html), '  com espaços  ');
});

test('CA-03 campos obrigatórios e tamanho máximo', async () => {
  const cookie = await http.signUpAndLogin('caio@exemplo.com');
  const cases = [
    [{ site: '', usuario: 'caio', senha: 'x' }, 'O campo "site" é obrigatório.'],
    [{ site: 'a.com', usuario: 'caio', senha: '' }, 'O campo "senha" é obrigatório.'],
    [{ site: 's'.repeat(201), usuario: 'caio', senha: 'x' }, 'O campo "site" aceita no máximo 200 caracteres.'],
  ];
  for (const [entry, message] of cases) {
    const res = await create(cookie, entry);
    assert.equal(res.status, 400);
    assert.equal(aviso(res.html).replaceAll('&#34;', '"'), message);
  }
});

test('CA-04 editar com a senha em branco mantém a senha; com senha nova, troca', async () => {
  const cookie = await http.signUpAndLogin('dani@exemplo.com');
  const id = await createAndGetId(cookie, { site: 'y.com', usuario: 'dani', senha: 'senha-antiga' });

  const keep = await http.post(`/cofre/entradas/${id}`, { site: 'y.com', usuario: 'dani2', senha: '' }, { cookie });
  assert.equal(keep.status, 303);
  assert.equal(keep.location, `/cofre/entradas/${id}?aviso=salva`);
  const afterKeep = await http.get(keep.location, { cookie });
  assert.equal(aviso(afterKeep.html), 'Alterações salvas.');
  assert.ok(afterKeep.html.includes('dani2'));
  assert.equal(shownPassword(afterKeep.html), 'senha-antiga');

  await http.post(`/cofre/entradas/${id}`, { site: 'y.com', usuario: 'dani2', senha: 'senha-nova' }, { cookie });
  assert.equal(shownPassword((await http.get(`/cofre/entradas/${id}`, { cookie })).html), 'senha-nova');
});

test('CA-05 excluir remove a entrada', async () => {
  const cookie = await http.signUpAndLogin('edu@exemplo.com');
  const id = await createAndGetId(cookie, { site: 'z.com', usuario: 'edu', senha: 'x' });
  const res = await http.post(`/cofre/entradas/${id}/excluir`, {}, { cookie });
  assert.equal(res.status, 303);
  assert.equal(res.location, '/cofre?aviso=excluida');
  const detail = await http.get(`/cofre/entradas/${id}`, { cookie });
  assert.equal(detail.status, 404);
  assert.equal(aviso(detail.html), 'Entrada não encontrada.');
});

test('CA-06 o arquivo do cofre não contém a senha em texto puro', async () => {
  const cookie = await http.signUpAndLogin('fe@exemplo.com');
  await create(cookie, { site: 'w.com', usuario: 'fe', senha: 'senha-que-nao-pode-vazar' });
  const file = await readFile(dataFile, 'utf8');
  assert.ok(file.includes('w.com'));
  assert.ok(!file.includes('senha-que-nao-pode-vazar'));
});

test('CA-08 uma conta não vê, não edita e não exclui a entrada de outra', async () => {
  const owner = await http.signUpAndLogin('hana@exemplo.com');
  const intruder = await http.signUpAndLogin('ivo@exemplo.com');
  const id = await createAndGetId(owner, { site: 'banco.com', usuario: 'hana', senha: 'segredo-da-hana' });
  const attempts = [
    await http.get(`/cofre/entradas/${id}`, { cookie: intruder }),
    await http.get(`/cofre/entradas/${id}/editar`, { cookie: intruder }),
    await http.post(`/cofre/entradas/${id}`, { site: 'h4ck', usuario: 'ivo', senha: '' }, { cookie: intruder }),
    await http.post(`/cofre/entradas/${id}/excluir`, {}, { cookie: intruder }),
  ];
  for (const res of attempts) {
    assert.equal(res.status, 404);
    assert.equal(aviso(res.html), 'Entrada não encontrada.');
  }
  const detail = await http.get(`/cofre/entradas/${id}`, { cookie: owner });
  assert.ok(detail.html.includes('banco.com'));
  assert.equal(shownPassword(detail.html), 'segredo-da-hana');
});

test('CA-09 páginas do cofre exigem sessão', async () => {
  for (const res of [await http.get('/cofre/nova'), await http.post('/cofre/entradas', { site: 'a', usuario: 'b', senha: 'c' })]) {
    assert.equal(res.status, 303);
    assert.equal(res.location, '/entrar?motivo=login');
  }
});
