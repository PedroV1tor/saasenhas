@AGENTS.md

## Específico do Claude Code
- **Permissões** (`.claude/settings.json`): `npm test` e `npm run lint` rodam sem perguntar; `git push`, `git commit` e `npm install` pedem confirmação; `.env*` e `data/` são negados. Se uma leitura for negada, não tente outro caminho (cat, type, copiar o arquivo) — use `.env.example`.
- **Hook PostToolUse**: depois de cada `Edit`/`Write` em `.js`, o ESLint roda no arquivo editado. Se o hook devolver erro, corrija antes do próximo passo.
- **Skill `implementar-com-spec`**: use-a para qualquer funcionalidade nova ou mudança de comportamento.
- Para tarefas grandes, proponha um plano curto antes de editar.
