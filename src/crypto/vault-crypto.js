import { randomBytes, scryptSync } from 'node:crypto';

// scrypt: N=2^15 deixa cada derivação entre ~60 e ~100 ms, conforme a máquina, o que encarece ataques de força bruta.
const SCRYPT_OPTIONS = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

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
