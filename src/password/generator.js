import { randomInt } from 'node:crypto';
import { AppError } from '../errors.js';

// Sem caracteres ambíguos (0/O, 1/l/I) para facilitar a digitação manual.
const CHARSETS = {
  lowercase: 'abcdefghijkmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  digits: '23456789',
  symbols: '!@#$%&*-_=+?',
};

const pick = (chars) => chars[randomInt(chars.length)];

export function generatePassword({
  length = 16,
  lowercase = true,
  uppercase = true,
  digits = true,
  symbols = true,
} = {}) {
  if (!Number.isInteger(length) || length < 8 || length > 128) {
    throw new AppError(400, 'O tamanho deve ser um número inteiro entre 8 e 128.');
  }

  const pools = Object.entries({ lowercase, uppercase, digits, symbols })
    .filter(([, enabled]) => enabled)
    .map(([name]) => CHARSETS[name]);
  if (pools.length === 0) {
    throw new AppError(400, 'Escolha pelo menos um tipo de caractere.');
  }

  // Garante ao menos um caractere de cada tipo escolhido e completa com o conjunto todo.
  const chars = pools.map(pick);
  const all = pools.join('');
  while (chars.length < length) chars.push(pick(all));

  // Fisher-Yates com aleatoriedade criptográfica.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
