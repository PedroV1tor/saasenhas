# Harness do SaaSenhas — ESW442

Harness usado: **Claude Code**.

| # | Artefato | Onde | Problema que resolve |
|---|---|---|---|
| 1 | AGENTS.md (≤ 1 página, 4 princípios) | [`/AGENTS.md`](../../AGENTS.md) | O agente começa cada sessão sem saber comandos, stack e regras de segurança |
| 2 | 1º relatório Better Harness + achado + commit do reparo | [`relatorio-1.md`](relatorio-1.md), [`reparo-1.md`](reparo-1.md) | Medir o harness antes de mexer |
| 3 | CLAUDE.md importando o AGENTS.md | [`/CLAUDE.md`](../../CLAUDE.md) | O Claude Code só carrega sozinho o `CLAUDE.md` |
| 4 | Permissões (allow / ask / deny) | [`/.claude/settings.json`](../../.claude/settings.json) | A regra "nunca leia `.env`/`data/`" deixa de depender da obediência do modelo; commit e push passam pela equipe |
| 5 | Skill da equipe | [`/.claude/skills/implementar-com-spec/SKILL.md`](../../.claude/skills/implementar-com-spec/SKILL.md) | O agente pulava direto para o código; a skill impõe spec → teste → código → prova |
| 6 | Hook PostToolUse (Edit\|Write → ESLint) | [`/.claude/settings.json`](../../.claude/settings.json) + [`/scripts/hooks/lint-on-edit.mjs`](../../scripts/hooks/lint-on-edit.mjs) | Erro de lint só aparecia no fim; o hook devolve o erro na hora da edição |

## Antes × depois no git
- Tag **`aula08`** — spec 001 revisada + `AGENTS.md`, **sem** código, CLAUDE.md, permissões, skill nem hook. É aqui que roda o **1º relatório**.
- Commits seguintes — reparo do achado (Aula 08) e configuração da Aula 09.
