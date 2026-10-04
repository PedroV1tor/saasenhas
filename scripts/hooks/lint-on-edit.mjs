// Hook PostToolUse (Edit|Write): roda o ESLint no arquivo .js que o agente acabou de editar.
// Sucesso → mensagem visível na sessão. Falha → exit 2, e o erro volta para o agente corrigir.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const filePath = input.tool_input?.file_path;

if (!filePath || !['.js', '.mjs', '.cjs'].includes(extname(filePath))) process.exit(0);

const rel = relative(projectDir, resolve(projectDir, filePath)).replaceAll('\\', '/');
if (rel.startsWith('..')) process.exit(0);

const eslint = resolve(projectDir, 'node_modules/eslint/bin/eslint.js');
const result = spawnSync(process.execPath, [eslint, rel], { cwd: projectDir, encoding: 'utf8' });

// exitCode em vez de process.exit(): no Windows, exit() pode cortar a saída antes de ela ser escrita no pipe.
if (result.status === 0) {
  process.stdout.write(JSON.stringify({ systemMessage: `[hook lint] ESLint OK em ${rel}` }));
} else {
  const details = result.error ? `${result.error.message} (rode npm install)` : `${result.stdout}${result.stderr}`;
  process.stderr.write(`[hook lint] ESLint encontrou problemas em ${rel}. Corrija antes de continuar:\n${details}`);
  process.exitCode = 2;
}
