const COMMON_PATTERNS = ['123456', 'password', 'senha', 'qwerty', 'abc123', '111111', 'iloveyou', 'admin'];

// Heurística simples (0 a 4) — suficiente para orientar o usuário, não é uma auditoria.
export function evaluateStrength(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return { score: 0, label: 'fraca', suggestions: ['Informe uma senha.'] };
  }

  const suggestions = [];
  let score = 0;

  if (password.length >= 8) score++;
  else suggestions.push('Use pelo menos 8 caracteres.');

  if (password.length >= 14) score++;
  else suggestions.push('Senhas com 14 ou mais caracteres são bem mais difíceis de quebrar.');

  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  if (classes >= 3) score++;
  else suggestions.push('Misture letras maiúsculas, minúsculas, números e símbolos.');
  if (classes === 4) score++;

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    suggestions.push('Evite repetir o mesmo caractere em sequência.');
  }

  const lower = password.toLowerCase();
  if (COMMON_PATTERNS.some((pattern) => lower.includes(pattern))) {
    score = 0;
    suggestions.push('Essa senha contém um padrão muito comum.');
  }

  const label = score <= 1 ? 'fraca' : score === 2 ? 'média' : 'forte';
  return { score, label, suggestions };
}
