import { randomBytes, scryptSync, timingSafeEqual, createCipheriv } from 'node:crypto';

// scrypt: N=2^15 deixa cada derivação entre ~60 e ~100 ms, conforme a máquina, o que encarece ataques de força bruta.
const SCRYPT_OPTIONS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const ALGORITHM = 'aes-256-gcm';

export function newSalt() {
  return randomBytes(16).toString('base64');
}

// Uma única derivação gera 64 bytes: os 32 primeiros cifram o cofre e os 32 últimos
// servem só para verificar a senha mestra. Assim o verificador salvo não revela a chave.
// NFKC antes de derivar: a mesma senha digitada em teclados diferentes vira os mesmos bytes (RN-05).
export function deriveKeys(masterPassword, salt) {
  const material = scryptSync(masterPassword.normalize('NFKC'), Buffer.from(salt, 'base64'), 64, SCRYPT_OPTIONS);
  return {
    encryptionKey: material.subarray(0, 32),
    verifier: material.subarray(32).toString('base64'),
  };
}

// Devolve a chave de cifragem se a senha mestra confere; caso contrário, null.
export function verifyMasterPassword(masterPassword, salt, expectedVerifier) {
  const { encryptionKey, verifier } = deriveKeys(masterPassword, salt);
  const actual = Buffer.from(verifier, 'base64');
  const expected = Buffer.from(expectedVerifier, 'base64');
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? encryptionKey : null;
}

// Spec 002, RN-01: IV aleatório a cada cifragem; o resultado é "iv.tag.dados" em base64.
export function encrypt(plaintext, key) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64')).join('.');
}
