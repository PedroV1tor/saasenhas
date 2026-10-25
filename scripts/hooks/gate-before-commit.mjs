// Hook PreToolUse (Bash): antes de um `git commit`, roda npm test e npm run lint.
// Falha → exit 2: o commit não roda e a saída volta para o agente corrigir.
// Exceção do TDD: o commit do vermelho (mensagem `test(...)` e só arquivos de teste no stage)
// pode ter teste falhando, mas precisa ter pelo menos um falhando e passar no lint.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const command = input.tool_input?.command ?? '';

if (!/\bgit\s+commit\b/.test(command)) process.exit(0);

// shell: true porque no Windows o npm é um .cmd.
const run = (check) => spawnSync(check, { cwd: projectDir, encoding: 'utf8', shell: true });
const tail = (result) => `${result.stdout}${result.stderr}`.split('\n').slice(-40).join('\n');

const staged = run('git diff --cached --name-only').stdout.split('\n').filter(Boolean);
const onlyTests = staged.length > 0 && staged.every((file) => /^test(-support)?\//.test(file));
const isRed = /-m\s+["']test\(/.test(command) && onlyTests;

for (const check of ['npm test', 'npm run lint']) {
  const result = run(check);
  if (isRed && check === 'npm test') {
    if (result.status === 0) {
      process.stderr.write('[hook commit] commit do vermelho, mas todos os testes passam: o teste nasceu verde. Revise o teste antes de commitar.\n');
      process.exitCode = 2;
      break;
    }
    continue;
  }
  if (result.status !== 0) {
    process.stderr.write(`[hook commit] "${check}" falhou; o commit foi bloqueado. Corrija antes de commitar:\n${tail(result)}`);
    process.exitCode = 2;
    break;
  }
}

if (!process.exitCode) {
  const message = isRed
    ? '[hook commit] commit do vermelho: só testes no stage, há teste falhando e o lint passou'
    : '[hook commit] npm test e npm run lint passaram';
  process.stdout.write(JSON.stringify({ systemMessage: message }));
}
