import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newSalt, deriveKeys, verifyMasterPassword, encrypt, decrypt } from '../src/crypto/vault-crypto.js';

test('cifra e decifra de volta o mesmo texto', () => {
  const { encryptionKey } = deriveKeys('senha-mestra-longa', newSalt());
  const payload = encrypt('minha-senha-do-banco', encryptionKey);
  assert.notEqual(payload, 'minha-senha-do-banco');
  assert.equal(decrypt(payload, encryptionKey), 'minha-senha-do-banco');
});

test('o mesmo texto gera cifras diferentes (IV aleatório)', () => {
  const { encryptionKey } = deriveKeys('senha-mestra-longa', newSalt());
  assert.notEqual(encrypt('abc', encryptionKey), encrypt('abc', encryptionKey));
});

test('chave errada não decifra', () => {
  const salt = newSalt();
  const right = deriveKeys('senha-mestra-certa', salt).encryptionKey;
  const wrong = deriveKeys('senha-mestra-errada', salt).encryptionKey;
  assert.throws(() => decrypt(encrypt('segredo', right), wrong));
});

test('verifyMasterPassword devolve a chave só com a senha certa', () => {
  const salt = newSalt();
  const { verifier, encryptionKey } = deriveKeys('senha-mestra-certa', salt);
  assert.deepEqual(verifyMasterPassword('senha-mestra-certa', salt, verifier), encryptionKey);
  assert.equal(verifyMasterPassword('senha-mestra-errada', salt, verifier), null);
});

test('o verificador salvo é diferente da chave de cifragem', () => {
  const { verifier, encryptionKey } = deriveKeys('senha-mestra-longa', newSalt());
  assert.notEqual(verifier, encryptionKey.toString('base64'));
});
