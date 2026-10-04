import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSessionManager } from '../src/auth/sessions.js';

test('sessão expira depois do TTL', () => {
  let clock = 0;
  const sessions = createSessionManager({ ttlMinutes: 15, now: () => clock });
  const token = sessions.create('ana@exemplo.com', Buffer.alloc(32));

  clock = 14 * 60 * 1000;
  assert.equal(sessions.get(token).email, 'ana@exemplo.com');

  clock = 15 * 60 * 1000;
  assert.equal(sessions.get(token), null);
});

test('destroy encerra a sessão', () => {
  const sessions = createSessionManager({ ttlMinutes: 15 });
  const token = sessions.create('ana@exemplo.com', Buffer.alloc(32));
  sessions.destroy(token);
  assert.equal(sessions.get(token), null);
});
