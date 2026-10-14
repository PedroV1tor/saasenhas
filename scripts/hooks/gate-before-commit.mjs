// Hook PreToolUse (Bash): antes de um `git commit`, roda npm test e npm run lint.
// Falha → exit 2: o commit não roda e a saída volta para o agente corrigir.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const command = input.tool_input?.command ?? '';

if (!/\bgit\s+commit\b/.test(command)) process.exit(0);

for (const check of ['npm test', 'npm run lint']) {
  // shell: true porque no Windows o npm é um .cmd.
  const result = spawnSync(check, { cwd: projectDir, encoding: 'utf8', shell: true });
  if (result.status !== 0) {
    const output = `${result.stdout}${result.stderr}`.split('\n').slice(-40).join('\n');
    process.stderr.write(`[hook commit] "${check}" falhou; o commit foi bloqueado. Corrija antes de commitar:\n${output}`);
    process.exitCode = 2;
    break;
  }
}

if (!process.exitCode) {
  process.stdout.write(JSON.stringify({ systemMessage: '[hook commit] npm test e npm run lint passaram' }));
}
