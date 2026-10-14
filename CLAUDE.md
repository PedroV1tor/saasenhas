@AGENTS.md

## Específico do Claude Code
- **Permissões** (`.claude/settings.json`): `npm test` e `npm run lint` rodam sem perguntar; `git push`, `git commit` e `npm install` pedem confirmação; leitura e escrita de `.env` (e variantes) e `data/` são negadas. Se uma leitura for negada, não tente outro caminho (cat, type, copiar o arquivo) — use `.env.example`.
- **Hook PostToolUse**: depois de cada `Edit`/`Write` em `.js`, o ESLint roda no arquivo editado. Se o hook devolver erro, corrija antes do próximo passo.
- **Hook PreToolUse**: antes de `git commit`, `npm test` e `npm run lint` rodam; se falharem, o commit é bloqueado e a saída volta para você.
- **Skill `implementar-com-spec`**: use-a para qualquer funcionalidade nova ou mudança de comportamento.
- Para tarefas grandes, proponha um plano curto antes de editar.

## Commits
- Um commit por tarefa do plano. Mensagem: `tipo(spec): o que mudou (T#; CA-xx)` — ex.: `fix(001): corpo acima de 10 KB recebe 413 (T7; D-19, CA-14)`.
- **Sem** linha `Co-Authored-By` nem outra atribuição ao Claude, mesmo que a ferramenta sugira: a autoria é da equipe.
- Arquivo de script não pode começar com `test-` nem terminar em `.test.js`/`-test.js` fora de `test/`: o `node --test` o executa como teste.
