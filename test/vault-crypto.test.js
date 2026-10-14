import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSalt, deriveKeys } from '../src/crypto/vault-crypto.js';

test('a mesma senha com o mesmo sal gera a mesma chave e o mesmo verificador', () => {
  const salt = newSalt();
  const a = deriveKeys('senha-mestra-teste', salt);
  const b = deriveKeys('senha-mestra-teste', salt);
  assert.deepEqual(a.encryptionKey, b.encryptionKey);
  assert.equal(a.verifier, b.verifier);
  assert.equal(a.encryptionKey.length, 32);
});

test('sal diferente gera chave diferente', () => {
  assert.notEqual(deriveKeys('senha-mestra-teste', newSalt()).verifier, deriveKeys('senha-mestra-teste', newSalt()).verifier);
});

test('o verificador não é a chave de cifragem', () => {
  const { encryptionKey, verifier } = deriveKeys('senha-mestra-teste', newSalt());
  assert.notEqual(encryptionKey.toString('base64'), verifier);
});

test('variantes NFKC da mesma senha geram a mesma chave (RN-05)', () => {
  const salt = newSalt();
  assert.equal(deriveKeys('ﬁrme-Ａ', salt).verifier, deriveKeys('firme-A', salt).verifier);
});
