import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionManager } from '../src/auth/sessions.js';

test('cada sessão recebe uma credencial nova e opaca', () => {
  const sessions = createSessionManager({ ttlMinutes: 15 });
  const a = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  const b = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  assert.notEqual(a, b);
  assert.match(a, /^[A-Za-z0-9_-]{43}$/);
});

test('a sessão expira no instante exato do fim do prazo', () => {
  let clock = 0;
  const sessions = createSessionManager({ ttlMinutes: 1, now: () => clock });
  const token = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  clock = 59_999;
  assert.equal(sessions.get(token).email, 'ana@exemplo.com');
  clock = 60_000;
  assert.equal(sessions.get(token), null);
});

test('destroy encerra só a sessão indicada', () => {
  const sessions = createSessionManager({ ttlMinutes: 15 });
  const a = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  const b = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  sessions.destroy(a);
  assert.equal(sessions.get(a), null);
  assert.ok(sessions.get(b));
});
