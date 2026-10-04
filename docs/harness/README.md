# Harness do SaaSenhas — ESW442

Harness usado: **Claude Code**.

| # | Artefato | Onde |
|---|---|---|
| 1 | AGENTS.md (≤ 1 página, 4 princípios) | [`/AGENTS.md`](../../AGENTS.md) |
| 2 | 1º relatório Better Harness + achado + commit do reparo | [`relatorio-1.md`](relatorio-1.md), [`reparo-1.md`](reparo-1.md) |
| 3 | CLAUDE.md importando o AGENTS.md | [`/CLAUDE.md`](../../CLAUDE.md) |
| 4 | Permissões (allow / ask / deny) | [`/.claude/settings.json`](../../.claude/settings.json) |
| 5 | Skill da equipe | [`/.claude/skills/implementar-com-spec/SKILL.md`](../../.claude/skills/implementar-com-spec/SKILL.md) |
| 6 | Hook PostToolUse (Edit\|Write → ESLint) | [`/.claude/settings.json`](../../.claude/settings.json) + [`/scripts/hooks/lint-on-edit.mjs`](../../scripts/hooks/lint-on-edit.mjs) |
| 7 | 2º relatório + comparação | [`relatorio-2.md`](relatorio-2.md) |
| — | Provas de que funciona + leitura honesta | [`evidencias.md`](evidencias.md) |

## Antes × depois no git
- Tag **`aula08`** — projeto + `AGENTS.md`, **sem** CLAUDE.md, permissões, skill nem hook. É aqui que roda o **1º relatório**.
- Commits seguintes — reparo do achado (Aula 08) e configuração da Aula 09. Depois deles roda o **2º relatório**.

## Roteiro para a equipe
1. `git checkout aula08` → abrir o Claude Code na pasta → rodar o Better Harness → colar em `relatorio-1.md`.
2. Escolher **um** achado, aplicar o reparo, commitar e anotar o hash em `reparo-1.md`.
3. `git checkout main` (já tem a configuração da Aula 09) → coletar as provas de `evidencias.md` numa **sessão nova**.
4. Rodar o Better Harness de novo → `relatorio-2.md` → preencher a comparação e a leitura honesta.
