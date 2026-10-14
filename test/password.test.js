import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword } from '../src/password/generator.js';
import { evaluateStrength } from '../src/password/strength.js';

test('gera senha com 16 caracteres por padrão, com todos os tipos', () => {
  const password = generatePassword();
  assert.equal(password.length, 16);
  assert.match(password, /[a-z]/);
  assert.match(password, /[A-Z]/);
  assert.match(password, /\d/);
  assert.match(password, /[^A-Za-z0-9]/);
});

test('respeita o tamanho e os tipos escolhidos', () => {
  const password = generatePassword({ length: 24, uppercase: false, symbols: false });
  assert.equal(password.length, 24);
  assert.match(password, /^[a-z0-9]+$/);
});

test('não usa caracteres ambíguos', () => {
  for (let i = 0; i < 50; i++) assert.doesNotMatch(generatePassword({ length: 64 }), /[0O1lI]/);
});

test('recusa tamanho fora de 8..128 e nenhum tipo marcado', () => {
  assert.throws(() => generatePassword({ length: 7 }), /entre 8 e 128/);
  assert.throws(() => generatePassword({ length: 129 }), /entre 8 e 128/);
  assert.throws(
    () => generatePassword({ lowercase: false, uppercase: false, digits: false, symbols: false }),
    /pelo menos um tipo/,
  );
});

test('senhas comuns são fracas', () => {
  assert.equal(evaluateStrength('123456').label, 'fraca');
  assert.equal(evaluateStrength('MinhaSenha123456!').label, 'fraca');
});

test('senha gerada é forte', () => {
  assert.equal(evaluateStrength(generatePassword()).label, 'forte');
});

test('senha vazia é fraca e traz sugestão', () => {
  const result = evaluateStrength('');
  assert.equal(result.score, 0);
  assert.ok(result.suggestions.length > 0);
});
